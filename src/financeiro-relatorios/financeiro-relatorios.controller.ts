import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FinanceiroRelatoriosService } from './financeiro-relatorios.service';
import { CreateFinanceiroRelatorioDto } from './dto/create-financeiro-relatorio.dto';
import { UpdateFinanceiroRelatorioDto } from './dto/update-financeiro-relatorio.dto';

@Controller('financeiro-relatorios')
export class FinanceiroRelatoriosController {
  constructor(private readonly financeiroRelatoriosService: FinanceiroRelatoriosService) {}

  @Post()
  create(@Body() createFinanceiroRelatorioDto: CreateFinanceiroRelatorioDto) {
    return this.financeiroRelatoriosService.create(createFinanceiroRelatorioDto);
  }

  @Get()
  findAll() {
    return this.financeiroRelatoriosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financeiroRelatoriosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFinanceiroRelatorioDto: UpdateFinanceiroRelatorioDto) {
    return this.financeiroRelatoriosService.update(+id, updateFinanceiroRelatorioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financeiroRelatoriosService.remove(+id);
  }
}
