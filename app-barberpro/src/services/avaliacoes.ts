import { api } from "./api";

export const avaliacoesService = {
  async avaliar(avaliacao: any) {
    const response = await api.post("/avaliacoes/avaliar", avaliacao);
    return response.data;
  },

  async listarTodas() {
    const response = await api.get("/avaliacoes");
    return response.data;
  },

  async buscarPorId(id: string) {
    const response = await api.get(`/avaliacoes/${id}`);
    return response.data;
  },

  async deletarAvaliacao(id: string) {
    const response = await api.delete(`/avaliacoes/${id}`);
    return response.data;
  },

  // Busca todas as avaliações e calcula a média para um barbeiro específico
  async obterMediaBarbeiro(barbeiroId: number | string) {
    const todas = await this.listarTodas();

    const avaliacoesDoBarbeiro = todas.filter(
      (item: any) =>
        item.agendamentos?.barbeiro_id === Number(barbeiroId) ||
        item.agendamentos?.barbeiros?.id === Number(barbeiroId)
    );

    if (avaliacoesDoBarbeiro.length === 0) {
      return { media: "0.0", total: 0 };
    }

    const soma = avaliacoesDoBarbeiro.reduce(
      (acc: number, item: any) => acc + (item.nota || 0),
      0
    );

    const media = (soma / avaliacoesDoBarbeiro.length).toFixed(1);

    return {
      media,
      total: avaliacoesDoBarbeiro.length,
    };
  },
};