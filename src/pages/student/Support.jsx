import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeadphones,
  FiPlus,
  FiArrowLeft,
  FiSend,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import studentService from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, getInitials } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'course', label: 'Course Related' },
  { value: 'account', label: 'Account Issue' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const categoryColors = {
  general: 'neutral',
  technical: 'info',
  billing: 'warning',
  course: 'purple',
  account: 'danger',
  other: 'neutral',
};

const priorityColors = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

const statusColors = {
  open: 'info',
  in_progress: 'warning',
  pending: 'warning',
  resolved: 'success',
  closed: 'neutral',
};

function TicketSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-4 shrink-0" />
      </div>
    </Card>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef(null);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
  });

  const { page, limit, goToPage } = usePagination(1, 10);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, perPage: limit, sort: '-updatedAt' };
      const res = await studentService.getTickets(params);
      const data = res?.data?.data || res?.data || res;
      const list = data?.tickets || data?.data || data;
      setTickets(Array.isArray(list) ? list : []);
      setTotalPages(data.totalPages || data.meta?.totalPages || Math.ceil((data.total || 0) / limit) || 1);
      setTotalItems(data.total || data.meta?.total || (Array.isArray(list) ? list.length : 0));
    } catch {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchTicketDetail = useCallback(async (ticketId) => {
    try {
      setDetailLoading(true);
      const res = await studentService.getTicket(ticketId);
      const data = res?.data?.data || res?.data || res;
      const ticket = data?.ticket || data;
      setTicketDetail(ticket);
    } catch {
      toast.error('Failed to load ticket details');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetail(selectedTicket._id || selectedTicket.id);
    }
  }, [selectedTicket, fetchTicketDetail]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (ticketDetail) {
      setTimeout(scrollToBottom, 100);
    }
  }, [ticketDetail, scrollToBottom]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim() || !newTicket.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setCreating(true);
      await studentService.createTicket(newTicket);
      toast.success('Ticket created successfully');
      setShowCreateModal(false);
      setNewTicket({ subject: '', category: '', priority: 'medium', message: '' });
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setSending(true);
      const ticketId = selectedTicket._id || selectedTicket.id;
      await studentService.addMessage(ticketId, { message: replyText.trim() });
      setReplyText('');
      await fetchTicketDetail(ticketId);
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    setSelectedTicket(null);
    setTicketDetail(null);
    setReplyText('');
  };

  const messages = ticketDetail?.messages || ticketDetail?.conversation || [];

  if (selectedTicket) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <FiArrowLeft size={18} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-ink truncate">
              {ticketDetail?.subject || selectedTicket.subject || 'Ticket'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge color={categoryColors[selectedTicket.category] || 'neutral'}>
                {selectedTicket.category || 'General'}
              </Badge>
              <Badge color={priorityColors[selectedTicket.priority] || 'neutral'}>
                {(selectedTicket.priority || 'medium').charAt(0).toUpperCase() + (selectedTicket.priority || 'medium').slice(1)}
              </Badge>
              <Badge color={statusColors[selectedTicket.status] || 'info'}>
                {(selectedTicket.status || 'open').replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          {detailLoading ? (
            <div className="p-6 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <MessageSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="max-h-[50vh] overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <FiMessageSquare size={32} className="mx-auto text-dark-300 mb-2" />
                    <p className="text-sm text-dark-500">No messages yet. Start the conversation below.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isStaff = msg.sender === 'admin' || msg.sender === 'staff' || msg.senderRole === 'admin' || msg.senderRole === 'staff' || msg.isStaff;
                    const senderName = msg.senderName || (msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : null) || (isStaff ? 'Support Team' : 'You');
                    const content = msg.message || msg.content || msg.text || '';
                    const createdAt = msg.createdAt || msg.timestamp;

                    return (
                      <motion.div
                        key={msg._id || msg.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${isStaff ? '' : 'flex-row-reverse'}`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${
                          isStaff ? 'bg-dark-500' : 'bg-primary-500'
                        }`}>
                          {isStaff ? 'ST' : getInitials(user?.firstName, user?.lastName)}
                        </div>
                        <div className={`flex-1 max-w-[75%] ${isStaff ? '' : 'text-right'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-dark-700">{senderName}</span>
                            <span className="text-xs text-dark-400">{formatDateTime(createdAt)}</span>
                          </div>
                          <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                            isStaff
                              ? 'bg-dark-100 text-dark-700'
                              : 'bg-primary-500 text-white'
                          }`}>
                            {content}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                <form onSubmit={handleSendReply} className="border-t border-dark-100 p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-all duration-200"
                    />
                    <Button
                      type="submit"
                      loading={sending}
                      disabled={!replyText.trim()}
                      className="shrink-0"
                    >
                      <FiSend size={16} />
                      Send
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Support Tickets</h1>
          <p className="mt-1 text-sm text-dark-500">
            Get help with any issues or questions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <FiPlus size={18} />
          New Ticket
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <TicketSkeleton key={i} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={FiHeadphones}
          title="No support tickets"
          description="You haven't created any support tickets yet. Click the button above to create one."
          action="Create Your First Ticket"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((ticket, idx) => {
              const id = ticket._id || ticket.id;
              const subject = ticket.subject || ticket.title || 'Untitled';
              const category = ticket.category || 'general';
              const priority = ticket.priority || 'medium';
              const status = ticket.status || 'open';
              const lastMessage = ticket.lastMessage || ticket.updatedAt || ticket.createdAt;
              const messageCount = ticket.messageCount || ticket.messages?.length || 0;

              return (
                <motion.div
                  key={id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card
                    hover
                    className="p-0 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center gap-4 p-5">
                      <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-primary-50">
                        <FiMessageSquare size={20} className="text-primary-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-ink text-sm sm:text-base truncate">
                          {subject}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge color={categoryColors[category] || 'neutral'}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Badge>
                          <Badge color={priorityColors[priority] || 'neutral'}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Badge>
                          <Badge color={statusColors[status] || 'info'}>
                            {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
                          <span className="flex items-center gap-1">
                            <FiClock size={12} />
                            {formatDateTime(lastMessage)}
                          </span>
                          {messageCount > 0 && (
                            <span className="flex items-center gap-1">
                              <FiMessageSquare size={12} />
                              {messageCount} message{messageCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <FiChevronRight size={18} className="text-dark-400 shrink-0" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-dark-500">
                {totalItems} ticket{totalItems !== 1 ? 's' : ''} total
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Support Ticket"
        size="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Input
            label="Subject"
            placeholder="Brief description of your issue"
            value={newTicket.subject}
            onChange={(e) => setNewTicket((prev) => ({ ...prev, subject: e.target.value }))}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              placeholder="Select category"
              options={CATEGORY_OPTIONS}
              value={newTicket.category}
              onChange={(e) => setNewTicket((prev) => ({ ...prev, category: e.target.value }))}
              required
            />
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={newTicket.priority}
              onChange={(e) => setNewTicket((prev) => ({ ...prev, priority: e.target.value }))}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Message</label>
            <textarea
              placeholder="Describe your issue in detail..."
              value={newTicket.message}
              onChange={(e) => setNewTicket((prev) => ({ ...prev, message: e.target.value }))}
              rows={5}
              required
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-all duration-200 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
