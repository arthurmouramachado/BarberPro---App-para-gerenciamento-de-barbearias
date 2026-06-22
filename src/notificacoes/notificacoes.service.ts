import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificacoeDto } from './dto/create-notificacoe.dto';
import { UpdateNotificacoeDto } from './dto/update-notificacoe.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private prisma: PrismaService) {}
  async create(userId: number, createNotificacoeDto: CreateNotificacoeDto) {
    const { mensagem, lida } = createNotificacoeDto;
    return await this.prisma.notificacao.create({
      data: {
        usuario_id: userId,
        mensagem,
        lida,
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.notificacao.findMany({
      where: {
        usuario_id: userId,
      },
      orderBy: {
        criado_em: 'desc',
      },
    });
  }

  async findOne(userId: number, id: number) {
    const notificação = await this.prisma.notificacao.findUnique({
      where: { id },
    });
    if (!notificação) {
      throw new NotFoundException('Notificação não encontrada');
    }

    if (notificação.usuario_id !== userId) {
      throw new NotFoundException(
        'Notificação não encontrada para este usuário',
      );
    }

    return notificação;
  }

  async update(
    userId: number,
    id: number,
    updateNotificacoeDto: UpdateNotificacoeDto,
  ) {
    await this.findOne(userId, id);
    return this.prisma.notificacao.update({
      where: { id },
      data: updateNotificacoeDto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.notificacao.delete({
      where: { id },
    });
  }

  async marcarComoLida(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });
  }
}
