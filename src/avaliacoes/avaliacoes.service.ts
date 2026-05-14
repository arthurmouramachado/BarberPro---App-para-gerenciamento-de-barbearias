import { Injectable } from '@nestjs/common';
import { CreateAvaliacoeDto } from './dto/create-avaliacoe.dto';
import { UpdateAvaliacoeDto } from './dto/update-avaliacoe.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}
  async create(createAvaliacoeDto: CreateAvaliacoeDto) {
    const { agendamento_id, nota, comentario } = createAvaliacoeDto;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.avaliacoes.create({
      data: {
        agendamento_id,
        nota,
        comentario,
      },
    });
  }

  findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.avaliacoes.findMany({
      include: {
        agendamentos: {
          include: {
            clientes: true,
            barbeiros: true,
            servicos: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.avaliacoes.findUnique({
      where: { id },
      include: {
        agendamentos: {
          include: {
            clientes: true,
            barbeiros: true,
            servicos: true,
          },
        },
      },
    });
  }

  async update(id: number, updateAvaliacoeDto: UpdateAvaliacoeDto) {
    await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.avaliacoes.update({
      where: { id },
      data: updateAvaliacoeDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.avaliacoes.delete({
      where: { id },
    });
  }
}
