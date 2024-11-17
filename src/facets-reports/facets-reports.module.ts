import { Module } from '@nestjs/common';
import { FacetsReportsService } from './facets-reports.service';
import { FacetsReportsController } from './facets-reports.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FacetsReportsService],
  controllers: [FacetsReportsController],
})
export class FacetsReportsModule {}
