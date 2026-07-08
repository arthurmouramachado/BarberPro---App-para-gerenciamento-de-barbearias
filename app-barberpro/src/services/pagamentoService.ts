// src/services/pagamentoService.ts
import { api } from './api';

export interface CriarPagamentoInput {
  agendamento_id: number;
  valor: number;
  metodo: 'PIX';
  cpf: string;
}

export const pagamentoService = {
  //  FLUXO DE PAGAMENTO DO CLIENTE

  // Dispara a criação do Pix no AbacatePay via seu Back-end
  async criarPix(dados: CriarPagamentoInput) {
    const response = await api.post('/pagamentos/pagar', dados);
    return response.data;
  },

  // Polling para o celular saber se o status mudou para 'Confirmado'
  async verificarStatus(pagamentoId: number) {
    const response = await api.get(`/pagamentos/${pagamentoId}/status`);
    return response.data;
  },

  // Útil para testar no desenvolvimento sem gastar dinheiro real
  async simularPagamento(pagamentoId: number) {
    const response = await api.post(`/pagamentos/simular/${pagamentoId}`);
    return response.data;
  },

  //  FLUXO DE GESTÃO / ADMINISTRATIVO (ADMIN) e BARBEIRO
  
  // GET /pagamentos/abacate/listar
  // Traz a lista bruta de cobranças direto de dentro da API do AbacatePay
  async listarDiretoDoAbacate() {
    const response = await api.get('/pagamentos/abacate/listar');
    return response.data;
  },

  // GET /pagamentos
  // Lista todos os registros de pagamentos salvos no seu banco de dados local (Prisma)
  async listarTodosLocal() {
    const response = await api.get('/pagamentos');
    return response.data;
  },

  // GET /pagamentos/:id
  // Busca os detalhes de um pagamento específico salvo no seu banco de dados
  async buscarPorId(id: number) {
    const response = await api.get(`/pagamentos/${id}`);
    return response.data;
  },

  // PATCH /pagamentos/:id
  // Atualiza um registro de pagamento localmente (ex: mudar o status manualmente)
  async atualizar(id: number, pagamentoData: any) {
    const response = await api.patch(`/pagamentos/${id}`, pagamentoData);
    return response.data;
  },

  // DELETE /pagamentos/:id
  // Remove um registro de pagamento do seu banco de dados local
  async deletar(id: number) {
    const response = await api.delete(`/pagamentos/${id}`);
    return response.data;
  }
};