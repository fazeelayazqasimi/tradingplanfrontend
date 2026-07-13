import api from './api';
const courseService = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (slug) => api.get(`/courses/${slug}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  addLesson: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
  updateLesson: (courseId, lessonId, data) => api.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, lessonId) => api.delete(`/courses/${courseId}/lessons/${lessonId}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  getProgress: (id) => api.get(`/courses/${id}/progress`),
  updateProgress: (id, lessonId) => api.put(`/courses/${id}/progress`, { lessonId }),
  getEnrolled: () => api.get('/courses/enrolled'),
};
export default courseService;
