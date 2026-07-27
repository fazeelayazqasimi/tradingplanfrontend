import api from './api';

const classService = {
  getClasses: (params) => api.get('/classes', { params }),
  getClass: (id) => api.get(`/classes/${id}`),
  createClass: (data) => api.post('/classes', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateClass: (id, data) => api.put(`/classes/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteClass: (id) => api.delete(`/classes/${id}`),
};

export default classService;