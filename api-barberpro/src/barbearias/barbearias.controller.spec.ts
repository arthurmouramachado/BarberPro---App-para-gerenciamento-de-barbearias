import { Test, TestingModule } from '@nestjs/testing';
import { BarbeariasController } from './barbearias.controller';
import { BarbeariasService } from './barbearias.service';

describe('BarbeariasController', () => {
  let controller: BarbeariasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarbeariasController],
      providers: [BarbeariasService],
    }).compile();

    controller = module.get<BarbeariasController>(BarbeariasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
