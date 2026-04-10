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
    const {
      nome,
      email,
      senha,
      funcao,
      telefone,
      data_nascimento,
      especialidade,
      bio,
      ativo,
    } = createUserDto;

    const hash = await bcrypt.hash(senha, 10);

    return this.prisma.$transaction(async () => {
      const usuario = await this.prisma.usuarios.create({
        data: { nome, email, senha: hash, funcao, telefone },
      });

      if (funcao === 'CLIENTE') {
        await this.clientesService.create(usuario.id, {
          data_nascimento,
        });
      }

      if (funcao === 'BARBEIRO' || funcao === 'ADMIN') {
        await this.barbeirosService.create({
          usuario_id: usuario.id,
          especialidade,
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
