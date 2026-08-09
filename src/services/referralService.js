import api from './api';
const referralService = {
  getReferralCode: () => api.get('/referrals/code'),
  getStats: () => api.get('/referrals/stats'),
  getTree: () => api.get('/referrals/tree'),
  getTreeChildren: (userId) => api.get(`/referrals/tree/${userId}`),
  getEarnings: (params) => api.get('/referrals/earnings', { params }),
};
export default referralService;
