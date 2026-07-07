import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBarbeiroDto } from './dto/create-barbeiro.dto';
import { UpdateBarbeiroDto } from './dto/update-barbeiro.dto';
import { PrismaService } from 'src/database/prisma.service';
@Injectable()
export class BarbeirosService {
  constructor(private prisma: PrismaService) {}

  async create(createBarbeiroDto: CreateBarbeiroDto) {
    console.log(createBarbeiroDto);
    const { usuario_id, especialidade, bio, ativo } = createBarbeiroDto;

    const barbeiro = await this.prisma.barbeiros.create({
      data: {
        usuario_id,
        especialidade,
        bio,
        ativo,
      },
    });

    return barbeiro;
  }

  findAll() {
    return this.prisma.barbeiros.findMany({
      include: {
        usuarios: true,
        agendamentos: true,
        barbeiro_servicos: true,
        disponibilidade: true,
        barbearias: true,
      },
    });
  }

  async buscarHorarios(
    barbeiroId: number,
    dataString: string,
    servicoId: number,
  ) {
    const dataObjeto = new Date(dataString);
    const diaDaSemana = dataObjeto.getUTCDay();

    // 1. Busca o serviço para saber a duração em minutos
    const servico = await this.prisma.servicos.findUnique({
      where: { id: servicoId },
    });
    if (!servico) throw new NotFoundException('Serviço não encontrado');
    const duracaoCorte = servico.duracao_minutos;

    // 2. Busca a disponibilidade da grade de trabalho do barbeiro
    const disponibilidade = await this.prisma.disponibilidade.findFirst({
      where: { barbeiro_id: barbeiroId, dia_da_semana: diaDaSemana },
    });
    if (!disponibilidade) return [];

    // 3. Busca agendamentos do dia (ignora cancelados)
    const agendamentosOcupados = await this.prisma.agendamentos.findMany({
      where: {
        barbeiro_id: barbeiroId,
        data: dataObjeto,
        status: { not: 'CANCELADO' },
      },
    });

    const horariosLivres: string[] = [];
    // eslint-disable-next-line prefer-const
    let horarioAtual = new Date(disponibilidade.hora_inicio);
    const horarioFimExpediente = new Date(disponibilidade.hora_fim);

    // O intervalo de geração dos botões na tela pode continuar de 30 em 30 min
    while (horarioAtual < horarioFimExpediente) {
      // Calcula o horário de FIM pretendido para o serviço atual do loop
      const horarioFimPretendido = new Date(
        horarioAtual.getTime() + duracaoCorte * 60000,
      );

      // Se o serviço passar do horário que a barbearia fecha, esse slot não serve
      if (horarioFimPretendido > horarioFimExpediente) {
        break;
      }

      const horas = String(horarioAtual.getUTCHours()).padStart(2, '0');
      const minutos = String(horarioAtual.getUTCMinutes()).padStart(2, '0');
      const slotFormatado = `${horas}:${minutos}`;

      // 4. CHECAGEM DE INTERSEÇÃO: O pulo do gato do TCC 🐈‍⬛
      const houveColisao = agendamentosOcupados.some((agendamento) => {
        const inicioAgendado = agendamento.hora_inicio.getTime();
        const fimAgendado = agendamento.hora_fim.getTime();
        const inicioPretendido = horarioAtual.getTime();
        const fimPretendido = horarioFimPretendido.getTime();

        // Formula de colisão de intervalos de tempo
        return inicioPretendido < fimAgendado && fimPretendido > inicioAgendado;
      });

      if (!houveColisao) {
        horariosLivres.push(slotFormatado);
      }

      // Avança o ponteiro de 30 em 30 minutos para oferecer o próximo horário inicial possível
      horarioAtual.setUTCMinutes(horarioAtual.getUTCMinutes() + 30);
    }

    return horariosLivres;
  }

  findOne(id: number) {
    return this.prisma.barbeiros.findUnique({
      where: { id },
      include: {
        usuarios: true,
        agendamentos: true,
        barbeiro_servicos: true,
        disponibilidade: true,
        barbearias: true,
      },
    });
  }

  update(id: number, updateBarbeiroDto: UpdateBarbeiroDto) {
    console.log(updateBarbeiroDto);
    return this.prisma.barbeiros.update({
      where: { id },
      data: updateBarbeiroDto,
    });
  }

  remove(id: number) {
    return this.prisma.barbeiros.delete({
      where: { id },
    });
  }
}
