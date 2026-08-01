import {api} from './api';

export interface DisponibilidadeDTO {
  id: number;
  barbeiro_id: number;
  dia_da_semana: number; 
  hora_inicio: string;  
  hora_fim: string;     
}

export const disponibilidadeService = {
    async criarDisponibilidade(disponibilidade: any) {
      const response = await api.post("/disponibilidade/cadastrar", disponibilidade);
      return response.data;
    },

    async listarTodas(): Promise<DisponibilidadeDTO[]> {
      const response = await api.get("/disponibilidade");
      return response.data;
    },

    async listarPorBarbeiro(barbeiroId: number): Promise<DisponibilidadeDTO[]> {
      const todas = await this.listarTodas();
      return todas.filter((d) => d.barbeiro_id === barbeiroId);
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