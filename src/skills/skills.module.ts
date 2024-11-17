import { Module } from '@nestjs/common';
import { SkillsService } from './skill.service';
import { SkillsController } from './skills.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}
