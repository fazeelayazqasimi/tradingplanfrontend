import api from './api';
const depositService = {
  createDeposit: (data) => api.post('/deposits', data),
  getMyDeposits: (params) => api.get('/deposits/mine', { params }),
  getSupportedCoins: () => api.get('/deposits/coins'),
  uploadScreenshot: (formData) => api.post('/deposits/upload-screenshot', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verifyCryptoPayment: (paymentRef) => api.post('/deposits/verify-crypto', { paymentRef }),
  getTransactionInfo: (id) => api.get(`/deposits/${id}`),
};
export default depositService;
