import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiMail, FiTrash2, FiEdit2, FiPlus, FiRefreshCw, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';
import usePagination from '../../hooks/usePagination';
import adminService from '../../services/adminService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminCRM() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: '', days: [], startTime: '09:00', endTime: '10:00', notes: '',
  });
  const { page, setPage, perPage } = usePagination();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm', { params: { page, limit: perPage } });
      const body = res?.data || {};
      setRecords(body?.data || []);
    } catch { toast.error('Failed to load CRM records'); }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await adminService.getUsers({ role: 'student', limit: 200 });
      const body = res?.data?.data || res?.data?.users || res?.data || [];
      setStudents(Array.isArray(body) ? body : []);
    } catch {}
  };

  useEffect(() => { fetchRecords(); fetchStudents(); }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm({ studentId: '', days: [], startTime: '09:00', endTime: '10:00', notes: '' });
    setShowModal(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm({
      studentId: record.studentId?._id || '',
      days: record.schedule?.days || [],
      startTime: record.schedule?.startTime || '09:00',
      endTime: record.schedule?.endTime || '10:00',
      notes: record.notes || '',
    });
    setShowModal(true);
  };

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
    }));
  };

  const handleSave = async () => {
    if (!form.studentId) { toast.error('Select a student'); return; }
    if (form.days.length === 0) { toast.error('Select at least one day'); return; }
    try {
      if (editing) {
        await api.put(`/crm/${editing._id}`, form);
        toast.success('CRM record updated');
      } else {
        await api.post('/crm', form);
        toast.success('CRM record created');
      }
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this CRM record?')) return;
    try {
      await api.delete(`/crm/${id}`);
      toast.success('Deleted');
      fetchRecords();
    } catch { toast.error('Failed to delete'); }
  };

  const handleSendEmail = async (id) => {
    try {
      await api.post(`/crm/${id}/send-email`);
      toast.success('Schedule email sent!');
      fetchRecords();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send email');
    }
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
            {((r.studentId?.firstName?.[0] || '') + (r.studentId?.lastName?.[0] || '')).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{r.studentId?.firstName} {r.studentId?.lastName}</p>
            <p className="text-xs text-dark-400 truncate">{r.studentId?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'schedule',
      label: 'Schedule',
      render: (r) => (
        <div className="text-xs text-dark-600">
          <p>{r.schedule?.days?.slice(0, 3).join(', ')}{r.schedule?.days?.length > 3 ? '...' : ''}</p>
          <p className="text-dark-400">{r.schedule?.startTime} - {r.schedule?.endTime}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge color={r.status === 'active' ? 'success' : r.status === 'completed' ? 'info' : 'warning'}>{r.status}</Badge>,
    },
    {
      key: 'emailSent',
      label: 'Email',
      render: (r) => r.emailSent ? <Badge color="success">Sent</Badge> : <Badge color="warning">Pending</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 hover:text-primary-500" title="Edit"><FiEdit2 size={14} /></button>
          <button onClick={() => handleSendEmail(r._id)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 hover:text-emerald-500" title="Send Email"><FiSend size={14} /></button>
          <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 hover:text-red-500" title="Delete"><FiTrash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">Student CRM</h1>
          <p className="text-sm text-dark-500 mt-0.5">Manage student schedules, days, and timing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRecords}><FiRefreshCw size={14} /></Button>
          <Button variant="primary" size="sm" onClick={openCreate}><FiPlus size={14} /> Add Record</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : records.length === 0 ? (
          <EmptyState icon={FiUsers} title="No CRM Records" message="Create a CRM record for a student to manage their schedule." />
        ) : (
          <DataTable columns={columns} data={records} />
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit CRM Record' : 'Create CRM Record'} size="md">
        <div className="space-y-4">
          <Select
            label="Student"
            value={form.studentId}
            onChange={(e) => setForm(f => ({ ...f, studentId: e.target.value }))}
            disabled={!!editing}
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.email})</option>
            ))}
          </Select>

          <div>
            <label className="block text-xs font-medium text-dark-600 mb-1.5">Days</label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    form.days.includes(day)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-dark-600 border-dark-200 hover:border-primary-300'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))} />
            <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>

          <div className="field">
            <label>Notes (optional)</label>
            <textarea className="input min-h-[60px]" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
