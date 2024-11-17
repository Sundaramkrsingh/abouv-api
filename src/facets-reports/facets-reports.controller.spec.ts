import { Test, TestingModule } from '@nestjs/testing';
import { FacetsReportsController } from './facets-reports.controller';

describe('FacetsReportsController', () => {
  let controller: FacetsReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacetsReportsController],
    }).compile();

    controller = module.get<FacetsReportsController>(FacetsReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
