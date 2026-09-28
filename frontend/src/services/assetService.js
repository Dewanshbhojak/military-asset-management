import api from './api';

export const assetService = {
  getBases: async () => {
    const response = await api.get('/api/bases');
    return response.data;
  },

  getBaseById: async (id) => {
    const response = await api.get(`/api/bases/${id}`);
    return response.data;
  },

  createBase: async (baseData) => {
    const response = await api.post('/api/bases', baseData);
    return response.data;
  },

  getEquipment: async () => {
    const response = await api.get('/api/equipment');
    return response.data;
  },

  createEquipment: async (equipmentData) => {
    const response = await api.post('/api/equipment', equipmentData);
    return response.data;
  },

  getInventory: async (baseId) => {
    const url = baseId ? `/api/inventory/${baseId}` : '/api/inventory';
    const response = await api.get(url);
    return response.data;
  }
};
