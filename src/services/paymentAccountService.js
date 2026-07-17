import api from './api';
const paymentAccountService = {
  getAccounts: () => api.get('/payment-accounts'),
};
export default paymentAccountService;
