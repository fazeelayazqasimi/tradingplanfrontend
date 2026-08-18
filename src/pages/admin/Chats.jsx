import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMessageCircle, FiSearch, FiSend, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import chatService from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, getInitials, truncate } from '../../utils/helpers';

const POLL_INTERVAL = 5000;

export default function Chats() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const fetchChats = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await chatService.getChats();
      const list = res?.data?.data || res?.data || res || [];
      setChats(Array.isArray(list) ? list : []);
    } catch {
      if (!silent) toast.error('Failed to load chats');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(() => fetchChats(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchChats]);

  const fetchActiveChat = useCallback(async (id, silent = false) => {
    try {
      const res = await chatService.getChat(id);
      const data = res?.data?.data || res?.data || res;
      setActiveChat(data);
      if (data?._id || data?.id) {
        await chatService.markRead(data._id || data.id);
      }
    } catch {
      if (!silent) toast.error('Failed to load conversation');
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchActiveChat(selectedId);
    const interval = setInterval(() => fetchActiveChat(selectedId, true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedId, fetchActiveChat]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (activeChat?.messages) {
      setTimeout(scrollToBottom, 100);
    }
  }, [activeChat?.messages, scrollToBottom]);

  const handleSelect = (chat) => {
    setSelectedId(chat._id || chat.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !activeChat) return;
    try {
      setSending(true);
      const chatId = activeChat._id || activeChat.id;
      const res = await chatService.sendMessage(chatId, text);
      const data = res?.data?.data || res?.data || res;
      setActiveChat(data);
      setMessage('');
      fetchChats(true);
      scrollToBottom();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const unreadOf = (chat) => {
    if (!chat?.messages?.length) return 0;
    const studentId = chat.userId?._id || chat.userId;
    return chat.messages.filter(m => !m.isRead && String(m.sender?._id || m.sender) === String(studentId)).length;
  };

  const lastMessageOf = (chat) => {
    const msgs = chat?.messages || [];
    return msgs.length ? msgs[msgs.length - 1] : null;
  };

  const filteredChats = search.trim()
    ? chats.filter((chat) => {
        const s = search.toLowerCase();
        const name = chat.userId ? `${chat.userId.firstName || ''} ${chat.userId.lastName || ''}` : '';
        return name.toLowerCase().includes(s) || (chat.userId?.email || '').toLowerCase().includes(s);
      })
    : chats;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Student Chats</h1>
          <p className="mt-1 text-sm text-dark-500">
            Chat with students directly. All conversations are shown here.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-stretch">
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="border-b border-dark-100 p-3">
            <div className="relative">
              <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-[11px] border border-dark-200 bg-dark-50 pl-9 pr-4 py-2.5 text-sm text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[400px] lg:min-h-[560px] scrollbar-thin">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3 animate-pulse">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-dark-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/2 rounded bg-dark-200" />
                      <div className="h-3 w-3/4 rounded bg-dark-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <FiUsers size={32} className="text-dark-300 mb-2" />
                <p className="text-sm font-medium text-dark-700">No conversations</p>
                <p className="mt-1 text-xs text-dark-400">
                  {search ? 'No student matches your search.' : 'Students can start a chat from their portal.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-dark-50">
                {filteredChats.map((chat) => {
                  const id = chat._id || chat.id;
                  const isActive = id === selectedId;
                  const student = chat.userId || {};
                  const lastMsg = lastMessageOf(chat);
                  const unread = unreadOf(chat);
                  const name = student.firstName ? `${student.firstName} ${student.lastName}` : 'Student';
                  return (
                    <button
                      key={id}
                      onClick={() => handleSelect(chat)}
                      className={`flex w-full items-center gap-3 p-3.5 text-left transition-colors duration-200 ${
                        isActive ? 'bg-primary-50' : 'hover:bg-dark-50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {student.avatar ? (
                          <img src={student.avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                            {getInitials(student.firstName, student.lastName)}
                          </div>
                        )}
                        {unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white border-2 border-white">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${isActive ? 'font-bold text-primary-700' : 'font-semibold text-ink'}`}>
                            {name}
                          </p>
                          {lastMsg && (
                            <span className="text-[10px] text-dark-400 shrink-0">
                              {formatDateTime(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-dark-400 truncate">
                          {lastMsg
                            ? `${String(lastMsg.sender?._id || lastMsg.sender) === String(user?._id) ? 'You: ' : ''}${lastMsg.message}`
                            : 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col">
          {!activeChat ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] lg:min-h-[560px] p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500 mb-4">
                <FiMessageCircle size={30} />
              </div>
              <p className="text-base font-semibold text-ink">Select a conversation</p>
              <p className="mt-1 max-w-xs text-sm text-dark-400">
                Choose a student from the list on the left to view and reply to their messages.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-dark-100 px-4 py-3">
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                    {getInitials(activeChat.userId?.firstName, activeChat.userId?.lastName)}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink truncate">
                    {activeChat.userId ? `${activeChat.userId.firstName} ${activeChat.userId.lastName}` : 'Student'}
                  </p>
                  <p className="text-xs text-dark-400 truncate">{activeChat.userId?.email}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-dark-50 p-4 space-y-4 min-h-[400px] lg:min-h-[480px] scrollbar-thin">
                {(activeChat.messages || []).length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <FiMessageCircle size={28} className="text-dark-300 mb-2" />
                    <p className="text-sm text-dark-500">No messages yet. Send the first message.</p>
                  </div>
                ) : (
                  (activeChat.messages || []).map((msg, idx) => {
                    const mine = String(msg.sender?._id || msg.sender) === String(user?._id);
                    const senderName = msg.sender?.firstName
                      ? `${msg.sender.firstName} ${msg.sender.lastName}`
                      : mine ? 'You' : 'Student';
                    return (
                      <div key={msg._id || msg.id || idx} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                          mine ? 'bg-dark-500' : 'bg-primary-500'
                        }`}>
                          {mine ? getInitials(user?.firstName, user?.lastName) : getInitials(activeChat.userId?.firstName, activeChat.userId?.lastName)}
                        </div>
                        <div className={`max-w-[75%] ${mine ? 'text-right' : ''}`}>
                          <div className={`flex items-center gap-2 mb-0.5 ${mine ? 'justify-end' : ''}`}>
                            <span className="text-[11px] font-medium text-dark-700">{senderName}</span>
                            <span className="text-[10px] text-dark-400">{formatDateTime(msg.createdAt)}</span>
                          </div>
                          <div className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                            mine ? 'bg-dark-600 text-white' : 'bg-white text-dark-700 border border-dark-100'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-dark-100 bg-white p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 rounded-full border border-dark-200 bg-dark-50 px-4 py-2.5 text-sm text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-all duration-200 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <FiSend size={16} />
                  </button>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
