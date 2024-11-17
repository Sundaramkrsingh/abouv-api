import { Module } from '@nestjs/common';
import { FeedBackController } from './feed-back.controller';
import { FeedBackService } from './feed-back.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [FeedBackController],
  providers: [FeedBackService],
})
export class FeedBackModule {}
