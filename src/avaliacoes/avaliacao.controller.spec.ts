import { Test, TestingModule } from '@nestjs/testing';
import { AvaliacoesController } from './avaliacao.controller';
import { AvaliacoesService } from './avaliacao.service';

describe('AvaliacoesController', () => {
  let controller: AvaliacoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvaliacoesController],
      providers: [AvaliacoesService],
    }).compile();

    controller = module.get<AvaliacoesController>(AvaliacoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
