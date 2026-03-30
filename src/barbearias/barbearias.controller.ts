import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BarbeariasService } from './barbearias.service';
import { CreateBarbeariaDto } from './dto/create-barbearia.dto';
import { UpdateBarbeariaDto } from './dto/update-barbearia.dto';

@Controller('barbearias')
export class BarbeariasController {
  constructor(private readonly barbeariasService: BarbeariasService) {}

  @Post()
  create(@Body() createBarbeariaDto: CreateBarbeariaDto) {
    return this.barbeariasService.create(createBarbeariaDto);
  }

  @Get()
  findAll() {
    return this.barbeariasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barbeariasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBarbeariaDto: UpdateBarbeariaDto) {
    return this.barbeariasService.update(+id, updateBarbeariaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barbeariasService.remove(+id);
  }
}
