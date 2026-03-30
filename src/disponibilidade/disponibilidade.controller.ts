import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DisponibilidadeService } from './disponibilidade.service';
import { CreateDisponibilidadeDto } from './dto/create-disponibilidade.dto';
import { UpdateDisponibilidadeDto } from './dto/update-disponibilidade.dto';

@Controller('disponibilidade')
export class DisponibilidadeController {
  constructor(private readonly disponibilidadeService: DisponibilidadeService) {}

  @Post()
  create(@Body() createDisponibilidadeDto: CreateDisponibilidadeDto) {
    return this.disponibilidadeService.create(createDisponibilidadeDto);
  }

  @Get()
  findAll() {
    return this.disponibilidadeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disponibilidadeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDisponibilidadeDto: UpdateDisponibilidadeDto) {
    return this.disponibilidadeService.update(+id, updateDisponibilidadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.disponibilidadeService.remove(+id);
  }
}
