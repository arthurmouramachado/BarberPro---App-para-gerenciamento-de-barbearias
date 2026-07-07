import {api} from './api';

export const barbeariaService = {
    async cadastrar(barbearia: any) {
      const response = await api.post("/barbearias/criar", barbearia);
      return response.data;
    },
    async listarTodas() {
      const response = await api.get("/barbearias");
      return response.data;
    },

    async buscarPorId(id: string) {
      const response = await api.get(`/barbearias/${id}`);
      return response.data;
    }
};