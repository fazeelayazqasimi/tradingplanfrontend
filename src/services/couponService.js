import api from './api';
const couponService = {
  getCoupons: (params) => api.get('/coupons', { params }),
  getCoupon: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  validateCoupon: (data) => api.post('/coupons/validate', data),
  applyCoupon: (data) => api.post('/coupons/apply', data),
};
export default couponService;
