import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BarbeirosService } from './barbeiros.service';
import { CreateBarbeiroDto } from './dto/create-barbeiro.dto';
import { UpdateBarbeiroDto } from './dto/update-barbeiro.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('barbeiros')
export class BarbeirosController {
  constructor(private readonly barbeirosService: BarbeirosService) {}

  @Post('create')
  create(@Body() createBarbeiroDto: CreateBarbeiroDto) {
    return this.barbeirosService.create(createBarbeiroDto);
  }

  @Get()
  findAll() {
    return this.barbeirosService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('equipe')
  listarEquipe(@Req() req: { user: { sub: number } }) {
    return this.barbeirosService.listarEquipe(Number(req.user.sub));
  }

  @Get(':id/horarios-disponiveis')
  buscarHorarios(
    @Param('id') id: string,
    @Query('data') data: string,
    @Query('servicoId') servicoId: string,
  ) {
    return this.barbeirosService.buscarHorarios(+id, data, +servicoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barbeirosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBarbeiroDto: UpdateBarbeiroDto,
  ) {
    return this.barbeirosService.update(+id, updateBarbeiroDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { sub: number } }) {
    return this.barbeirosService.remove(+id, Number(req.user.sub));
  }
}
