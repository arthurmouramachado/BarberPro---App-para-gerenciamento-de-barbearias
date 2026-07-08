import {api} from './api';

export const disponibilidadeService = {
    async criarDisponibilidade(disponibilidade: any) {
      const response = await api.post("/disponibilidade/cadastrar", disponibilidade);
      return response.data;
    },

    async listarTodas() {
      const response = await api.get("/disponibilidade");
      return response.data;
    },

    async buscarPorId(id: string) {
      const response = await api.get(`/disponibilidade/${id}`);
      return response.data;
    },

    async atualizarDisponibilidade(id: string, disponibilidade: any) {
      const response = await api.patch(`/disponibilidade/${id}`, disponibilidade);
      return response.data;
    },

    async deletarDisponibilidade(id: string) {
      const response = await api.delete(`/disponibilidade/${id}`);
      return response.data;
    }
};