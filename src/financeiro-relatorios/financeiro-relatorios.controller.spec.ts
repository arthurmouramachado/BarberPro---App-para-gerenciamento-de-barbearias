import { Test, TestingModule } from '@nestjs/testing';
import { FinanceiroRelatoriosController } from './financeiro-relatorios.controller';
import { FinanceiroRelatoriosService } from './financeiro-relatorios.service';

describe('FinanceiroRelatoriosController', () => {
  let controller: FinanceiroRelatoriosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceiroRelatoriosController],
      providers: [FinanceiroRelatoriosService],
    }).compile();

    controller = module.get<FinanceiroRelatoriosController>(FinanceiroRelatoriosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
