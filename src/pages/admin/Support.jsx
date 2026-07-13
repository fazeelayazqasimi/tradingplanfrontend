import { useState, useEffect, useCallback } from 'react';
import {
  FiMessageSquare,
  FiEye,
  FiFilter,
  FiSend,
  FiTag,
  FiUser,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiAlertTriangle,
  FiUserPlus,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import adminService from '../../services/adminService';
import { formatDateTime } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  resolved: { label: 'Resolved', color: 'success' },
  closed: { label: 'Closed', color: 'neutral' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'neutral', icon: FiCheckCircle },
  medium: { label: 'Medium', color: 'info', icon: FiAlertCircle },
  high: { label: 'High', color: 'warning', icon: FiAlertTriangle },
  urgent: { label: 'Urgent', color: 'danger', icon: FiAlertTriangle },
};

const STATUS_UPDATE_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_UPDATE_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const { page, perPage, setPage, total, setTotal } = usePagination(1, 10);

  const [detailModal, setDetailModal] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [showAssign, setShowAssign] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await adminService.getSupportTickets(params);
      const list = res.data || [];
      setTickets(Array.isArray(list) ? list : []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, statusFilter, priorityFilter, setTotal]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePriorityFilter = (value) => {
    setPriorityFilter(value);
    setPage(1);
  };

  const openDetail = async (ticket) => {
    setDetailModal(ticket);
    setNewStatus(ticket.status || 'open');
    setNewPriority(ticket.priority || 'medium');
    setInternalNote('');
    setShowAssign(false);
    setAssignTo('');
    setMessagesLoading(true);
    try {
      const res = await adminService.getSupportTicketMessages?.(ticket._id || ticket.id);
      const msgs = res?.data?.messages || res?.data || res?.messages || ticket.messages || [];
      setTicketMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      setTicketMessages(ticket.messages || []);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!detailModal) return;
    const ticketId = detailModal._id || detailModal.id;
    try {
      setUpdating(true);
      const payload = { status: newStatus };
      if (newPriority) payload.priority = newPriority;
      if (internalNote.trim()) payload.note = internalNote.trim();
      await adminService.updateTicketStatus(ticketId, payload);
      toast.success('Ticket updated successfully');
      setTickets((prev) =>
        prev.map((t) =>
          (t._id || t.id) === ticketId
            ? { ...t, status: newStatus, priority: newPriority || t.priority }
            : t
        )
      );
      setDetailModal((prev) =>
        prev && (prev._id || prev.id) === ticketId
          ? { ...prev, status: newStatus, priority: newPriority || prev.priority }
          : prev
      );
      setInternalNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!detailModal || !assignTo.trim()) return;
    const ticketId = detailModal._id || detailModal.id;
    try {
      setUpdating(true);
      await adminService.assignTicket(ticketId, { assignee: assignTo.trim() });
      toast.success('Ticket assigned successfully');
      setTickets((prev) =>
        prev.map((t) =>
          (t._id || t.id) === ticketId
            ? { ...t, assignedTo: assignTo.trim() }
            : t
        )
      );
      setDetailModal((prev) =>
        prev ? { ...prev, assignedTo: assignTo.trim() } : prev
      );
      setShowAssign(false);
      setAssignTo('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      header: 'Ticket',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <FiMessageSquare className="h-3.5 w-3.5 text-primary-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink">
              #{row.ticketNumber || row._id?.slice(-6) || '—'}
            </p>
            <p className="text-xs text-dark-500 truncate max-w-[200px]">
              {row.subject || 'No subject'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Student',
      accessor: (row) => (
        <span className="text-sm text-dark-500">
          {row.student?.firstName ? `${row.student.firstName} ${row.student.lastName}` : '—'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 text-sm text-dark-500">
          <FiTag size={12} />
          {row.category || 'General'}
        </span>
      ),
    },
    {
      header: 'Priority',
      accessor: (row) => {
        const cfg = PRIORITY_CONFIG[row.priority] || PRIORITY_CONFIG.medium;
        return <Badge color={cfg.color}>{cfg.label}</Badge>;
      },
    },
    {
      header: 'Status',
      accessor: (row) => {
        const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.open;
        return <Badge color={cfg.color}>{cfg.label}</Badge>;
      },
    },
    {
      header: 'Date',
      accessor: (row) => (
        <span className="text-sm text-dark-500 whitespace-nowrap">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: '',
      accessor: (row) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => openDetail(row)}
            className="p-2 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
            title="View conversation"
          >
            <FiEye size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Support Tickets</h1>
        <p className="text-sm text-dark-500 mt-1">
          Manage student support requests and conversations
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-ink">Tickets</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter size={15} className="text-dark-400" />
            <Select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              options={STATUS_OPTIONS}
              className="w-40"
            />
            <Select
              value={priorityFilter}
              onChange={(e) => handlePriorityFilter(e.target.value)}
              options={PRIORITY_OPTIONS}
              className="w-40"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          emptyMessage="No support tickets found"
        />

        {total > perPage && (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={Math.ceil(total / perPage)}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={
          detailModal
            ? `Ticket #${detailModal.ticketNumber || detailModal._id?.slice(-6) || ''}`
            : 'Ticket Details'
        }
        size="lg"
      >
        {detailModal && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink">
                  {detailModal.subject || 'No Subject'}
                </h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge color={(STATUS_CONFIG[detailModal.status] || STATUS_CONFIG.open).color}>
                    {(STATUS_CONFIG[detailModal.status] || STATUS_CONFIG.open).label}
                  </Badge>
                  <Badge color={(PRIORITY_CONFIG[detailModal.priority] || PRIORITY_CONFIG.medium).color}>
                    {(PRIORITY_CONFIG[detailModal.priority] || PRIORITY_CONFIG.medium).label}
                  </Badge>
                  {detailModal.category && (
                    <span className="inline-flex items-center gap-1 text-xs text-dark-500">
                      <FiTag size={11} />
                      {detailModal.category}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssign(!showAssign)}
              >
                <FiUserPlus size={14} />
                Assign
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-dark-500 uppercase tracking-wide">Student</p>
                <p className="font-medium text-ink mt-1">
                  <FiUser size={13} className="inline mr-1.5 text-dark-400" />
                  {detailModal.student?.firstName ? `${detailModal.student.firstName} ${detailModal.student.lastName}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-dark-500 uppercase tracking-wide">Created</p>
                <p className="font-medium text-ink mt-1">
                  <FiClock size={13} className="inline mr-1.5 text-dark-400" />
                  {formatDateTime(detailModal.createdAt)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-dark-500 uppercase tracking-wide">Assigned To</p>
                <p className="font-medium text-ink mt-1">
                  {detailModal.assignedTo || <span className="text-dark-400 italic">Unassigned</span>}
                </p>
              </div>
            </div>

            {showAssign && (
              <div className="p-3 rounded-xl border border-dark-200 bg-dark-50">
                <p className="text-xs font-medium text-dark-500 mb-2">Assign to admin</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter admin name or email"
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleAssign}
                    disabled={!assignTo.trim() || updating}
                    loading={updating}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t border-dark-100">
              <p className="text-xs font-medium text-dark-500 uppercase tracking-wide mb-3 pt-4">
                Conversation
              </p>
              {messagesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-3 w-20 rounded bg-dark-200" />
                      <div className="h-16 w-full rounded-lg bg-dark-100" />
                    </div>
                  ))}
                </div>
              ) : ticketMessages.length === 0 ? (
                <p className="text-sm text-dark-400 italic text-center py-4">No messages yet</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {ticketMessages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin' || msg.senderType === 'admin' || msg.isAdmin;
                    return (
                      <div
                        key={msg._id || msg.id || idx}
                        className={`rounded-xl p-3.5 ${
                          isAdmin
                            ? 'bg-primary-50 border border-primary-200 ml-6'
                            : 'bg-dark-50 border border-dark-100 mr-6'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs font-semibold ${isAdmin ? 'text-primary-600' : 'text-dark-700'}`}>
                            {isAdmin ? 'Admin' : (msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Student')}
                          </span>
                          {msg.type === 'internal_note' && (
                            <Badge color="warning">Internal Note</Badge>
                          )}
                          <span className="text-xs text-dark-400 ml-auto">
                            {formatDateTime(msg.createdAt || msg.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-dark-500 whitespace-pre-wrap leading-relaxed">
                          {msg.content || msg.message || msg.text || ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-dark-100 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Update Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={STATUS_UPDATE_OPTIONS}
                />
                <Select
                  label="Update Priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  options={PRIORITY_UPDATE_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-500 mb-1.5">
                  Add Internal Note
                </label>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note visible only to admins..."
                  className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setDetailModal(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  loading={updating}
                >
                  <FiSend size={14} />
                  Update Ticket
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
