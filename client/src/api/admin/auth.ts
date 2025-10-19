import apiClient from './client';

export const authApi = {
  login: async (password: string) => {
    const response = await apiClient.post('/auth/login', { password });
    return response.data;
  },

  verify: async () => {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },
};