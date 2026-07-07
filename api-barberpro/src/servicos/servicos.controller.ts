import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Post('criar')
  create(@Body() createServicoDto: CreateServicoDto) {
    return this.servicosService.create(createServicoDto);
  }

  @Get()
  findAll(@Query('barbeariaId') barbeariaId?: string) {
    return this.servicosService.findAll(barbeariaId ? +barbeariaId : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicoDto: UpdateServicoDto) {
    return this.servicosService.update(+id, updateServicoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicosService.remove(+id);
  }
}
