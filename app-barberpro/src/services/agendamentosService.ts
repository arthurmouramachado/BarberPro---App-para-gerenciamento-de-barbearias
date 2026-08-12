import { api } from './api';

export interface AgendamentoDTO {
  horario: any;
  duracao_minutos: number;
  id: number;
  cliente_id: number;
  barbeiro_id: number;
  servico_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  clientes?: {
    id: number;
    usuarios: {
      nome: string;
      telefone?: string;
      foto_url?: string;
    };
  };
  servicos?: {
    id: number;
    nome: string;
    preco: number | string;
    duracao: number;
  };
}

export interface CriarAgendamentoDTO {
  cliente_id: number;
  barbeiro_id: number;
  servico_id: number;
  data: string;        // "YYYY-MM-DD"
  hora_inicio: string; // "HH:mm:ss"
  hora_fim: string;    // "HH:mm:ss"
  status?: string;
}

export const agendamentosService = {
  async marcar(agendamento: CriarAgendamentoDTO) {
    const response = await api.post('/agendamentos/marcar', agendamento);
    return response.data;
  },

  async buscarPorBarbeiro(barbeiroId: number, data?: string): Promise<AgendamentoDTO[]> {
    const response = await api.get<AgendamentoDTO[]>(`/agendamentos/barbeiro/${barbeiroId}`, {
      params: { data },
    });
    return response.data;
  },

  async atualizarStatus(id: number, status: string) {
    const response = await api.patch(`/agendamentos/${id}`, { status });
    return response.data;
  },

  async buscarPorCliente(cliente_id: number) {
    const response = await api.get(`/agendamentos/cliente/${cliente_id}`);
    return response.data;
  },

  async cancelar(id: number | string) {
    const response = await api.delete(`/agendamentos/${id}`);
    return response.data;
  }
};