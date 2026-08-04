import { Injectable } from '@nestjs/common';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AvaliacoesService {
  constructor(private prisma: PrismaService) {}
  async create(createAvaliacaoDto: CreateAvaliacaoDto) {
    const { agendamento_id, nota, comentario } = createAvaliacaoDto;
    if (nota && (nota < 1 || nota > 5)) {
      throw new Error('A nota deve ser entre 1 e 5');
    }
    return await this.prisma.avaliacao.create({
      data: {
        agendamento_id,
        nota,
        comentario,
      },
    });
  }

  async obterMediaPorBarbeiro(barbeiroId: number) {
    const resultado = await this.prisma.avaliacao.aggregate({
      _avg: { nota: true },
      _count: { id: true },
      where: {
        agendamentos: {
          barbeiro_id: barbeiroId,
        },
      },
    });

    return {
      media: (resultado._avg.nota || 0).toFixed(1),
      total: resultado._count.id,
    };
  }

  findAll() {
    return this.prisma.avaliacao.findMany({
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
    return this.prisma.avaliacao.findUnique({
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

  async update(id: number, updateAvaliacaoDto: UpdateAvaliacaoDto) {
    await this.findOne(id);
    return this.prisma.avaliacao.update({
      where: { id },
      data: updateAvaliacaoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.avaliacao.delete({
      where: { id },
    });
  }
}
