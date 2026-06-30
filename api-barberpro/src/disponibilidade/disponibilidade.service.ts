import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDisponibilidadeDto } from './dto/create-disponibilidade.dto';
import { UpdateDisponibilidadeDto } from './dto/update-disponibilidade.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class DisponibilidadeService {
  constructor(private prisma: PrismaService) {}
  async create(
    userId: number,
    createDisponibilidadeDto: CreateDisponibilidadeDto,
  ) {
    const { dia_da_semana, hora_inicio, hora_fim } = createDisponibilidadeDto;
    // Valida se o barbeiro existe
    const barbeiro = await this.prisma.barbeiros.findUnique({
      where: { usuario_id: userId },
    });

    if (!barbeiro) throw new ForbiddenException('Barbeiro não encontrado');

    return await this.prisma.disponibilidade.create({
      data: {
        dia_da_semana,
        hora_inicio: new Date(`1970-01-01T${hora_inicio}Z`), // Convertendo para Date
        hora_fim: new Date(`1970-01-01T${hora_fim}Z`), // Convertendo para Date
        barbeiro_id: barbeiro.id,
      },
    });
  }

  findAll() {
    return this.prisma.disponibilidade.findMany({
      include: {
        barbeiros: true,
      },
    });
  }

  async findOne(id: number) {
    const disponibilidade = await this.prisma.disponibilidade.findUnique({
      where: { id },
      include: {
        barbeiros: true,
      },
    });
    if (!disponibilidade) {
      throw new NotFoundException('Disponibilidade não encontrada');
    }
    return disponibilidade;
  }

  async update(
    id: number,
    userId: number,
    updateDisponibilidadeDto: UpdateDisponibilidadeDto,
  ) {
    const disponibilidade = await this.findOne(id); // Verifica se a disponibilidade existe antes de atualizar

    const barbeiro = await this.prisma.barbeiros.findUnique({
      where: { usuario_id: userId },
    });

    if (!barbeiro || disponibilidade.barbeiro_id !== barbeiro.id) {
      throw new ForbiddenException('Você não pode modificar este horário');
    }

    return this.prisma.disponibilidade.update({
      where: { id },
      data: {
        dia_da_semana: updateDisponibilidadeDto.dia_da_semana,
        hora_inicio: updateDisponibilidadeDto.hora_inicio
          ? new Date(`1970-01-01T${updateDisponibilidadeDto.hora_inicio}Z`)
          : undefined,
        hora_fim: updateDisponibilidadeDto.hora_fim
          ? new Date(`1970-01-01T${updateDisponibilidadeDto.hora_fim}Z`)
          : undefined,
      },
    });
  }

  async remove(id: number, userId: number) {
    const disponibilidade = await this.findOne(id); // Verifica se a disponibilidade existe antes de deletar

    const barbeiro = await this.prisma.barbeiros.findUnique({
      where: { usuario_id: userId },
    });

    if (!barbeiro || disponibilidade.barbeiro_id !== barbeiro.id) {
      throw new ForbiddenException('Você não pode modificar este horário');
    }
    return this.prisma.disponibilidade.delete({ where: { id } });
  }
}
