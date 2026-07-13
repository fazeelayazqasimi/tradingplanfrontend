import api from './api';
const signalService = {
  getSignals: (params) => api.get('/signals', { params }),
  getSignal: (id) => api.get(`/signals/${id}`),
  createSignal: (data) => api.post('/signals', data),
  updateSignal: (id, data) => api.put(`/signals/${id}`, data),
  deleteSignal: (id) => api.delete(`/signals/${id}`),
  getStats: () => api.get('/signals/stats'),
};
export default signalService;
