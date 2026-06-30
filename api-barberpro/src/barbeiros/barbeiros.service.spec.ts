import { Test, TestingModule } from '@nestjs/testing';
import { BarbeirosService } from './barbeiros.service';

describe('BarbeirosService', () => {
  let service: BarbeirosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BarbeirosService],
    }).compile();

    service = module.get<BarbeirosService>(BarbeirosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
