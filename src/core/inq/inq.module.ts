import { Module } from '@nestjs/common';
import { InqService } from './inq.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InqController } from './inq.controller';

@Module({
  imports: [PrismaModule],
  providers: [InqService],
  controllers: [InqController],
})
export class InqModule {}
