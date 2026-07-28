import api from './api';
const zoomSessionService = {
  getZoomSessions: (params) => api.get('/zoom-sessions', { params }),
  getZoomSession: (id) => api.get(`/zoom-sessions/${id}`),
  createZoomSession: (data) => api.post('/zoom-sessions', data),
  updateZoomSession: (id, data) => api.put(`/zoom-sessions/${id}`, data),
  deleteZoomSession: (id) => api.delete(`/zoom-sessions/${id}`),
  register: (id) => api.post(`/zoom-sessions/${id}/register`),
  unregister: (id) => api.delete(`/zoom-sessions/${id}/unregister`),
  getMyRegistrations: (params) => api.get('/zoom-sessions/me/registrations', { params }),
  getStats: () => api.get('/zoom-sessions/stats'),
};
export default zoomSessionService;