import { useState, useEffect } from 'react';
import { FiImage, FiVideo, FiFile, FiPlus, FiRefreshCw, FiTrash2, FiEdit2, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';
import usePagination from '../../hooks/usePagination';

const MEDIA_TYPES = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'result', label: 'Result' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'gallery', label: 'Gallery' },
];

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [form, setForm] = useState({ type: 'image', title: '', description: '', url: '', tags: '' });
  const { page, setPage, perPage } = usePagination();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/media', { params });
      const body = res?.data || {};
      setItems(body?.data || []);
    } catch { toast.error('Failed to load media'); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [page, typeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ type: 'image', title: '', description: '', url: '', tags: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      type: item.type,
      title: item.title,
      description: item.description || '',
      url: item.url || '',
      tags: (item.tags || []).join(', '),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.url) { toast.error('Title and URL are required'); return; }
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await api.put(`/media/${editing._id}`, payload);
        toast.success('Media updated');
      } else {
        await api.post('/media', payload);
        toast.success('Media created');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media?')) return;
    try {
      await api.delete(`/media/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch { toast.error('Failed to delete'); }
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'video': return <FiVideo className="text-purple-500" />;
      case 'image': case 'screenshot': case 'gallery': return <FiImage className="text-blue-500" />;
      default: return <FiFile className="text-amber-500" />;
    }
  };

  const typeColor = (type) => {
    switch (type) {
      case 'video': return 'purple';
      case 'result': return 'emerald';
      case 'screenshot': return 'blue';
      case 'gallery': return 'indigo';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Media Library</h1>
          <p className="text-sm text-dark-500 mt-0.5">Manage videos, screenshots, results, and gallery</p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="w-36">
            <option value="">All Types</option>
            {MEDIA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Button variant="outline" size="sm" onClick={fetchItems}><FiRefreshCw size={14} /></Button>
          <Button variant="primary" size="sm" onClick={openCreate}><FiPlus size={14} /> Add Media</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-3"><Skeleton className="h-24 w-full mb-2" /><Skeleton className="h-3 w-3/4" /></Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={FiImage} title="No Media" message="Add images, videos, results, or gallery items." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item._id} className="p-3 group">
              <div className="aspect-video rounded-lg bg-dark-50 flex items-center justify-center mb-2 overflow-hidden relative">
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-dark-600"><FiEdit2 size={12} /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-red-500"><FiTrash2 size={12} /></button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                {typeIcon(item.type)}
                <Badge color={typeColor(item.type)}>{item.type}</Badge>
              </div>
              <p className="text-xs font-medium text-ink truncate">{item.title}</p>
              <p className="text-[11px] text-dark-400 truncate">{formatDate(item.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Media' : 'Add Media'} size="md">
        <div className="space-y-4">
          <Select label="Type" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
            {MEDIA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Media title" />
          <Input label="URL" value={form.url} onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://example.com/image.jpg" />
          <div className="field">
            <label>Description (optional)</label>
            <textarea className="input min-h-[60px]" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="trading, education, forex" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
