import { Module } from '@nestjs/common';
import { AvaliacoesService } from './avaliacao.service';
import { AvaliacoesController } from './avaliacao.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AvaliacoesController],
  providers: [AvaliacoesService],
  exports: [AvaliacoesService],
})
export class AvaliacaoModule {}
