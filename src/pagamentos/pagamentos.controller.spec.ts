import { Test, TestingModule } from '@nestjs/testing';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';

describe('PagamentosController', () => {
  let controller: PagamentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagamentosController],
      providers: [PagamentosService],
    }).compile();

    controller = module.get<PagamentosController>(PagamentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
