import api from './api';

const chatService = {
  getMyChat: () => api.get('/chats/me'),
  getChat: (id) => api.get(`/chats/${id}`),
  getChats: () => api.get('/chats/all'),
  sendMessage: (id, message) => api.post(`/chats/${id}/messages`, { message }),
  markRead: (id) => api.put(`/chats/${id}/read`),
  getUnreadCount: () => api.get('/chats/unread-count'),
};

export default chatService;
