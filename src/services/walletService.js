import api from './api';
const walletService = {
  getWallet: () => api.get('/wallets'),
  getTransactions: (params) => api.get('/wallets/transactions', { params }),
  getStats: () => api.get('/wallets/stats'),
};
export default walletService;
