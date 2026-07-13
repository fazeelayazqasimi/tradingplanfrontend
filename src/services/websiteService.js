import api from './api';

const websiteService = {
  getFAQs: (params) => api.get('/faqs/public', { params }),
  getContent: (page) => api.get(`/page-content/public?page=${page}`),
  getAllContent: () => api.get('/page-content/public'),
  getRanks: () => api.get('/ranks'),
  getSettings: () => api.get('/settings/public'),
  getCourses: (params) => api.get('/courses', { params }),
  getSignals: (params) => api.get('/signals', { params }),
};
export default websiteService;
