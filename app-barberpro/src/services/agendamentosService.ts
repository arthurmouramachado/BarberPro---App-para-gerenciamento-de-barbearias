import {api} from './api';
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
    const response = await api.post("/agendamentos/marcar", agendamento);
    return response.data;
  },
  async listarTodas() {
    const response = await api.get("/agendamentos");
    return response.data;
  },
  async buscarPorId(id: number | string) {
    const response = await api.get(`/agendamentos/${id}`);
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