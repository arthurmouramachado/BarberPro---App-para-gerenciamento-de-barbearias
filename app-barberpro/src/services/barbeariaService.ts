import { api } from './api';
import { ServicoDTO } from './servicosService';

// 1. O Contrato de Interface (O formato exato do seu Card no App)
export interface BarbeariaCardDTO {
  id: number;
  nome: string;               // Nome vindo do banco
  foto_url: string;           // URL da imagem
  endereco: string;     // Ex: Endereço ou bairro
  diaEHorario: string;        // Ex: "seg-sab das 8h às 18h30"
  mediaAvaliacoes: number;    // A nota média que calculamos no NestJS!
  distanciaKM?: number;       // Opcional, pois dependerá do GPS do usuário futuramente
}

// Interface opcional para o cadastro
export interface CriarBarbeariaDTO {
  nome: string;
  endereco: string;
  diaEHorario: string;
}

// Interface estendida para a tela de detalhes
export interface BarbeariaDetalhesDTO extends BarbeariaCardDTO {
  servicos: ServicoDTO[];
}

export const barbeariaService = {
  // Tipamos o parâmetro de entrada
  async cadastrar(barbearia: CriarBarbeariaDTO) {
    const response = await api.post("/barbearias/criar", barbearia);
    return response.data;
  },

  async listarTodas(): Promise<BarbeariaCardDTO[]> {
    const response = await api.get<BarbeariaCardDTO[]>("/barbearias");
    return response.data;
  },

  // Retorna a Barbearia COMPLETA com os serviços inclusos
  async buscarPorId(id: number | string): Promise<BarbeariaDetalhesDTO> {
    const response = await api.get<BarbeariaDetalhesDTO>(`/barbearias/${id}`);
    return response.data;
  },
};