import { Module } from '@nestjs/common';
import { MixpanelService } from './mixpanel.service';
import { MixpanelController } from './mixpanel.controller';
import { LoggerService } from 'src/shared/logger/logger.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MixpanelController],
  providers: [MixpanelService, LoggerService],
})
export class MixpanelModule {}
