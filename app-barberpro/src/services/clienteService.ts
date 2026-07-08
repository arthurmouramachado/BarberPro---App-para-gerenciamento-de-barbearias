import { api } from "./api"

export const clienteService = {
    async listarTodos() {
        const response = await api.get("/clientes");
        return response.data;
    },

    async buscarPorId(id: string) {
        const response = await api.get(`/clientes/${id}`);
        return response.data;
    },

    async atualizarCliente(id: string, cliente: any) {
        const response = await api.patch(`/clientes/${id}`, cliente);
        return response.data;
    },

    async deletarCliente(id: string) {
        const response = await api.delete(`/clientes/${id}`);
        return response.data;
    }

};