import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(usuario_id: number, createClienteDto: CreateClienteDto) {
    return this.prisma.clientes.create({
      data: {
        usuario_id,
        data_nascimento: createClienteDto.data_nascimento
          ? new Date(createClienteDto.data_nascimento)
          : null,
      },
    });
  }

  findAll() {
    return this.prisma.clientes.findMany({
      include: {
        usuarios: true,
        agendamentos: true,
      },
    });
  }
  findOne(id: number) {
    return this.prisma.clientes.findUnique({
      where: { id },
      include: {
        usuarios: true,
        agendamentos: true,
      },
    });
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    return this.prisma.clientes.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  remove(id: number) {
    return this.prisma.clientes.delete({
      where: { id },
    });
  }
}
