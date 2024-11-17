/* eslint-disable prettier/prettier */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateQuestionSchema,
  QuestionTagDto,
  QuestionTagSchema,
} from './question.dto';
import { decrypt, decryptOptionsText } from 'prisma/encryption/crypto.utils';
import {
  checkExisting,
  formatOptions,
  getUpdateData,
  saveCSVSToDB,
  saveQuestion,
} from 'prisma/seed-csv-utils';
import { S3Service } from 'src/s3/s3.service';
import { envConfig } from 'src/shared/config/app.config';
import { promises as fsPromises } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}
  async createQuestion(createQuestionDto: any) {
    CreateQuestionSchema.parse(createQuestionDto);

    await checkExisting('mCQQA', createQuestionDto, this.prisma);
    await checkExisting('mCQPsychometricQA', createQuestionDto, this.prisma);
    await checkExisting(
      'mCQPsychometricOptionsQA',
      createQuestionDto,
      this.prisma,
    );

    if (createQuestionDto.mCQQA) {
      const { options, answer, stick } = createQuestionDto.mCQQA;
      const { options: formattedOptions, answerID } = formatOptions(
        options,
        answer,
        stick,
      );
      createQuestionDto.mCQQA.options = formattedOptions;
      createQuestionDto.mCQQA.answer = answerID;
    }

    return await saveQuestion(this.prisma, createQuestionDto);
  }

  async editQuestion(id: number, editQuestionDto: any) {
    try {
      CreateQuestionSchema.parse(editQuestionDto);
    } catch (error) {
      throw new ConflictException(error.errors);
    }

    const existingQuestion = await this.prisma.question.findUnique({
      where: { id: id },
      include: {
        mCQQA: true,
        mCQPsychometricQA: true,
        mCQPsychometricOptionsQA: true,
      },
    });

    if (!existingQuestion) {
      throw new NotFoundException('Question not found');
    }

    const updatedData = getUpdateData(editQuestionDto, existingQuestion);

    return this.prisma.question.update({
      where: { id },
      data: updatedData,
    });
  }

  async createQuestionTag(questionTagDto: QuestionTagDto) {
    try {
      QuestionTagSchema.parse(questionTagDto);
    } catch (error) {
      throw new ConflictException(error.errors);
    }

    const existingTag = await this.prisma.questionTag.findUnique({
      where: { name: questionTagDto.name },
    });

    if (existingTag) {
      throw new ConflictException('Question tag already exists');
    }

    return this.prisma.questionTag.create({
      data: { name: questionTagDto.name },
    });
  }

  async editQuestionTag(id: number, questionTagDto: QuestionTagDto) {
    try {
      QuestionTagSchema.parse(questionTagDto);
    } catch (error) {
      throw new ConflictException(error.errors);
    }

    const existingTag = await this.prisma.questionTag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException('Question tag not found');
    }

    return this.prisma.questionTag.update({
      where: { id },
      data: questionTagDto,
    });
  }

  async getAllQuestions() {
    const questions = await this.prisma.question.findMany({
      include: {
        mCQQA: true,
        mCQPsychometricQA: {
          include: {
            traitType: true,
          },
        },
        mCQPsychometricOptionsQA: true,
      },
    });

    const formattedQuestions = await Promise.all(
      questions.map(async (question) => ({
        ...question,
        mCQQA: question.mCQQA
          ? {
              ...question.mCQQA,
              text: decrypt(question.mCQQA.text),
              options: decryptOptionsText(question.mCQQA.options),
              triviaContent: decrypt(question.mCQQA.triviaContent),
              imageUrl: await this.getImageUrl(question.mCQQA.imageUrl),
            }
          : null,
        mCQPsychometricQA: question.mCQPsychometricQA
          ? {
              ...question.mCQPsychometricQA,
              text: decrypt(question.mCQPsychometricQA.text),
            }
          : null,
        mCQPsychometricOptionsQA: question.mCQPsychometricOptionsQA
          ? {
              ...question.mCQPsychometricOptionsQA,
              text: decrypt(question.mCQPsychometricOptionsQA.text),
              options: decryptOptionsText(
                question.mCQPsychometricOptionsQA.options,
              ),
            }
          : null,
      })),
    );

    return formattedQuestions;
  }

  async getAllQuestionTags() {
    return this.prisma.questionTag.findMany();
  }

  async getAllTraits() {
    return this.prisma.traitType.findMany();
  }

  async getAllTaxonomy() {
    return this.prisma.taxonomy.findMany();
  }

  async updateIsActiveQuestion(
    questionId: number,
    updateIsActiveQuestion: any,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(
        `Question with id ${questionId} doesn't exists!`,
      );
    }

    await this.prisma.question.update({
      where: { id: questionId },
      data: { ...updateIsActiveQuestion },
    });
  }

  async saveCSVToDB(filePath: string) {
    const { questionToBeAdded, invalidQuestion } = await saveCSVSToDB(
      this.prisma,
      this.s3Service,
      filePath,
    );

    return {
      questionAddedCount: questionToBeAdded.length,
      invalidDataCount: invalidQuestion.length,
      questionAdded: questionToBeAdded,
      invalidData: [...new Set(invalidQuestion)],
    };
  }

  async uploadSVG(file) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.toLowerCase().endsWith('.svg')) {
      throw new BadRequestException('File must have .svg extension');
    }

    if (file.mimetype !== 'image/svg+xml') {
      throw new BadRequestException('File must be SVG type');
    }

    const filePath = file.path;

    try {
      const buffer = await fsPromises.readFile(filePath);
      const contentType = 'image/svg+xml';
      const bucketName = envConfig.S3.creativePotentialBucket;
      const fileKey = `${uuidv4()}.svg`;

      await this.s3Service.uploadFileToS3(
        bucketName,
        fileKey,
        buffer,
        contentType,
      );

      const signedUrl = await this.s3Service.getSignedFileUrl(
        fileKey,
        bucketName,
      );
      await fsPromises.unlink(filePath);
      return { fileKey, signedUrl };
    } catch (error) {
      await fsPromises.unlink(filePath).catch(() => {});
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }

  async deleteQuestion(id: number) {
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      throw new NotFoundException('Question not found');
    }

    try {
      await this.prisma.question.update({
        where: { id },
        data: { isActive: false },
      });

      return { message: 'Question successfully deleted' };
    } catch (error) {
      throw new Error(`Error deleting question: ${error.message}`);
    }
  }

  async getImageUrl(fileKey: string) {
    if (envConfig.env === 'DEV') {
      return fileKey;
    } else {
      if (fileKey != null) {
        const url = await this.s3Service.getSignedFileUrl(
          fileKey,
          envConfig.S3.creativePotentialBucket,
        );
        return url;
      } else {
        return null;
      }
    }
  }
}
