import { Module } from '@nestjs/common';
import { PreqService } from './preq.service';
import { PreqController } from './preq.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PreqService],
  controllers: [PreqController],
})
export class PreqModule {}
