import { Test, TestingModule } from '@nestjs/testing';
import { BarbeariasService } from './barbearias.service';

describe('BarbeariasService', () => {
  let service: BarbeariasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BarbeariasService],
    }).compile();

    service = module.get<BarbeariasService>(BarbeariasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
