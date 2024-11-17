import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PreqController } from './preq.controller';
import { PreqService } from './preq.service';
import { LoggerService } from 'src/shared/logger/logger.service';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [PrismaModule],
  providers: [PreqService, LoggerService, S3Service],
  controllers: [PreqController],
})
export class PreqModule {}
