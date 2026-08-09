import api from './api';

const websiteService = {
  getFAQs: (params) => api.get('/faqs/public', { params }),
  getContent: (page) => api.get(`/page-content/public?page=${page}`),
  getAllContent: () => api.get('/page-content/public'),
  getRanks: () => api.get('/ranks'),
  getSettings: () => api.get('/settings/public'),
  getCourses: (params) => api.get('/courses', { params }),
  getSignals: (params) => api.get('/signals', { params }),
  getForexRates: (params) => api.get('/market/forex-rates', { params }),
  getLiveRates: () => api.get('/market/live-rates'),
  getGoldPrice: () => api.get('/market/gold-price'),
  getEconomicEvents: () => api.get('/market/economic-events'),
  getMarketSessions: () => api.get('/market/market-sessions'),
  getBrokers: () => api.get('/brokers'),
};
export default websiteService;
