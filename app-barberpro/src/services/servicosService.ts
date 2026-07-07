import {api} from './api';

export const servicosService = {
    async cadastrar(servicos: any) {
      const response = await api.post("/servicos/criar", servicos);
      return response.data;
    },
    async listarTodas(barbeariaId: number) {
      const response = await api.get("/servicos", {
        params: {
          barbeariaId: barbeariaId
        }
      });
      return response.data;
    },

    async buscarPorId(id: string) {
      const response = await api.get(`/servicos/${id}`);
      return response.data;
    }
};