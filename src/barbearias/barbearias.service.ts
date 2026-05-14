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

  findAll() {
    return this.prisma.barbearias.findMany({
      include: {
        barbeiros: true,
        servicos: true,
      },
    });
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
