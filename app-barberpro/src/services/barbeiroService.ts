import {api} from './api';

export const barbeiroService = {
    async criarBarbeiro(barbeiro: any) {
      const response = await api.post("/barbeiros/create", barbeiro);
      return response.data;
    },

    async listarPorBarbearia(barbeariaId: number) {
        const response = await api.get('/barbeiros', {
            params: { barbeariaId }
        });
        return response.data;
    },

    // Aquela nossa rota inteligente que calcula os slots com base na duração do serviço
    async obterHorariosDisponiveis(barbeiroId: number, data: string, servicoId: number) {
        const response = await api.get(`/barbeiros/${barbeiroId}/horarios-disponiveis`, {
            params: { data, servicoId }
        });
        return response.data;
    },

    async buscarPorId(id: string) {
      const response = await api.get(`/barbeiros/${id}`);
      return response.data;
    },

    async deletar(id: string) {
      const response = await api.delete(`/barbeiros/${id}`);
      return response.data;
    }
};