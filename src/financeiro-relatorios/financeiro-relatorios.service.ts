import { Injectable } from '@nestjs/common';
import { CreateFinanceiroRelatorioDto } from './dto/create-financeiro-relatorio.dto';
import { UpdateFinanceiroRelatorioDto } from './dto/update-financeiro-relatorio.dto';

@Injectable()
export class FinanceiroRelatoriosService {
  create(createFinanceiroRelatorioDto: CreateFinanceiroRelatorioDto) {
    return 'This action adds a new financeiroRelatorio';
  }

  findAll() {
    return `This action returns all financeiroRelatorios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} financeiroRelatorio`;
  }

  update(id: number, updateFinanceiroRelatorioDto: UpdateFinanceiroRelatorioDto) {
    return `This action updates a #${id} financeiroRelatorio`;
  }

  remove(id: number) {
    return `This action removes a #${id} financeiroRelatorio`;
  }
}
