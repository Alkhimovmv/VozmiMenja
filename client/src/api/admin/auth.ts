import apiClient from './client';

export const authApi = {
  login: async (credentials: { phone: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  verify: async () => {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },
};
