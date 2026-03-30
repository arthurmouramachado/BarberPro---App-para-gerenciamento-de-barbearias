import { Test, TestingModule } from '@nestjs/testing';
import { BarbeirosController } from './barbeiros.controller';
import { BarbeirosService } from './barbeiros.service';

describe('BarbeirosController', () => {
  let controller: BarbeirosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarbeirosController],
      providers: [BarbeirosService],
    }).compile();

    controller = module.get<BarbeirosController>(BarbeirosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
