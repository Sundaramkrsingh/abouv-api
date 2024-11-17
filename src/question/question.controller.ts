/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import {
  CreateQuestionDto,
  IsActiveQuestionDtoSchema,
  isActiveQuestionDtoSchema,
  QuestionTagDto,
} from './question.dto';
import { ApiBody, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import {
  CreateQuestionDtoSwaggerSchema,
  isActiveQuestionDtoSwaggerSchema,
  questionTagDtoSwaggerSchema,
  saveCSVToDBDtoSwaggerSchema,
} from './question.swagger.schema';
import {
  CreateQuestionDtoExample,
  CreateQuestionTagDtoExample,
  EditQuestionDtoExample,
  EditQuestionTagDtoExample,
} from './question.swagger.example';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('question')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @ApiBody({
    schema: CreateQuestionDtoSwaggerSchema,
    examples: CreateQuestionDtoExample,
  })
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.createQuestion(createQuestionDto);
  }

  @Patch(':id')
  @ApiBody({
    schema: CreateQuestionDtoSwaggerSchema,
    examples: EditQuestionDtoExample,
  })
  async editQuestion(
    @Param('id') id: string,
    @Body() editQuestionDto: CreateQuestionDto,
  ) {
    const editedQuestion = await this.questionService.editQuestion(
      +id,
      editQuestionDto,
    );
    if (!editedQuestion) {
      throw new NotFoundException('Question not found');
    }
    return editedQuestion;
  }

  @Get()
  async getAllQuestions() {
    return this.questionService.getAllQuestions();
  }

  @Post('tags')
  @ApiBody({
    schema: questionTagDtoSwaggerSchema,
    examples: CreateQuestionTagDtoExample,
  })
  async createQuestionTag(@Body() questionTagDto: QuestionTagDto) {
    return this.questionService.createQuestionTag(questionTagDto);
  }

  @Patch('tags/:id')
  @ApiBody({
    schema: questionTagDtoSwaggerSchema,
    examples: EditQuestionTagDtoExample,
  })
  async editQuestionTag(
    @Param('id') id: string,
    @Body() questionTagDto: QuestionTagDto,
  ) {
    const editedTag = await this.questionService.editQuestionTag(
      +id,
      questionTagDto,
    );
    if (!editedTag) {
      throw new NotFoundException('Question tag not found');
    }
    return editedTag;
  }

  @Get('tags')
  async getAllQuestionTags() {
    return this.questionService.getAllQuestionTags();
  }

  @Get('traits')
  async getAllTraits() {
    return this.questionService.getAllTraits();
  }

  @Get('taxonomy')
  async getAllTaxonomy() {
    return this.questionService.getAllTaxonomy();
  }

  @Patch(':questionId/isActive')
  @ApiBody({
    schema: isActiveQuestionDtoSwaggerSchema,
  })
  updateIsActiveQuestion(
    @Param('questionId') questionId: string,
    @Body() updateIsActiveQuestion: IsActiveQuestionDtoSchema,
  ) {
    const validatedData = isActiveQuestionDtoSchema.parse(
      updateIsActiveQuestion,
    );
    return this.questionService.updateIsActiveQuestion(
      +questionId,
      validatedData,
    );
  }

  @Post('save-csv')
  @ApiOperation({ summary: 'save csv file questions into db' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: saveCSVToDBDtoSwaggerSchema,
  })
  @UseInterceptors(FileInterceptor('file'))
  async saveCSVToDB(@UploadedFile() file: Express.Multer.File) {
    const filePath = file?.path;
    return await this.questionService.saveCSVToDB(filePath);
  }

  @Post('upload-svg')
  @ApiOperation({ summary: 'upload svg to bucket' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: saveCSVToDBDtoSwaggerSchema,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSVG(@UploadedFile() file: Express.Multer.File) {
    return await this.questionService.uploadSVG(file);
  }

  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    await this.questionService.deleteQuestion(+id);
    return { message: 'Question successfully deleted' };
  }
}
