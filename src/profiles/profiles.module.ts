import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3Module } from 'src/s3/s3.module';
import { LoggerService } from 'src/shared/logger/logger.service';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [ProfilesController],
  providers: [ProfilesService, LoggerService],
})
export class ProfilesModule {}
