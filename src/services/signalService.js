import api from './api';
const signalService = {
  getSignals: (params) => api.get('/signals', { params }),
  getSignal: (id) => api.get(`/signals/${id}`),
  createSignal: (data) => api.post('/signals', data),
  updateSignal: (id, data) => api.put(`/signals/${id}`, data),
  deleteSignal: (id) => api.delete(`/signals/${id}`),
  getStats: () => api.get('/signals/stats'),
  hitTP: (id, price, tpIndex = null) => api.post(`/signals/${id}/hit-tp`, { price, tpIndex }),
  hitSL: (id, price) => api.post(`/signals/${id}/hit-sl`, { price }),
  closeSignal: (id, price) => api.post(`/signals/${id}/close`, { price }),
  runResultCheck: () => api.post('/signals/run-check'),
};
export default signalService;
