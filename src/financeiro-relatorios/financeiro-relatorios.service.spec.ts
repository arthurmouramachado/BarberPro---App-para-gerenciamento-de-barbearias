import { Test, TestingModule } from '@nestjs/testing';
import { FinanceiroRelatoriosService } from './financeiro-relatorios.service';

describe('FinanceiroRelatoriosService', () => {
  let service: FinanceiroRelatoriosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceiroRelatoriosService],
    }).compile();

    service = module.get<FinanceiroRelatoriosService>(FinanceiroRelatoriosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
