import api from './api';
const referralService = {
  getReferralCode: () => api.get('/referrals/code'),
  getStats: (params = {}) => api.get('/referrals/stats', { params }),
  getTree: (params = {}) => api.get('/referrals/tree', { params }),
  getTreeChildren: (userId) => api.get(`/referrals/tree/${userId}`),
  getEarnings: (params) => api.get('/referrals/earnings', { params }),
};
export default referralService;
