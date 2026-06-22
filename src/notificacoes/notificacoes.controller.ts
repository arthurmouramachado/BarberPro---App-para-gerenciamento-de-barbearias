import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { UpdateNotificacoeDto } from './dto/update-notificacoe.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.notificacoesService.findAll(req.userId.sub);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.notificacoesService.findOne(req.userId.sub, +id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificacoeDto: UpdateNotificacoeDto,
    @Req() req,
  ) {
    return this.notificacoesService.update(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.userId.sub,
      +id,
      updateNotificacoeDto,
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':id/ler')
  marcarComoLida(@Param('id') id: string, @Req() req) {
    return this.notificacoesService.marcarComoLida(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.userId.sub,
      +id,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.notificacoesService.remove(req.userId.sub, +id);
  }
}
