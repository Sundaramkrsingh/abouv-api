import { Module } from '@nestjs/common';
import { PostqService } from './postq.service';
import { PostqController } from './postq.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/shared/logger/logger.service';

@Module({
  controllers: [PostqController],
  providers: [PostqService, PrismaService, LoggerService],
})
export class PostqModule {}
