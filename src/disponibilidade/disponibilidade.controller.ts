/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DisponibilidadeService } from './disponibilidade.service';
import { CreateDisponibilidadeDto } from './dto/create-disponibilidade.dto';
import { UpdateDisponibilidadeDto } from './dto/update-disponibilidade.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('disponibilidade')
export class DisponibilidadeController {
  constructor(
    private readonly disponibilidadeService: DisponibilidadeService,
  ) {}

  @Post('cadastrar')
  @UseGuards(AuthGuard)
  create(
    @Req() req,
    @Body() createDisponibilidadeDto: CreateDisponibilidadeDto,
  ) {
    return this.disponibilidadeService.create(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      req.userId.sub,
      createDisponibilidadeDto,
    );
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
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateDisponibilidadeDto: UpdateDisponibilidadeDto,
  ) {
    return this.disponibilidadeService.update(
      +id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      req.userId.sub,
      updateDisponibilidadeDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.disponibilidadeService.remove(+id, req.userId.sub);
  }
}
