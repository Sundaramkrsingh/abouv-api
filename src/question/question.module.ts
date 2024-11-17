import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [
    PrismaModule,
    S3Module,
    MulterModule.register({
      dest: './csv-uploads',
    }),
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
