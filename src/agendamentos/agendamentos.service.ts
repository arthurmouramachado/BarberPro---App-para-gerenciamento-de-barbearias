import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { PrismaService } from 'src/database/prisma.service';
import { ClientesService } from 'src/clientes/clientes.service';
import { BarbeirosService } from 'src/barbeiros/barbeiros.service';
import { ServicosService } from 'src/servicos/servicos.service';

@Injectable()
export class AgendamentosService {
  constructor(
    private prisma: PrismaService,
    private barbeirosService: BarbeirosService,
    private clientesService: ClientesService,
    private servicosService: ServicosService,
  ) {}
  async create(createAgendamentoDto: CreateAgendamentoDto) {
    const {
      cliente_id,
      barbeiro_id,
      servico_id,
      data,
      hora_inicio,
      hora_fim,
      status,
    } = createAgendamentoDto;

    const cliente = await this.clientesService.findOne(cliente_id);
    const barbeiro = await this.barbeirosService.findOne(barbeiro_id);
    const servico = await this.servicosService.findOne(servico_id);

    if (!cliente) throw new NotFoundException('Cliente não encontrado');
    if (!barbeiro) throw new NotFoundException('Barbeiro não encontrado');
    if (!servico) throw new NotFoundException('Serviço não encontrado');

    return await this.prisma.agendamentos.create({
      data: {
        cliente_id,
        barbeiro_id,
        servico_id,
        data: new Date(data),
        hora_inicio: new Date(`1970-01-01T${hora_inicio}Z`), // Convertendo para Date
        hora_fim: new Date(`1970-01-01T${hora_fim}Z`), // Convertendo para Date
        status,
      },
    });
  }

  findAll() {
    return this.prisma.agendamentos.findMany({
      include: {
        clientes: true,
        barbeiros: true,
        servicos: true,
      },
    });
  }

  async findOne(id: number) {
    const agendamento = await this.prisma.agendamentos.findUnique({
      where: { id },
      include: {
        clientes: true,
        barbeiros: true,
        servicos: true,
      },
    });

    if (!agendamento) throw new NotFoundException('Agendamento não encontrado');
    return agendamento;
  }

  async update(id: number, updateAgendamentoDto: UpdateAgendamentoDto) {
    await this.findOne(id); // Verifica se o agendamento existe antes de atualizar

    return this.prisma.agendamentos.update({
      where: { id },
      data: {
        ...updateAgendamentoDto,
        data: updateAgendamentoDto.data
          ? new Date(updateAgendamentoDto.data)
          : undefined,
        hora_inicio: updateAgendamentoDto.hora_inicio
          ? new Date(`1970-01-01T${updateAgendamentoDto.hora_inicio}Z`)
          : undefined,
        hora_fim: updateAgendamentoDto.hora_fim
          ? new Date(`1970-01-01T${updateAgendamentoDto.hora_fim}Z`)
          : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verifica se o agendamento existe antes de deletar

    return this.prisma.agendamentos.delete({ where: { id } });
  }
}
