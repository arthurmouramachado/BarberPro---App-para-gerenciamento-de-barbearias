import { PartialType } from '@nestjs/mapped-types';
import { CreateFinanceiroRelatorioDto } from './create-financeiro-relatorio.dto';

export class UpdateFinanceiroRelatorioDto extends PartialType(CreateFinanceiroRelatorioDto) {}
