import api from './api';

export const auditService = {
  getAuditLogs: async () => {
    const response = await api.get('/api/audit-logs');
    return response.data;
  }
};
