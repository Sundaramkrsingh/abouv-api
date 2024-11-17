import { Module } from '@nestjs/common';
import { UsageFeedbackController } from './usage-feedback.controller';
import { UsageFeedbackService } from './usage-feedback.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [UsageFeedbackController],
  providers: [UsageFeedbackService],
})
export class UsageFeedbackModule {}
