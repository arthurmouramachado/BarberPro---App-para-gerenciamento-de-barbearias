import { api } from './api';

// 1. Contrato do Serviço
export interface ServicoDTO {
  id: number;
  nome: string;
  preco: number;
  duracaoMinutos?: number;
  barbeariaId?: number;
}

// 2. DTO para criação de serviço
export interface CriarServicoDTO {
  nome: string;
  preco: number;
  duracaoMinutos: number;
  barbeariaId: number;
}

export const servicosService = {
  async cadastrar(servico: CriarServicoDTO): Promise<ServicoDTO> {
    const response = await api.post<ServicoDTO>("/servicos/criar", servico);
    return response.data;
  },

  async listarTodas(barbeariaId: number): Promise<ServicoDTO[]> {
    const response = await api.get<ServicoDTO[]>("/servicos", {
      params: {
        barbeariaId: barbeariaId,
      },
    });
    return response.data;
  },

  async buscarPorId(id: number | string): Promise<ServicoDTO> {
    const response = await api.get<ServicoDTO>(`/servicos/${id}`);
    return response.data;
  },
};