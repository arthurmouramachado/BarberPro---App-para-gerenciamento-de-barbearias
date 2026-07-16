import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBarbeariaDto } from './dto/create-barbearia.dto';
import { UpdateBarbeariaDto } from './dto/update-barbearia.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class BarbeariasService {
  constructor(private prisma: PrismaService) {}
  async create(createBarbeariaDto: CreateBarbeariaDto) {
    const { nome, endereco, telefone, foto_url } = createBarbeariaDto;

    return await this.prisma.barbearias.create({
      data: {
        nome,
        endereco,
        telefone,
        foto_url,
      },
    });
  }

  async findAll() {
    const barbearias = await this.prisma.barbearias.findMany({
      include: {
        barbeiros: {
          include: {
            agendamentos: {
              include: {
                avaliacao: true,
              },
            },
          },
        },
        servicos: true,
      },
    });

    const barbeariasComMedia = barbearias.map((barbearia) => {
      const barbeirosDestaBarbearia = barbearia.barbeiros;

      const avaliacoes = barbeirosDestaBarbearia.flatMap((barbeiro) =>
        barbeiro.agendamentos.flatMap((agendamento) =>
          agendamento.avaliacao ? [agendamento.avaliacao] : [],
        ),
      );

      const totalReviews = avaliacoes.length;

      const somaNotas = avaliacoes.reduce((acc, avaliacao) => {
        return acc + (avaliacao?.nota ?? 0);
      }, 0);

      const mediaAvaliacoes = totalReviews > 0 ? somaNotas / totalReviews : 0;

      return {
        ...barbearia,
        mediaAvaliacoes: Number(mediaAvaliacoes.toFixed(1)),
      };
    });
    return barbeariasComMedia;
  }

  async findOne(id: number) {
    const barbearia = await this.prisma.barbearias.findUnique({
      where: { id },
      include: {
        barbeiros: true,
        servicos: true,
      },
    });

    if (!barbearia) throw new NotFoundException('Barbearia não encontrada');

    return barbearia;
  }

  async update(id: number, updateBarbeariaDto: UpdateBarbeariaDto) {
    await this.findOne(id);
    return this.prisma.barbearias.update({
      where: { id },
      data: updateBarbeariaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.barbearias.delete({
      where: { id },
    });
  }
}
