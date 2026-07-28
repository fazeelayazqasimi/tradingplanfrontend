import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiCalendar, FiClock, FiUsers, FiLock, FiUnlock, FiRepeat, FiMoreHorizontal, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } } };

export default function ZoomSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [stats, setStats] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try { setLoading(true); setError(null);
        const [listRes, statsRes] = await Promise.allSettled([
          adminService.getZoomSessions({ page, limit: 20, sort: '-date', category: filterCategory !== 'all' ? filterCategory : undefined }),
          adminService.getZoomSessionStats(),
        ]);
        if (cancelled) return;
        if (listRes.status === 'fulfilled') {
          setSessions(listRes.value?.data?.data || listRes.value?.data || []);
          setPage(listRes.value?.data?.pagination?.page || page);
        }
        if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      } catch (err) {
        if (!cancelled) { setError(err.message || 'Failed to load'); toast.error('Failed to load zoom sessions'); }
      } finally { if (!cancelled) setLoading(false); }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [filterCategory]);

  const handleDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await adminService.deleteZoomSession(sessionToDelete._id);
      toast.success('Session deleted');
      setDeleteModalOpen(false); setSessionToDelete(null);
      setSessions((p) => p.filter((s) => s._id !== sessionToDelete._id));
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (session) => {
    try {
      const updated = await adminService.updateZoomSession(session._id, { isPublished: !session.isPublished });
      toast.success(`Session ${updated.data.isPublished ? 'published' : 'unpublished'}`);
      setSessions((p) => p.map((s) => (s._id === session._id ? updated.data : s)));
    } catch { toast.error('Failed to update'); }
  };

  const filtered = (sessions || []).filter((s) => {
    const ms = !searchQuery || (s.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const mc = filterCategory === 'all' || s.category === filterCategory;
    return ms && mc;
  });

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-extrabold text-ink">Zoom Sessions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white border border-dark-100 rounded-[18px] p-[22px]"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-16" /></div>)}
      </div>
      <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white border border-dark-100 rounded-[18px] p-5"><Skeleton className="h-5 w-3/4 mb-3" /><Skeleton className="h-3 w-1/2" /></div>)}</div>
    </div>
  );
  if (error) return <div className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-ink leading-tight">Zoom Sessions</h1>
          <p className="mt-1 text-[15px] text-dark-500">Manage live zoom sessions</p>
        </div>
        <Link to="/admin/zoom-sessions/new"><Button><FiPlus size={18} className="mr-2" /> New Session</Button></Link>
      </div>
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: stats.total || 0, icon: FiRepeat, color: 'bg-violet-50 text-violet-600' },
            { label: 'Published', value: stats.published || 0, icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Free Sessions', value: stats.free || 0, icon: FiUnlock, color: 'bg-green-50 text-green-600' },
            { label: 'Upcoming', value: stats.upcoming || 0, icon: FiClock, color: 'bg-amber-50 text-amber-600' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} shrink-0`}><Icon size={18} /></div>
                <div><p className="text-xs font-medium text-dark-500">{stat.label}</p><p className="text-lg font-extrabold text-ink">{stat.value}</p></div>
              </Card>
            );
          })}
        </div>
      )}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input type="text" placeholder="Search sessions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border border-dark-100 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 rounded-xl border border-dark-100 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Categories</option><option value="free-zoom">Free Zoom</option><option value="premium-zoom">Premium Zoom</option>
          </select>
        </div>
      </Card>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {filtered.length === 0 ? <EmptyState icon={FiRepeat} title="No sessions found" description="Create your first zoom session." /> :
        filtered.map((session) => (
          <motion.div key={session._id} variants={item}>
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold text-ink truncate">{session.title}</h3>
                    <Badge color={session.isPublished ? 'success' : 'neutral'}>{session.isPublished ? 'Published' : 'Draft'}</Badge>
                    {session.category === 'free-zoom' ? <Badge color="info">Free</Badge> : <Badge color="warning">Premium</Badge>}
                    {session.isRecurring && <Badge color="primary">Recurring</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-dark-500">
                    <span className="flex items-center gap-1"><FiCalendar size={12} /> {formatDate(session.date)}</span>
                    <span className="flex items-center gap-1"><FiClock size={12} /> {session.duration || 60} min</span>
                    <span className="flex items-center gap-1"><FiUsers size={12} /> {session.registeredCount || 0} / {session.maxParticipants || 50}</span>
                  </div>
                  {session.instructorName && <p className="mt-1 text-xs text-dark-400">Instructor: {session.instructorName}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleToggle(session)} className="p-2 rounded-lg hover:bg-dark-50 text-dark-400 hover:text-ink transition-colors" title={session.isPublished ? 'Unpublish' : 'Publish'}>
                    {session.isPublished ? <FiCheckCircle size={16} className="text-emerald-500" /> : <FiXCircle size={16} className="text-dark-300" />}
                  </button>
                  <Link to={`/admin/zoom-sessions/${session._id}/edit`} className="p-2 rounded-lg hover:bg-dark-50 text-dark-400 hover:text-ink transition-colors"><FiEdit size={16} /></Link>
                  <button onClick={() => { setSessionToDelete(session); setDeleteModalOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-dark-400 hover:text-red-600 transition-colors"><FiTrash2 size={16} /></button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setSessionToDelete(null); }} title="Delete Session" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-dark-500">Are you sure you want to delete this session?</p>
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setSessionToDelete(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}