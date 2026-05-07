import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ServicosService {
  constructor(private prisma: PrismaService) {}

  async create(createServicoDto: CreateServicoDto, userPayload: any) {
    const { nome, descricao, preco, duracao_minutos, ativo } = createServicoDto;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { sub: usuarioId, funcao } = userPayload;

    if (funcao !== 'BARBEIRO' && funcao !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas barbeiros e administradores podem criar servicos',
      );
    }

    let barbearia_id: number | null | undefined;

    if (funcao === 'BARBEIRO') {
      const barbeiro = await this.prisma.barbeiros.findUnique({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: { usuario_id: usuarioId },
      });

      if (!barbeiro) {
        throw new NotFoundException('Barbeiro nao encontrado');
      }

      barbearia_id = barbeiro.barbearia_id;
    }

    return this.prisma.servicos.create({
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

  findAll() {
    return this.prisma.servicos.findMany({
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

    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }

    return servico;
  }

  async update(id: number, updateServicoDto: UpdateServicoDto) {
    await this.findOne(id);

    return this.prisma.servicos.update({
      where: { id },
      data: updateServicoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verifica se o serviço existe antes de remover
    return this.prisma.servicos.delete({
      where: { id },
    });
  }
}
