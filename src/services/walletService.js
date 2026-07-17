import api from './api';
const walletService = {
  getWallet: (type) => api.get('/wallets', { params: { type } }),
  getAllWallets: () => api.get('/wallets/all-types'),
  getWalletByType: (type) => api.get(`/wallets/type/${type}`),
  getTransactions: (params) => api.get('/wallets/transactions', { params }),
  getStats: () => api.get('/wallets/stats'),
};
export default walletService;
