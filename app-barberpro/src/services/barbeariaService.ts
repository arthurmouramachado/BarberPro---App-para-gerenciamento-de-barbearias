import { api } from './api';

// 1. O Contrato de Interface (O formato exato do seu Card no App)
export interface BarbeariaCardDTO {
  id: number;
  nome: string;               // Nome vindo do banco
  foto_url: string;           // URL da imagem
  localBarbearia: string;     // Ex: Endereço ou bairro
  diaEHorario: string;        // Ex: "seg-sab das 8h às 18h30"
  mediaAvaliacoes: number;    // A nota média que calculamos no NestJS!
  distanciaKM?: number;       // Opcional, pois dependerá do GPS do usuário futuramente
}

// Interface opcional para o cadastro
export interface CriarBarbeariaDTO {
  nome: string;
  localBarbearia: string;
  diaEHorario: string;
}

export const barbeariaService = {
  // Tipamos o parâmetro de entrada
  async cadastrar(barbearia: CriarBarbeariaDTO) {
    const response = await api.post("/barbearias/criar", barbearia);
    return response.data;
  },

  // Tipamos que o retorno será uma lista de BarbeariaCardDTO
  async listarTodas(): Promise<BarbeariaCardDTO[]> {
    const response = await api.get<BarbeariaCardDTO[]>("/barbearias");
    return response.data;
  },

  // Tipamos que o retorno será uma única barbearia
  async buscarPorId(id: string): Promise<BarbeariaCardDTO> {
    const response = await api.get<BarbeariaCardDTO>(`/barbearias/${id}`);
    return response.data;
  }
};