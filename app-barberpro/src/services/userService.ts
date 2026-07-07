import {api} from './api';

export const userService = {
    async criarUser(user: any) {
      const response = await api.post("/user/create", user);
      return response.data;
    },

    async listarUser() {
        const response = await api.get('/user');
        return response.data;
    },
    
    async buscarPorId(id: string) {
        const response = await api.get(`/user/${id}`);
        return response.data;
    },
    
    async alterarPerfil(userId: string, userData: any) {
        const response = await api.put(`/user/${userId}`, userData);
        return response.data;
    },

    async deletar(id: string) {
      const response = await api.delete(`/user/${id}`);
      return response.data;
    }
};