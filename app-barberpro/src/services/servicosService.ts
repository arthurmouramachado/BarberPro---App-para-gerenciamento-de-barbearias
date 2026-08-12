import { api } from './api';

// 1. Contrato do Serviço
export interface ServicoDTO {
  ativo: any;
  tipo: string;
  descricao: any;
  duracao: number;
  id: number;
  nome: string;
  preco: number;
  duracao_minutos?: number;
  barbearia_id?: number;
}

// 2. DTO para criação de serviço
export interface CriarServicoDTO {
  nome: string;
  preco: number;
  duracao_minutos: number;
  barbearia_id: number;
  descricao?: string;
}

export const servicosService = {
  async cadastrar(servico: CriarServicoDTO): Promise<ServicoDTO> {
    const response = await api.post<ServicoDTO>("/servicos/criar", servico);
    return response.data;
  },

  async listarTodas(barbeariaId: number): Promise<ServicoDTO[]> {
    const response = await api.get<ServicoDTO[]>("/servicos", {
      params: {
        barbearia_id: barbeariaId,
      },
    });
    return response.data;
  },
  async atualizar(id: number | string, servico: Partial<CriarServicoDTO>): Promise<ServicoDTO> {
    const response = await api.patch<ServicoDTO>(`/servicos/${id}`, servico);
    return response.data;
  },

  async listarPorBarbeiro(barbeiroId: number): Promise<ServicoDTO[]> {
    console.log("--> ID enviado para busca:", barbeiroId);
    console.log("--> Rota chamada:", `/servicos/barbeiro/${barbeiroId}`);

    const response = await api.get<ServicoDTO[]>(`/servicos/${barbeiroId}`);
    return response.data;
  },

  async buscarPorId(id: number | string): Promise<ServicoDTO> {
    const response = await api.get<ServicoDTO>(`/servicos/${id}`);
    return response.data;
  },

  async deletar(id: number | string): Promise<void> {
    await api.delete(`/servicos/${id}`);
  }
};