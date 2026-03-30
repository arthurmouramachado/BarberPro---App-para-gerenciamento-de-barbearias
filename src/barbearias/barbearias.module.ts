import { Module } from '@nestjs/common';
import { BarbeariasService } from './barbearias.service';
import { BarbeariasController } from './barbearias.controller';

@Module({
  controllers: [BarbeariasController],
  providers: [BarbeariasService],
})
export class BarbeariasModule {}
