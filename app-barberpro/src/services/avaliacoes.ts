import { api } from "./api"

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
    }
};