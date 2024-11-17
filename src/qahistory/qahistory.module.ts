import { Module } from '@nestjs/common';
import { QaHistoryService } from './qahistory.service';
import { QaHistoryController } from './qahistory.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QaHistoryController],
  providers: [QaHistoryService],
})
export class QaModule {}
