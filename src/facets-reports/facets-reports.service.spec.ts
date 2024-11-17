import { Test, TestingModule } from '@nestjs/testing';
import { FacetsReportsService } from './facets-reports.service';

describe('FacetsReportsService', () => {
  let service: FacetsReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacetsReportsService],
    }).compile();

    service = module.get<FacetsReportsService>(FacetsReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
