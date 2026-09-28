import api from './api';

export const transactionService = {
  getPurchases: async () => {
    const response = await api.get('/api/purchases');
    return response.data;
  },

  createPurchase: async (data) => {
    const response = await api.post('/api/purchases', data);
    return response.data;
  },

  getTransfers: async () => {
    const response = await api.get('/api/transfers');
    return response.data;
  },

  createTransfer: async (data) => {
    const response = await api.post('/api/transfers', data);
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/api/assignments');
    return response.data;
  },

  createAssignment: async (data) => {
    const response = await api.post('/api/assignments', data);
    return response.data;
  },

  getExpenditures: async () => {
    const response = await api.get('/api/expenditures');
    return response.data;
  },

  createExpenditure: async (data) => {
    const response = await api.post('/api/expenditures', data);
    return response.data;
  }
};
