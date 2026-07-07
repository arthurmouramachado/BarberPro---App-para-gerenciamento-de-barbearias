import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { PrismaService } from 'src/database/prisma.service';
import { ClientesService } from 'src/clientes/clientes.service';
import { BarbeirosService } from 'src/barbeiros/barbeiros.service';
import { ServicosService } from 'src/servicos/servicos.service';
import { NotificacoesService } from 'src/notificacoes/notificacoes.service';
import { GoogleCalendarService } from 'src/notificacoes/google-calendar.service';

@Injectable()
export class AgendamentosService {
  constructor(
    private prisma: PrismaService,
    private barbeirosService: BarbeirosService,
    private clientesService: ClientesService,
    private servicosService: ServicosService,
    private notificacoesService: NotificacoesService,
    private googleCalendarService: GoogleCalendarService,
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

    const diaDaSemana = new Date(data).getDay();

    const disponibilidade = await this.prisma.disponibilidade.findFirst({
      where: {
        barbeiro_id,
        dia_da_semana: diaDaSemana,
      },
    });

    if (!disponibilidade) {
      throw new BadRequestException('Barbeiro não atende nesse dia');
    }

    const horaInicioAgendamento = new Date(`1970-01-01T${hora_inicio}Z`);
    const horaFimAgendamento = new Date(`1970-01-01T${hora_fim}Z`);

    if (
      horaInicioAgendamento < disponibilidade.hora_inicio ||
      horaFimAgendamento > disponibilidade.hora_fim
    ) {
      throw new BadRequestException(
        'Horário fora da disponibilidade do barbeiro',
      );
    }

    const agendamento = await this.prisma.agendamentos.create({
      data: {
        cliente_id,
        barbeiro_id,
        servico_id,
        data: new Date(data),
        hora_inicio: horaInicioAgendamento,
        hora_fim: horaFimAgendamento,
        status,
      },
    });

    await this.notificacoesService.create(cliente.usuario_id, {
      mensagem: `Agendamento confirmado para ${data}`,
    });

    await this.notificacoesService.create(barbeiro.usuario_id, {
      mensagem: `Novo agendamento com ${cliente.usuarios.nome}`,
    });

    const admins = await this.prisma.usuarios.findMany({
      where: { funcao: 'ADMIN' },
    });

    for (const admin of admins) {
      await this.notificacoesService.create(admin.id, {
        mensagem: `Novo agendamento: ${cliente.usuarios.nome} com ${barbeiro.usuarios.nome} no dia ${data}`,
      });
    }

    await this.googleCalendarService.criarEventoAgenda({
      barbeiroEmail: barbeiro.usuarios.email,
      clienteEmail: cliente.usuarios.email,
      servicoNome: servico.nome,
      servicoDescricao: servico.descricao ?? undefined,
      servicoPreco: Number(servico.preco),
      data,
      horaInicio: hora_inicio,
      horaFim: hora_fim,
      barbeiroNome: barbeiro.usuarios.nome,
      clienteNome: cliente.usuarios.nome,
    });

    return agendamento;
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
