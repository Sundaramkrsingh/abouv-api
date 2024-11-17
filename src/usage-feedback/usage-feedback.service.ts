import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { envConfig } from 'src/shared/config/app.config';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsageFeedbackService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async create(userId: number, feedbackData: any) {
    return this.prismaService.usageFeedback.create({
      data: {
        userId,
        ...feedbackData,
      },
    });
  }

  async uploadFeedbackImage(file) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const mimeToExtensionMap: { [key: string]: string } = {
      'image/jpeg': '.jpeg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
    };

    const extension = mimeToExtensionMap[file.mimetype];

    if (!extension) {
      throw new BadRequestException('Unsupported file type');
    }

    const fileKey = `${uuidv4()}${extension}`;

    try {
      const buffer = file.buffer;
      const contentType = file.mimetype;
      const bucketName = envConfig.S3.feedbackImageBucket;

      await this.s3Service.uploadFileToS3(
        bucketName,
        fileKey,
        buffer,
        contentType,
      );

      return { fileKey };
    } catch (error) {
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }
}
