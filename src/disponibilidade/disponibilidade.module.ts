import { Module } from '@nestjs/common';
import { DisponibilidadeService } from './disponibilidade.service';
import { DisponibilidadeController } from './disponibilidade.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DisponibilidadeController],
  providers: [DisponibilidadeService],
  exports: [DisponibilidadeService],
})
export class DisponibilidadeModule {}
