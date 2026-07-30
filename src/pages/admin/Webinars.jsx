import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiCalendar, FiClock, FiUsers, FiLock, FiUnlock, FiChevronDown, FiChevronUp, FiChevronRight, FiCheckCircle, FiXCircle, FiAlertTriangle, FiMoreHorizontal, FiDownload, FiUpload, FiRefreshCw } from 'react-icons/fi';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const statusColors = {
  published: 'success',
  draft: 'neutral',
  pending: 'warning',
};

export default function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [webinarToDelete, setWebinarToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'free-webinar', date: '', duration: 60,
    instructorName: '', maxParticipants: 100, isFree: true, webinarUrl: '', recordedUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [listRes, statsRes] = await Promise.allSettled([
          adminService.getWebinars({ page, limit: 20, sort: '-date', category: filterCategory !== 'all' ? filterCategory : undefined, isPublished: filterStatus === 'published' ? true : filterStatus === 'draft' ? false : undefined }),
          adminService.getWebinarStats ? adminService.getWebinarStats() : Promise.resolve({ total: 0, published: 0, free: 0, upcoming: 0 }),
        ]);

        if (cancelled) return;

        if (listRes.status === 'fulfilled') {
          const data = listRes.value;
          setWebinars(data.data?.data || data.data || []);
          setTotalPages(data.data?.pagination?.totalPages || data.pagination?.totalPages || 1);
          setPage(data.data?.pagination?.page || page);
        }

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value);
        }
      } catch (err) {
        if (!cancelled) { setError(err.message || 'Failed to load webinars'); toast.error('Failed to load webinars'); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [filterCategory, filterStatus]);

  const handleDelete = async () => {
    if (!webinarToDelete) return;
    try {
      await adminService.deleteWebinar(webinarToDelete._id);
      toast.success('Webinar deleted');
      setDeleteModalOpen(false);
      setWebinarToDelete(null);
      setWebinars((prev) => prev.filter((w) => w._id !== webinarToDelete._id));
    } catch {
      toast.error('Failed to delete webinar');
    }
  };

  const openCreateModal = () => {
    setEditingWebinar(null);
    setForm({ title: '', description: '', category: 'free-webinar', date: '', duration: 60, instructorName: '', maxParticipants: 100, isFree: true, webinarUrl: '', recordedUrl: '' });
    setFormModalOpen(true);
  };

  const openEditModal = (webinar) => {
    setEditingWebinar(webinar);
    setForm({
      title: webinar.title || '',
      description: webinar.description || '',
      category: webinar.category || 'free-webinar',
      date: webinar.date ? webinar.date.slice(0, 16) : '',
      duration: webinar.duration || 60,
      instructorName: webinar.instructorName || '',
      maxParticipants: webinar.maxParticipants || 100,
      isFree: webinar.isFree !== undefined ? webinar.isFree : true,
      webinarUrl: webinar.webinarUrl || '',
      recordedUrl: webinar.recordedUrl || '',
    });
    setFormModalOpen(true);
  };

  const handleFormChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...form };
      if (payload.date) payload.date = new Date(payload.date).toISOString();
      if (editingWebinar) {
        await adminService.updateWebinar(editingWebinar._id, payload);
        toast.success('Webinar updated');
      } else {
        await adminService.createWebinar(payload);
        toast.success('Webinar created');
      }
      setFormModalOpen(false);
      setEditingWebinar(null);
      const listRes = await adminService.getWebinars({ page: 1, limit: 20, sort: '-date' });
      setWebinars(listRes.data?.data || listRes.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save webinar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (webinar) => {
    try {
      const updated = await adminService.updateWebinar(webinar._id, { isPublished: !webinar.isPublished });
      toast.success(`Webinar ${updated.data.isPublished ? 'published' : 'unpublished'}`);
      setWebinars((prev) => prev.map((w) => (w._id === webinar._id ? updated.data : w)));
    } catch {
      toast.error('Failed to update webinar');
    }
  };

  const filteredWebinars = webinars.filter((w) => {
    const matchSearch = !searchQuery || (w.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || w.category === filterCategory;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'published' ? w.isPublished : !w.isPublished);
    return matchSearch && matchCategory && matchStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold text-ink leading-tight">Webinars</h1>
            <p className="mt-1 text-[15px] text-dark-500">Manage free and premium webinars</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-dark-100 rounded-[18px] p-5">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-ink leading-tight">Webinars</h1>
          <p className="mt-1 text-[15px] text-dark-500">Manage free and premium webinars for students</p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus size={18} className="mr-2" /> New Webinar
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Webinars', value: stats.total || 0, icon: FiCalendar, color: 'bg-blue-50 text-blue-600' },
            { label: 'Published', value: stats.published || 0, icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Free Webinars', value: stats.free || 0, icon: FiUnlock, color: 'bg-green-50 text-green-600' },
            { label: 'Upcoming', value: stats.upcoming || 0, icon: FiClock, color: 'bg-amber-50 text-amber-600' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} shrink-0`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-dark-500">{stat.label}</p>
                  <p className="text-lg font-extrabold text-ink">{stat.value}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search webinars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-dark-100 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 rounded-xl border border-dark-100 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Categories</option>
            <option value="free-webinar">Free Webinar</option>
            <option value="premium-webinar">Premium Webinar</option>
            <option value="zoom-session">Zoom Session</option>
            <option value="market-update">Market Update</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-dark-100 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {filteredWebinars.length === 0 ? (
          <EmptyState icon={FiCalendar} title="No webinars found" description="Create your first webinar to get started." />
        ) : (
          filteredWebinars.map((webinar) => (
            <motion.div key={webinar._id} variants={item}>
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-bold text-ink truncate">{webinar.title}</h3>
                      <Badge color={webinar.isPublished ? 'success' : 'neutral'}>
                        {webinar.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {webinar.isFree && <Badge color="info">Free</Badge>}
                      {!webinar.isFree && <Badge color="warning">Premium</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-dark-500">
                      <span className="flex items-center gap-1"><FiCalendar size={12} /> {formatDate(webinar.date)}</span>
                      <span className="flex items-center gap-1"><FiClock size={12} /> {webinar.duration || 60} min</span>
                      <span className="flex items-center gap-1"><FiUsers size={12} /> {webinar.registeredCount || 0} registered</span>
                      <span className="flex items-center gap-1"><FiUsers size={12} /> Max {webinar.maxParticipants || 100}</span>
                    </div>
                    {webinar.instructorName && (
                      <p className="mt-1 text-xs text-dark-400">Instructor: {webinar.instructorName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePublish(webinar)}
                      className="p-2 rounded-lg hover:bg-dark-50 text-dark-400 hover:text-ink transition-colors"
                      title={webinar.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {webinar.isPublished ? <FiCheckCircle size={16} className="text-emerald-500" /> : <FiXCircle size={16} className="text-dark-300" />}
                    </button>
                    <button onClick={() => openEditModal(webinar)} className="p-2 rounded-lg hover:bg-dark-50 text-dark-400 hover:text-ink transition-colors">
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => { setWebinarToDelete(webinar); setDeleteModalOpen(true); }}
                      className="p-2 rounded-lg hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    <FiMoreHorizontal size={16} className="text-dark-300" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      <Modal isOpen={formModalOpen} onClose={() => { setFormModalOpen(false); setEditingWebinar(null); }} title={editingWebinar ? 'Edit Webinar' : 'New Webinar'} size="lg">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => handleFormChange('category', e.target.value)} className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink outline-none focus:border-primary-500 focus:bg-white transition-colors">
                <option value="free-webinar">Free Webinar</option>
                <option value="premium-webinar">Premium Webinar</option>
                <option value="zoom-session">Zoom Session</option>
                <option value="market-update">Market Update</option>
              </select>
            </div>
            <Input label="Duration (min)" type="number" value={form.duration} onChange={(e) => handleFormChange('duration', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Date & Time</label>
              <input type="datetime-local" value={form.date} onChange={(e) => handleFormChange('date', e.target.value)} required className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink outline-none focus:border-primary-500 focus:bg-white transition-colors" />
            </div>
            <Input label="Instructor Name" value={form.instructorName} onChange={(e) => handleFormChange('instructorName', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Participants" type="number" value={form.maxParticipants} onChange={(e) => handleFormChange('maxParticipants', e.target.value)} />
            <Input label="Webinar URL" value={form.webinarUrl} onChange={(e) => handleFormChange('webinarUrl', e.target.value)} placeholder="https://..." />
          </div>
          <Input label="Recorded URL" value={form.recordedUrl} onChange={(e) => handleFormChange('recordedUrl', e.target.value)} placeholder="https://..." />
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => handleFormChange('description', e.target.value)} rows={3} className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={form.isFree} onChange={(e) => handleFormChange('isFree', e.target.checked)} className="rounded border-dark-300" />
              Free Webinar
            </label>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>{editingWebinar ? 'Update Webinar' : 'Create Webinar'}</Button>
            <Button type="button" variant="outline" onClick={() => { setFormModalOpen(false); setEditingWebinar(null); }} disabled={submitting}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setWebinarToDelete(null); }} title="Delete Webinar" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-dark-500">Are you sure you want to delete this webinar? This action cannot be undone.</p>
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setWebinarToDelete(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}