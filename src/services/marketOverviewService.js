import api from './api';
const marketOverviewService = {
  getMarketOverview: () => api.get('/market-overview'),
};
export default marketOverviewService;