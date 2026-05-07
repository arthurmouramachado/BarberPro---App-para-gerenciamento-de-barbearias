import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @UseGuards(AuthGuard)
  @Post('criar')
  create(@Body() createServicoDto: CreateServicoDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.servicosService.create(createServicoDto, req.userId);
  }

  @Get()
  findAll() {
    return this.servicosService.findAll();
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
