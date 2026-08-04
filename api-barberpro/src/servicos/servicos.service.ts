import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { PrismaService } from 'src/database/prisma.service';
import { BarbeariasService } from 'src/barbearias/barbearias.service';

@Injectable()
export class ServicosService {
  constructor(
    private prisma: PrismaService,
    private barbeariasService: BarbeariasService,
  ) {}

  async create(createServicoDto: CreateServicoDto) {
    const { nome, descricao, preco, duracao_minutos, ativo, barbearia_id } =
      createServicoDto;

    // Se vier barbearia_id, valida se ela existe
    if (barbearia_id) {
      const barbearia = await this.barbeariasService.findOne(barbearia_id);
      if (!barbearia) throw new NotFoundException('Barbearia não encontrada');
    }

    return await this.prisma.servicos.create({
      data: {
        nome,
        descricao,
        preco,
        duracao_minutos,
        ativo,
        barbearia_id,
      },
    });
  }

  findAll(barbearia_id?: number) {
    return this.prisma.servicos.findMany({
      where: {
        barbearia_id,
      },
      include: {
        barbearias: true,
      },
    });
  }

  async findOne(id: number) {
    const servico = await this.prisma.servicos.findUnique({
      where: { id },
      include: {
        barbearias: true,
      },
    });

    if (!servico) throw new NotFoundException('Serviço não encontrado');

    return servico;
  }

  async update(id: number, updateServicoDto: UpdateServicoDto) {
    await this.findOne(id);

    // Se vier barbearia_id no update, valida
    if (updateServicoDto.barbearia_id) {
      const barbearia = await this.barbeariasService.findOne(
        updateServicoDto.barbearia_id,
      );
      if (!barbearia) throw new NotFoundException('Barbearia não encontrada');
    }

    return this.prisma.servicos.update({
      where: { id },
      data: updateServicoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.servicos.delete({ where: { id } });
  }
}
