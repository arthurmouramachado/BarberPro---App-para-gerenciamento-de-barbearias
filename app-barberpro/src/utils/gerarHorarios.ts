// src/utils/gerarHorarios.ts

// Converte strings "08:30" ou "1970-01-01T08:30:00.000Z" para minutos (ex: 510 min)
function horaParaMinutos(horaStr: string): number {
  let horaLimpa = horaStr;
  
  if (horaStr.includes('T')) {
    // Trata datas vindas do Prisma/NestJS tipo "1970-01-01T08:00:00.000Z"
    const partes = horaStr.split('T')[1];
    horaLimpa = partes.substring(0, 5);
  }

  const [horas, minutos] = horaLimpa.split(':').map(Number);
  return horas * 60 + minutos;
}

// Converte minutos de volta para "HH:MM"
function minutosParaHora(minutosTotais: number): string {
  const horas = Math.floor(minutosTotais / 60);
  const mins = minutosTotais % 60;
  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export interface TurnoTrabalho {
  hora_inicio: string;
  hora_fim: string;
}

interface GerarHorariosParams {
  turnosDoDia: TurnoTrabalho[]; // Lista de expedientes/turnos do barbeiro no dia
  duracaoMinutos: number;
  agendamentosExistentes: Array<{ dataHorario: string; duracaoMinutos?: number }>;
}

export function gerarHorariosDisponiveis({
  turnosDoDia = [],
  duracaoMinutos = 30,
  agendamentosExistentes = [],
}: GerarHorariosParams): string[] {
  // Se não houver turnos cadastrados para esse dia da semana -> DIA DE FOLGA
  if (!turnosDoDia || turnosDoDia.length === 0) {
    return [];
  }

  // Mapeia os agendamentos ocupados no dia em minutos
  const intervalosOcupados = agendamentosExistentes.map((ag) => {
    const horaStr = ag.dataHorario.includes('T')
      ? ag.dataHorario.split('T')[1].substring(0, 5)
      : ag.dataHorario.substring(0, 5);

    const agInicio = horaParaMinutos(horaStr);
    const agDuracao = ag.duracaoMinutos || 30;
    return {
      inicio: agInicio,
      fim: agInicio + agDuracao,
    };
  });

  const slotsDisponiveis: string[] = [];

  // Percorre cada turno/expediente do barbeiro no dia
  for (const turno of turnosDoDia) {
    const inicioMin = horaParaMinutos(turno.hora_inicio);
    const fimMin = horaParaMinutos(turno.hora_fim);

    let atual = inicioMin;

    while (atual + duracaoMinutos <= fimMin) {
      const slotInicio = atual;
      const slotFim = atual + duracaoMinutos;

      const temConflito = intervalosOcupados.some((ocupado) => {
        return slotInicio < ocupado.fim && slotFim > ocupado.inicio;
      });

      if (!temConflito) {
        slotsDisponiveis.push(minutosParaHora(slotInicio));
      }

      // Avança de acordo com a duração do serviço selecionado
      atual += duracaoMinutos;
    }
  }

  return slotsDisponiveis;
}