import { Injectable } from '@nestjs/common';
import { CreateDisponibilidadeDto } from './dto/create-disponibilidade.dto';
import { UpdateDisponibilidadeDto } from './dto/update-disponibilidade.dto';
import { PrismaService } from 'src/database/prisma.service';
import { BarbeirosService } from 'src/barbeiros/barbeiros.service';

@Injectable()
export class DisponibilidadeService {
  constructor(
    private prisma: PrismaService,
    private barbeirosService: BarbeirosService,
  ) {}
  create(createDisponibilidadeDto: CreateDisponibilidadeDto) {
    return 'This action adds a new disponibilidade';
  }

  findAll() {
    return `This action returns all disponibilidade`;
  }

  findOne(id: number) {
    return `This action returns a #${id} disponibilidade`;
  }

  update(id: number, updateDisponibilidadeDto: UpdateDisponibilidadeDto) {
    return `This action updates a #${id} disponibilidade`;
  }

  remove(id: number) {
    return `This action removes a #${id} disponibilidade`;
  }
}
