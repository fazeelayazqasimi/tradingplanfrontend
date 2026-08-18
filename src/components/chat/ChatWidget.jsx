import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiHeadphones } from 'react-icons/fi';
import toast from 'react-hot-toast';
import chatService from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, getInitials } from '../../utils/helpers';

const POLL_INTERVAL = 5000;

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const isMe = (msg) => String(msg.sender?._id || msg.sender) === String(user?._id);

  const loadChat = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await chatService.getMyChat();
      const data = res?.data?.data || res?.data || res;
      setChat(data);
      if (data?.lastMessageAt) {
        await chatService.markRead(data._id || data.id);
      }
    } catch {
      if (!silent) toast.error('Failed to load chat');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadUnread = useCallback(async () => {
    try {
      const res = await chatService.getUnreadCount();
      const data = res?.data?.data || res?.data || res;
      setUnreadCount(Number(data?.count || 0));
    } catch {
      // ignore polling errors
    }
  }, []);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadUnread]);

  useEffect(() => {
    if (!open) return;
    setUnreadCount(0);
    loadChat();
    const interval = setInterval(() => loadChat(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [open, loadChat]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (open && chat?.messages) {
      setTimeout(scrollToBottom, 100);
    }
  }, [open, chat?.messages, scrollToBottom]);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    if (!chat) {
      toast.error('Chat abhi load nahi hua. Thodi der baad try karo.');
      return;
    }
    try {
      setSending(true);
      const chatId = chat._id || chat.id;
      const res = await chatService.sendMessage(chatId, text);
      const data = res?.data?.data || res?.data || res;
      setChat(data);
      setMessage('');
      scrollToBottom();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const messages = chat?.messages || [];

  return (
    <>
      <button
        onClick={handleOpen}
        className={`fixed bottom-20 lg:bottom-6 left-4 lg:left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-card-lg transition-all duration-300 hover:scale-105 ${
          open ? 'bg-dark-600 text-white' : 'bg-primary-500 text-white'
        }`}
        title="Chat with Admin / Support"
      >
        {open ? <FiX size={24} /> : <FiMessageCircle size={24} />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 lg:bottom-24 left-4 lg:left-6 z-50 flex w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-card-lg border border-dark-100"
            style={{ height: 'min(32rem, calc(100vh - 12rem))' }}
          >
            <div className="flex items-center gap-3 border-b border-dark-100 bg-primary-500 px-4 py-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                <FiHeadphones size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">Admin & Support Team</p>
                <p className="text-xs text-white/80">We usually reply within a few minutes</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-dark-50 p-4 space-y-4 scrollbar-thin">
              {loading && !chat ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-dark-200" />
                      <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-dark-200" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-500 mb-3">
                    <FiMessageCircle size={26} />
                  </div>
                  <p className="text-sm font-medium text-dark-700">Start a conversation</p>
                  <p className="mt-1 max-w-[220px] text-xs text-dark-400">
                    Send a message and our Admin / Support team will reply here.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const mine = isMe(msg);
                  const senderName = msg.sender?.firstName
                    ? `${msg.sender.firstName} ${msg.sender.lastName}`
                    : mine
                    ? 'You'
                    : 'Admin';
                  return (
                    <div key={msg._id || msg.id || idx} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                        mine ? 'bg-primary-500' : 'bg-dark-500'
                      }`}>
                        {mine ? getInitials(user?.firstName, user?.lastName) : 'AD'}
                      </div>
                      <div className={`max-w-[75%] ${mine ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-0.5 ${mine ? 'justify-end' : ''}`}>
                          <span className="text-[11px] font-medium text-dark-700">{senderName}</span>
                          <span className="text-[10px] text-dark-400">{formatDateTime(msg.createdAt)}</span>
                        </div>
                        <div className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                          mine ? 'bg-primary-500 text-white' : 'bg-white text-dark-700 border border-dark-100'
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
                  placeholder="Type your message..."
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
