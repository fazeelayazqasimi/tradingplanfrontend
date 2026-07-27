import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiVideo, FiMonitor, FiCalendar, FiClock, FiUser, FiLink, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import classService from '../../services/classService';
import { formatDate } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const initialForm = {
  title: '',
  description: '',
  type: 'online',
  date: '',
  time: '',
  meetLink: '',
  instructor: '',
};

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [videoFile, setVideoFile] = useState(null);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await classService.getClasses({ page, perPage: 10 });
      const body = res.data;
      const list = body.data || [];
      setClasses(Array.isArray(list) ? list : []);
      setTotalPages(body.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
    setVideoFile(null);
  };

  const openEdit = (cls) => {
    setForm({
      title: cls.title || '',
      description: cls.description || '',
      type: cls.type || 'online',
      date: cls.date ? cls.date.slice(0, 10) : '',
      time: cls.time || '',
      meetLink: cls.meetLink || '',
      instructor: cls.instructor || '',
    });
    setEditing(cls);
    setVideoFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('type', form.type);
      fd.append('date', form.date);
      fd.append('time', form.time);
      fd.append('instructor', form.instructor);
      if (form.type === 'online') fd.append('meetLink', form.meetLink);
      if (videoFile) fd.append('video', videoFile);

      if (editing) {
        await classService.updateClass(editing._id, fd);
        toast.success('Class updated');
      } else {
        await classService.createClass(fd);
        toast.success('Class created');
      }
      setShowForm(false);
      resetForm();
      fetchClasses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cls) => {
    if (!window.confirm(`Delete class "${cls.title}"?`)) return;
    try {
      await classService.deleteClass(cls._id);
      toast.success('Class deleted');
      fetchClasses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const typeColors = { online: 'info', physical: 'warning' };

  const columns = [
    { header: 'Title', render: (_, row) => <span className="font-medium text-ink">{row.title}</span> },
    { header: 'Type', render: (_, row) => <Badge color={typeColors[row.type]}>{row.type === 'online' ? 'Online' : 'Physical'}</Badge> },
    { header: 'Date', render: (_, row) => <span className="text-sm text-dark-600">{row.date ? formatDate(row.date) : '---'}</span> },
    { header: 'Time', render: (_, row) => <span className="text-sm text-dark-600">{row.time || '---'}</span> },
    { header: 'Instructor', render: (_, row) => <span className="text-sm text-dark-600">{row.instructor || '---'}</span> },
    {
      header: 'Link',
      render: (_, row) => row.type === 'online' && row.meetLink
        ? <a href={row.meetLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline truncate block max-w-[120px]">{row.meetLink}</a>
        : <span className="text-xs text-dark-400">No link</span>,
    },
    {
      header: 'Status',
      render: (_, row) => {
        const isPast = row.date && new Date(row.date) < new Date();
        return isPast ? <Badge color="default">Past</Badge> : row.isActive ? <Badge color="success">Active</Badge> : <Badge color="default">Inactive</Badge>;
      },
    },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-500 hover:text-primary-600"><FiEdit2 size={16} /></button>
          <button onClick={() => handleDelete(row)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-500 hover:text-red-600"><FiTrash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Classes</h1>
          <p className="mt-1 text-sm text-dark-500">Manage physical and online classes</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><FiPlus size={16} /> Add Class</Button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show">
        <Card className="p-5">
          {loading ? (
            <Skeleton count={5} className="h-12 w-full" />
          ) : classes.length === 0 ? (
            <div className="py-12 text-center text-dark-400">
              <FiVideo size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No classes yet. Add your first class to get started.</p>
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={classes} page={page} totalPages={totalPages} />
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? 'Edit Class' : 'Add New Class'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Class Title" placeholder="e.g. Forex Fundamentals Week 5" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required />

          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">Class Type</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setForm(p => ({ ...p, type: 'online', meetLink: p.meetLink || '' }))}
                className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === 'online' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-dark-200 text-dark-500 hover:border-dark-300'}`}>
                <FiMonitor size={18} className="mx-auto mb-1" /> Online (Google Meet)
              </button>
              <button type="button" onClick={() => setForm(p => ({ ...p, type: 'physical', meetLink: '' }))}
                className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.type === 'physical' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-dark-200 text-dark-500 hover:border-dark-300'}`}>
                <FiVideo size={18} className="mx-auto mb-1" /> Physical Class
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} required />
            <Input label="Time" type="time" value={form.time} onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))} />
          </div>

          <Input label="Instructor" placeholder="e.g. John Doe" value={form.instructor} onChange={(e) => setForm(p => ({ ...p, instructor: e.target.value }))} />

          {form.type === 'online' && (
            <Input label="Google Meet Link" type="url" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={form.meetLink} onChange={(e) => setForm(p => ({ ...p, meetLink: e.target.value }))} />
          )}

          {form.type === 'physical' && (
            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Upload Class Video</label>
              <div className="border-2 border-dashed border-dark-200 rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer" onClick={() => document.getElementById('video-upload').click()}>
                <FiUpload size={24} className="mx-auto mb-2 text-dark-400" />
                <p className="text-sm text-dark-500">{videoFile ? videoFile.name : 'Click to upload video (mp4, webm, mov)'}</p>
                <input id="video-upload" type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => setVideoFile(e.target.files[0] || null)} />
              </div>
              {editing?.videoUrl && !videoFile && (
                <p className="mt-1 text-xs text-dark-400">Current video: {editing.videoUrl.split('/').pop()}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">Description (optional)</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl border border-dark-200 px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              rows={3} placeholder="Brief description of this class..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? 'Update' : 'Create'} Class</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}