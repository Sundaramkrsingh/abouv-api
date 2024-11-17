import { Module } from '@nestjs/common';
import { CoreV2Service } from './core_v2.service';
import { CoreV2Controller } from './core_v2.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PreqController } from './preq/preq.controller';
import { PreqService } from './preq/preq.service';
import { InqModule } from './inq/inq.module';
import { PreqModule } from './preq/preq.module';
import { LoggerService } from 'src/shared/logger/logger.service';
import { PostqModule } from './postq/postq.module';
import { S3Service } from 'src/s3/s3.service';
import { MixpanelModule } from 'src/mixpanel/mixpanel.module';

@Module({
  imports: [PrismaModule, MixpanelModule, InqModule, PreqModule, PostqModule],
  providers: [CoreV2Service, PreqService, LoggerService, S3Service],
  controllers: [CoreV2Controller, PreqController],
})
export class CoreV2Module {}
