import api from './api';
const referralService = {
  getReferralCode: () => api.get('/referrals/code'),
  getStats: () => api.get('/referrals/stats'),
  getTree: () => api.get('/referrals/tree'),
  getEarnings: (params) => api.get('/referrals/earnings', { params }),
};
export default referralService;
