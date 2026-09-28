import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/api/auth/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/api/auth/users', userData);
    return response.data;
  }
};
