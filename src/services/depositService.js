import api from './api';
const depositService = {
  createDeposit: (data) => api.post('/deposits', data),
  getMyDeposits: (params) => api.get('/deposits/mine', { params }),
  getSupportedCoins: () => api.get('/deposits/coins'),
  verifyCryptoPayment: (paymentRef) => api.post('/deposits/verify-crypto', { paymentRef }),
  getTransactionInfo: (id) => api.get(`/deposits/${id}`),
};
export default depositService;
