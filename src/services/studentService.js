import api from './api';
const studentService = {
  getSubscription: () => api.get('/subscriptions/me'),
  createSubscription: (data) => api.post('/subscriptions', data),
  cancelSubscription: () => api.put('/subscriptions/me/cancel'),
  requestWithdrawal: (data) => api.post('/withdrawals', data),
  getMyWithdrawals: (params) => api.get('/withdrawals', { params }),
  getMyCertificates: () => api.get('/certificates'),
  getAnnouncements: (params) => api.get('/announcements', { params }),
  getTickets: (params) => api.get('/support', { params }),
  createTicket: (data) => api.post('/support', data),
  getTicket: (id) => api.get(`/support/${id}`),
  addMessage: (id, data) => api.post(`/support/${id}/messages`, data),
  getCopyStats: () => api.get('/copy-trading/stats'),
  getCopyHistory: (params) => api.get('/copy-trading/history', { params }),
  getRanks: () => api.get('/ranks'),
  getMyRank: () => api.get('/ranks/me'),
  connectMT: (data) => api.post('/users/connect-mt', data),
  disconnectMT: () => api.delete('/users/disconnect-mt'),
  getSettings: () => api.get('/settings/public'),
};
export default studentService;
