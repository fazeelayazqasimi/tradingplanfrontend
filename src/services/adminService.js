import api from './api';

async function unwrap(promise) {
  const { data } = await promise;
  return data;
}

const adminService = {
  getDashboard: () => unwrap(api.get('/admin/dashboard')),
  getRevenue: (params) => unwrap(api.get('/admin/revenue', { params })),
  getActivityLogs: (params) => unwrap(api.get('/admin/activity-logs', { params })),
  getUsers: (params) => unwrap(api.get('/users', { params })),
  getUser: (id) => unwrap(api.get(`/users/${id}`)),
  updateUser: (id, data) => unwrap(api.put(`/users/${id}`, data)),
  getSubscriptions: (params) => unwrap(api.get('/subscriptions', { params })),
  updateSubscription: (id, data) => unwrap(api.put(`/subscriptions/${id}`, data)),
  approveSubscription: (id, data) => unwrap(api.put(`/subscriptions/${id}/approve`, data)),
  rejectSubscription: (id, data) => unwrap(api.put(`/subscriptions/${id}/reject`, data)),
  getWithdrawals: (params) => unwrap(api.get('/withdrawals', { params })),
  approveWithdrawal: (id) => unwrap(api.put(`/withdrawals/${id}/approve`)),
  rejectWithdrawal: (id, data) => unwrap(api.put(`/withdrawals/${id}/reject`, data)),
  markPaid: (id, data) => unwrap(api.put(`/withdrawals/${id}/paid`, data)),
  getRanks: () => unwrap(api.get('/ranks')),
  getRankDistribution: () => unwrap(api.get('/ranks/distribution')),
  overrideRank: (data) => unwrap(api.post('/ranks/override', data)),
  lockRank: (userId, data) => unwrap(api.put(`/ranks/${userId}/lock`, data)),
  unlockRank: (userId) => unwrap(api.put(`/ranks/${userId}/unlock`)),
  updateRank: (id, data) => unwrap(api.put(`/ranks/${id}`, data)),
  createRank: (data) => unwrap(api.post('/ranks', data)),
  getSettings: () => unwrap(api.get('/settings')),
  updateSetting: (data) => unwrap(api.put('/settings', data)),
  getAnnouncements: (params) => unwrap(api.get('/announcements', { params })),
  createAnnouncement: (data) => unwrap(api.post('/announcements', data)),
  deleteAnnouncement: (id) => unwrap(api.delete(`/announcements/${id}`)),
  getSupportTickets: (params) => unwrap(api.get('/support', { params })),
  updateTicketStatus: (id, data) => unwrap(api.put(`/support/${id}/status`, data)),
  assignTicket: (id, data) => unwrap(api.put(`/support/${id}/assign`, data)),
  getFAQs: (params) => unwrap(api.get('/faqs', { params })),
  createFAQ: (data) => unwrap(api.post('/faqs', data)),
  updateFAQ: (id, data) => unwrap(api.put(`/faqs/${id}`, data)),
  deleteFAQ: (id) => unwrap(api.delete(`/faqs/${id}`)),
  toggleFAQ: (id) => unwrap(api.put(`/faqs/${id}/toggle`)),
  getAllContent: () => unwrap(api.get('/page-content')),
  getPageContent: (page) => unwrap(api.get(`/page-content/${page}`)),
  createContent: (data) => unwrap(api.post('/page-content', data)),
  updateContent: (id, data) => unwrap(api.put(`/page-content/${id}`, data)),
  deleteContent: (id) => unwrap(api.delete(`/page-content/${id}`)),
  seedContent: () => unwrap(api.get('/page-content/seed')),

  getContacts: (params) => unwrap(api.get('/contact', { params })),
  getContact: (id) => unwrap(api.get(`/contact/${id}`)),
  updateContactStatus: (id, data) => unwrap(api.put(`/contact/${id}/status`, data)),
  deleteContact: (id) => unwrap(api.delete(`/contact/${id}`)),

  getAssignments: (params) => unwrap(api.get('/assignments', { params })),
  getAssignment: (id) => unwrap(api.get(`/assignments/${id}`)),
  createAssignment: (data) => unwrap(api.post('/assignments', data)),
  deleteAssignment: (id) => unwrap(api.delete(`/assignments/${id}`)),
  gradeAssignment: (id, submissionId, data) => unwrap(api.put(`/assignments/${id}/grade/${submissionId}`, data)),

  getQuizzes: (params) => unwrap(api.get('/quizzes', { params })),
  getQuiz: (id) => unwrap(api.get(`/quizzes/${id}`)),
  createQuiz: (data) => unwrap(api.post('/quizzes', data)),
  updateQuiz: (id, data) => unwrap(api.put(`/quizzes/${id}`, data)),
  deleteQuiz: (id) => unwrap(api.delete(`/quizzes/${id}`)),

  getAllCertificates: (params) => unwrap(api.get('/certificates/admin/all', { params })),
  createCertificate: (data) => unwrap(api.post('/certificates/admin', data)),
  deleteCertificate: (id) => unwrap(api.delete(`/certificates/admin/${id}`)),

  getAllWallets: (params) => unwrap(api.get('/wallets/all', { params })),
  getWalletStats: (params) => unwrap(api.get('/wallets/admin/stats', { params })),
  creditWallet: (userId, data) => unwrap(api.post(`/wallets/${userId}/credit`, data)),
};
export default adminService;
