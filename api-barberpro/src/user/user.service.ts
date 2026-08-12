import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma.service';
import { BarbeirosService } from 'src/barbeiros/barbeiros.service';
import { ClientesService } from 'src/clientes/clientes.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private barbeirosService: BarbeirosService,
    private clientesService: ClientesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    const { funcao, data_nascimento, especialidade, bio, ativo, ...userData } =
      createUserDto;

    const hash = await bcrypt.hash(createUserDto.senha, 10);

    return this.prisma.$transaction(async () => {
      const usuario = await this.prisma.usuarios.create({
        data: { ...userData, funcao, senha: hash },
      });

      if (funcao === 'CLIENTE') {
        await this.clientesService.create(usuario.id, {
          data_nascimento,
        });
      }

      if (funcao === 'BARBEIRO' || funcao === 'ADMIN') {
        await this.barbeirosService.create({
          usuario_id: usuario.id,
          especialidade: especialidade || 'Geral',
          bio,
          ativo,
        });
      }

      return this.prisma.usuarios.findUnique({
        where: { id: usuario.id },
        include: { barbeiros: true, clientes: true },
      });
    });
  }

  findAll() {
    return this.prisma.usuarios.findMany({
      include: {
        clientes: true,
        barbeiros: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.usuarios.findUnique({
      where: { id },
      include: {
        barbeiros: {
          include: {
            agendamentos: true,
            barbeiro_servicos: true,
            disponibilidade: true,
            barbearias: true,
          },
        },
        clientes: {
          include: {
            agendamentos: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.usuarios.findUnique({
      where: { email },
      include: {
        barbeiros: true,
        clientes: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return this.prisma.usuarios.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    console.log(id);
    return this.prisma.usuarios.delete({
      where: { id },
    });
  }
}
