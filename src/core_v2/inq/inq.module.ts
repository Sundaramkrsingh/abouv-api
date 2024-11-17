import { Module } from '@nestjs/common';
import { InqService } from './inq.service';
import { InqController } from './inq.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InqService],
  controllers: [InqController],
})
export class InqModule {}
