import { Module } from '@nestjs/common';
import { BarbeariasService } from './barbearias.service';
import { BarbeariasController } from './barbearias.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BarbeariasController],
  providers: [BarbeariasService],
  exports: [BarbeariasService],
})
export class BarbeariasModule {}
