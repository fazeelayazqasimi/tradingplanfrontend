import api from './api';
const marketUpdateService = {
  getMarketUpdates: (params) => api.get('/market-updates', { params }),
  getMarketUpdate: (id) => api.get(`/market-updates/${id}`),
  createMarketUpdate: (data) => api.post('/market-updates', data),
  updateMarketUpdate: (id, data) => api.put(`/market-updates/${id}`, data),
  deleteMarketUpdate: (id) => api.delete(`/market-updates/${id}`),
  getStats: () => api.get('/market-updates/stats'),
};
export default marketUpdateService;