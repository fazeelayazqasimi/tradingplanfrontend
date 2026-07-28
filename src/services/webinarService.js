import api from './api';
const webinarService = {
  getWebinars: (params) => api.get('/webinars', { params }),
  getWebinar: (id) => api.get(`/webinars/${id}`),
  createWebinar: (data) => api.post('/webinars', data),
  updateWebinar: (id, data) => api.put(`/webinars/${id}`, data),
  deleteWebinar: (id) => api.delete(`/webinars/${id}`),
  register: (id) => api.post(`/webinars/${id}/register`),
  unregister: (id) => api.delete(`/webinars/${id}/unregister`),
  getMyRegistrations: (params) => api.get('/webinars/me/registrations', { params }),
  getStats: () => api.get('/webinars/stats'),
};
export default webinarService;