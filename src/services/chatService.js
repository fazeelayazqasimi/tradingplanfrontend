import api from './api';

const chatService = {
  getMyChat: () => api.get('/chats/me'),
  getChat: (id) => api.get(`/chats/${id}`),
  getChats: () => api.get('/chats/all'),
  sendMessage: (id, { message = '', file = null } = {}) => {
    if (file) {
      const form = new FormData();
      if (message) form.append('message', message);
      form.append('file', file);
      return api.post(`/chats/${id}/messages`, form);
    }
    return api.post(`/chats/${id}/messages`, { message });
  },
  markRead: (id) => api.put(`/chats/${id}/read`),
  getUnreadCount: () => api.get('/chats/unread-count'),
};

export default chatService;
