import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacoeDto } from './dto/create-notificacoe.dto';
import { UpdateNotificacoeDto } from './dto/update-notificacoe.dto';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Post()
  create(@Body() createNotificacoeDto: CreateNotificacoeDto) {
    return this.notificacoesService.create(createNotificacoeDto);
  }

  @Get()
  findAll() {
    return this.notificacoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificacoesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificacoeDto: UpdateNotificacoeDto) {
    return this.notificacoesService.update(+id, updateNotificacoeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificacoesService.remove(+id);
  }
}
