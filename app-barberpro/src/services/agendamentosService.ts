import {api} from './api';

export const agendamentosService = {
    async marcar(agendamentos: any) {
      const response = await api.post("/agendamentos/marcar", agendamentos);
      return response.data;
    },
    async listarTodas() {
      const response = await api.get("/agendamentos",)
      return response.data;
    },

    async buscarPorId(id: string) {
      const response = await api.get(`/agendamentos/${id}`);
      return response.data;
    },

    async buscarPorCliente(cliente_id: Number) {
      const response = await api.get(`/agendamentos/cliente/${cliente_id}`);
      return response.data;
    },

    async cancelar(id: string) {
      const response = await api.delete(`/agendamentos/${id}`);
      return response.data;
    }
};