import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { CoreController } from './core.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PreqModule } from './preq/preq.module';

@Module({
  imports: [PrismaModule, PreqModule],
  controllers: [CoreController],
  providers: [CoreService],
})
export class CoreModule {}
