import api from './api';
const depositService = {
  createDeposit: (data) => api.post('/deposits', data),
  getMyDeposits: (params) => api.get('/deposits/mine', { params }),
};
export default depositService;
