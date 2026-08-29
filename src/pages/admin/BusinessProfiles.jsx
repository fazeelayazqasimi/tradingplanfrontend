import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiFileText, FiDownload, FiToggleLeft, FiToggleRight, FiX, FiVideo, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import adminService from '../../services/adminService';
import { formatDateTime } from '../../utils/helpers';

const initialForm = {
  title: '',
  description: '',
  fileUrl: '',
  fileName: '',
  fileSize: 0,
  videoUrl: '',
  videoName: '',
  videoSize: 0,
  isPublished: true,
};

export default function BusinessProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getBusinessProfiles({ page, perPage: 10 });
      const list = data.data || [];
      setProfiles(Array.isArray(list) ? list : []);
      setTotalPages(data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / 10) || 1);
      setTotalItems(data.pagination?.total || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load business profiles');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      const data = await adminService.uploadBusinessProfileFile(fd);
      const res = data?.data || data;
      if (res?.url) {
        setForm((prev) => ({ ...prev, fileUrl: res.url, fileName: res.fileName || file.name, fileSize: res.fileSize || file.size }));
        toast.success('PDF uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append('video', file);
      const data = await adminService.uploadBusinessProfileVideo(fd);
      const res = data?.data || data;
      if (res?.url) {
        setForm((prev) => ({ ...prev, videoUrl: res.url, videoName: res.fileName || file.name, videoSize: res.fileSize || file.size }));
        toast.success('Video uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const openCreateModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.fileUrl && !form.videoUrl) return toast.error('Please upload a PDF file or video first');
    try {
      setSubmitting(true);
      await adminService.createBusinessProfile({
        title: form.title,
        description: form.description,
        fileUrl: form.fileUrl,
        fileName: form.fileName,
        fileSize: form.fileSize,
        videoUrl: form.videoUrl,
        videoName: form.videoName,
        videoSize: form.videoSize,
        isPublished: form.isPublished,
      });
      toast.success('Business profile published successfully');
      setModalOpen(false);
      setForm(initialForm);
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create business profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (profile) => {
    const id = profile._id || profile.id;
    try {
      await adminService.updateBusinessProfile(id, { isPublished: !profile.isPublished });
      toast.success(profile.isPublished ? 'Unpublished' : 'Published');
      fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update');
    }
  };

  const handleDelete = async (profile) => {
    if (!window.confirm(`Delete "${profile.title}"? This cannot be undone.`)) return;
    const id = profile._id || profile.id;
    try {
      setDeletingId(id);
      await adminService.deleteBusinessProfile(id);
      toast.success('Business profile deleted');
      setProfiles((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <FiFileText className="h-3.5 w-3.5 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink truncate">{row.title}</p>
            {row.fileName && (
              <p className="text-xs text-dark-500 mt-0.5 truncate">{row.fileName}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'file',
      header: 'PDF',
      render: (_, row) => (
        <a href={row.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary-500 hover:text-primary-600 text-sm">
          <FiDownload className="h-3.5 w-3.5" />
          View / Download
        </a>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (_, row) => (
        <button onClick={() => handleToggle(row)} className="inline-flex items-center gap-2" title="Toggle publish">
          {row.isPublished ? <FiToggleRight className="h-5 w-5 text-emerald-500" /> : <FiToggleLeft className="h-5 w-5 text-dark-300" />}
          <Badge color={row.isPublished ? 'success' : 'warning'}>{row.isPublished ? 'Published' : 'Hidden'}</Badge>
        </button>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-[14.5px] text-dark-500">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => {
        const id = row._id || row.id;
        return (
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleDelete(row)}
              disabled={deletingId === id}
              className="rounded-lg p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Business Profiles</h1>
          <p className="mt-1 text-sm text-dark-500">
            Upload PDFs (company profile, brochures) — shown on the website &amp; student portal for download
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus className="h-4 w-4" />
          Add Business Profile
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={profiles}
          loading={loading}
          emptyMessage="No business profiles yet. Add one to publish PDFs."
        />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between px-4 pb-2">
            <p className="text-sm text-dark-500">
              {totalItems} profile{totalItems !== 1 ? 's' : ''} total
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Business Profile"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Company Profile 2026"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="Short description of this document..."
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
            />
          </div>
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              PDF Document
            </label>
            {form.fileUrl ? (
              <div className="flex items-center justify-between rounded-xl border border-dark-200 bg-dark-50 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FiFileText className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-sm text-ink truncate">{form.fileName || 'Uploaded document'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('fileUrl', '')}
                  className="rounded-lg p-1.5 text-dark-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove file"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <label className="flex h-24 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-dark-200 text-dark-400 hover:border-primary-400 hover:text-primary-500 transition-colors">
                {uploadingFile ? (
                  <span className="text-sm font-medium">Uploading...</span>
                ) : (
                  <span className="flex flex-col items-center gap-1.5">
                    <FiFileText size={22} />
                    <span className="text-xs font-medium">Upload PDF (max 25MB)</span>
                  </span>
                )}
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
              </label>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bp-published"
              checked={form.isPublished}
              onChange={(e) => handleChange('isPublished', e.target.checked)}
              className="h-4 w-4 rounded border-dark-200 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="bp-published" className="text-sm text-dark-600">Publish (visible on website &amp; student portal)</label>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              Save Business Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
