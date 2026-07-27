import { useState, useEffect, useRef } from 'react';
import { FiImage, FiPlus, FiTrash2, FiRefreshCw, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';
import usePagination from '../../hooks/usePagination';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const { page, setPage, perPage } = usePagination();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/media', { params: { page, limit: perPage } });
      const body = res?.data || {};
      setItems(body?.data || []);
    } catch { toast.error('Failed to load media'); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [page]);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setFiles([]);
    setPreviews([]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setTitle(item.title);
    setFiles([]);
    setPreviews([]);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews(p => [...p, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!title) { toast.error('Title is required'); return; }
    if (!editing && files.length === 0) { toast.error('Select at least one image'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      files.forEach(f => formData.append('images', f));

      if (editing) {
        await api.put(`/media/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Media updated');
      } else {
        await api.post('/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Media created');
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this media?')) return;
    try {
      await api.delete(`/media/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Media Library</h1>
          <p className="text-sm text-dark-500 mt-0.5">Upload and manage images</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchItems}><FiRefreshCw size={14} /></Button>
          <Button variant="primary" size="sm" onClick={openCreate}><FiPlus size={14} /> Add Media</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-3"><Skeleton className="h-32 w-full mb-2" /><Skeleton className="h-3 w-3/4" /></Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={FiImage} title="No Media" message="Upload images to get started." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item._id} className="p-3 group">
              <div className="relative mb-2">
                {item.images?.length > 0 ? (
                  <img
                    src={item.images[0].startsWith('http') ? item.images[0] : `${API_URL}/${item.images[0]}`}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Image'; }}
                  />
                ) : (
                  <div className="w-full h-32 rounded-lg bg-dark-50 flex items-center justify-center text-dark-400">
                    <FiImage size={32} />
                  </div>
                )}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-dark-600"><FiPlus size={12} /></button>
                  <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-red-500"><FiTrash2 size={12} /></button>
                </div>
              </div>
              <p className="text-xs font-medium text-ink truncate">{item.title}</p>
              <p className="text-[11px] text-dark-400">{item.images?.length || 0} image{(item.images?.length || 0) !== 1 ? 's' : ''}</p>
              <p className="text-[11px] text-dark-400">{formatDate(item.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Media' : 'Add Media'} size="md">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Media title" />

          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">Images</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-dark-200 rounded-xl p-6 flex flex-col items-center gap-2 text-dark-400 hover:border-primary-400 hover:text-primary-500 transition-colors cursor-pointer"
            >
              <FiUpload size={24} />
              <span className="text-sm">Click to upload images</span>
              <span className="text-xs">JPEG, PNG, GIF, WebP (max 10MB each)</span>
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />

            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-0.5 right-0.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editing && !editing?.images?.length && previews.length === 0 && (
              <p className="text-xs text-dark-400 mt-1">No images yet. Upload to add.</p>
            )}
          </div>

          {editing && editing.images?.length > 0 && (
            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Existing Images</label>
              <div className="grid grid-cols-4 gap-2">
                {editing.images.map((img, idx) => (
                  <img key={idx} src={img.startsWith('http') ? img : `${API_URL}/${img}`} alt="" className="w-full h-20 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={submitting}>{editing ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
