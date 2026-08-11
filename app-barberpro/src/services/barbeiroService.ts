import {api} from './api';

export interface BarbeiroDTO {
  id: number;
  usuario_id: number;
  especialidade?: string;
  bio?: string;
  ativo?: boolean;
  barbearia_id?: number;
  usuarios: {
    id: number;
    nome: string;
    email: string;
  };
}

export const barbeiroService = {
    async criarBarbeiro(barbeiro: any) {
      const response = await api.post("/barbeiros/create", barbeiro);
      return response.data;
    },

    async listarPorBarbearia(barbeariaId: number): Promise<BarbeiroDTO[]> {
        const response = await api.get<BarbeiroDTO[]>('/barbeiros');
        // Filtra no cliente caso o backend retorne todos
        return response.data.filter(b => b.barbearia_id === barbeariaId || !b.barbearia_id);
    },

    async obterHorariosDisponiveis(barbeiroId: number, data: string, servicoId: number): Promise<string[]> {
        const response = await api.get<string[]>(`/barbeiros/${barbeiroId}/horarios-disponiveis`, {
        params: { data, servicoId }
        });
        return response.data;
    },

    async buscarPorId(id: string) {
      const response = await api.get(`/barbeiros/${id}`);
      return response.data;
    },

    async atualizar(id: string, barbeiro: any) {
      const response = await api.patch(`/barbeiros/${id}`, barbeiro);
      return response.data;
    },

    async deletar(id: string) {
      const response = await api.delete(`/barbeiros/${id}`);
      return response.data;
    }
};




