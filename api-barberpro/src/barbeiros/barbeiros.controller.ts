import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { BarbeirosService } from './barbeiros.service';
import { CreateBarbeiroDto } from './dto/create-barbeiro.dto';
import { UpdateBarbeiroDto } from './dto/update-barbeiro.dto';

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.barbeirosService.remove(+id);
  }
}
