/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateBarbeiroDto } from './dto/create-barbeiro.dto';
import { UpdateBarbeiroDto } from './dto/update-barbeiro.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class BarbeirosService {
  constructor(private prisma: PrismaService) {}

  async create(createBarbeiroDto: CreateBarbeiroDto) {
    console.log(createBarbeiroDto);
    const { usuario_id, especialidade, bio, ativo } = createBarbeiroDto;

    const barbeiro = await this.prisma.barbeiros.create({
      data: {
        usuario_id,
        especialidade,
        bio,
        ativo,
      },
    });

    return barbeiro;
  }

  findAll() {
    return this.prisma.barbeiros.findMany({
      include: {
        usuarios: true,
        agendamentos: true,
        barbeiro_servicos: true,
        disponibilidade: true,
        barbearias: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.barbeiros.findUnique({
      where: { id },
      include: {
        usuarios: true,
        agendamentos: true,
        barbeiro_servicos: true,
        disponibilidade: true,
        barbearias: true,
      },
    });
  }

  update(id: number, updateBarbeiroDto: UpdateBarbeiroDto) {
    console.log(updateBarbeiroDto);
    return this.prisma.barbeiros.update({
      where: { id },
      data: updateBarbeiroDto,
    });
  }

  remove(id: number) {
    return this.prisma.barbeiros.delete({
      where: { id },
    });
  }
}
