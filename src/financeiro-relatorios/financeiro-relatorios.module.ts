import { Module } from '@nestjs/common';
import { FinanceiroRelatoriosService } from './financeiro-relatorios.service';
import { FinanceiroRelatoriosController } from './financeiro-relatorios.controller';

@Module({
  controllers: [FinanceiroRelatoriosController],
  providers: [FinanceiroRelatoriosService],
})
export class FinanceiroRelatoriosModule {}
