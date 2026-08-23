import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiVolume2, FiCalendar, FiImage, FiFileText, FiVideo, FiX, FiMail, FiAlertCircle } from 'react-icons/fi';
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

const typeColor = {
  general: 'info',
  course: 'purple',
  signal: 'success',
  promotion: 'warning',
  maintenance: 'danger',
  update: 'neutral',
};

const typeOptions = [
  { value: 'general', label: 'General' },
  { value: 'course', label: 'Course' },
  { value: 'signal', label: 'Signal' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'update', label: 'Update' },
];

const initialForm = {
  title: '',
  content: '',
  type: '',
  image: '',
  video: '',
  attachment: null,
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnnouncements({ page, perPage: 10 });
      const list = data.data || [];
      setAnnouncements(Array.isArray(list) ? list : []);
      setTotalPages(data.pagination?.totalPages || Math.ceil((data.pagination?.total || 0) / 10) || 1);
      setTotalItems(data.pagination?.total || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const data = await adminService.uploadAnnouncementImage(fd);
      const url = data?.data?.url || data?.url;
      if (url) {
        setForm((prev) => ({ ...prev, image: url }));
        toast.success('Image uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const data = await adminService.uploadAnnouncementPdf(fd);
      const url = data?.data?.url || data?.url;
      if (url) {
        setForm((prev) => ({
          ...prev,
          attachment: {
            fileName: data?.data?.fileName || file.name,
            fileUrl: url,
            fileSize: data?.data?.fileSize || file.size,
          },
        }));
        toast.success('Document uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      setUploadingPdf(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const data = await adminService.uploadAnnouncementVideo(fd);
      const url = data?.data?.url || data?.url;
      if (url) {
        setForm((prev) => ({ ...prev, video: url }));
        toast.success('Video uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const openCreateModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminService.createAnnouncement({
        title: form.title,
        content: form.content,
        type: form.type,
        image: form.image || null,
        video: form.video || null,
        attachments: form.attachment ? [form.attachment] : [],
        isPublished: true,
      });
      toast.success('Announcement published successfully');
      setModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (announcement) => {
    if (!window.confirm(`Delete "${announcement.title}"? This cannot be undone.`)) return;
    const announcementId = announcement._id || announcement.id;
    try {
      setDeletingId(announcementId);
      await adminService.deleteAnnouncement(announcementId);
      toast.success('Announcement deleted successfully');
      setAnnouncements((prev) => prev.filter((a) => (a._id || a.id) !== announcementId));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete announcement');
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <FiVolume2 className="h-3.5 w-3.5 text-primary-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink truncate">{row.title}</p>
            {row.content && (
              <p className="text-xs text-dark-500 mt-0.5 line-clamp-3">{row.content}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (_, row) => (
        <Badge color={typeColor[row.type] || 'neutral'}>
          {row.type || 'general'}
        </Badge>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (_, row) => (
        <Badge color={row.isPublished !== false ? 'success' : 'warning'}>
          {row.isPublished !== false ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-[14.5px] text-dark-500">
          <FiCalendar className="h-3.5 w-3.5 text-dark-400" />
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'emailStats',
      header: 'Email Stats',
      render: (_, row) => {
        const stats = row.emailStats || { total: 0, sent: 0, failed: 0, skipped: 0 };
        return (
          <div className="flex items-center gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">
              <FiMail className="h-3 w-3" />
              {stats.sent || 0}
            </span>
            {stats.failed > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 font-medium">
                <FiAlertCircle className="h-3 w-3" />
                {stats.failed}
              </span>
            )}
            {stats.skipped > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 font-medium">
                <FiAlertCircle className="h-3 w-3" />
                {stats.skipped}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 text-gray-700">
              {stats.total || 0} total
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => {
        const announcementId = row._id || row.id;
        return (
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleDelete(row)}
              disabled={deletingId === announcementId}
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
          <h1 className="text-2xl font-bold text-ink">Announcements</h1>
          <p className="mt-1 text-sm text-dark-500">
            Publish announcements visible to all students
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={announcements}
          loading={loading}
          emptyMessage="No announcements yet. Create one to notify students."
        />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between px-4 pb-2">
            <p className="text-sm text-dark-500">
              {totalItems} announcement{totalItems !== 1 ? 's' : ''} total
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Announcement"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Platform Maintenance Scheduled"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
          <Select
            label="Type"
            options={typeOptions}
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
            placeholder="Select announcement type..."
          />
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Announcement Image (optional — shows on website &amp; student portal)
            </label>
            <div className="flex items-center gap-3">
              {form.image ? (
                <div className="relative">
                  <img src={form.image} alt="Announcement preview" className="h-20 w-32 rounded-lg object-cover border border-dark-200" />
                  <button
                    type="button"
                    onClick={() => handleChange('image', '')}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                    title="Remove image"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-dark-200 text-dark-400 hover:border-primary-400 hover:text-primary-500 transition-colors">
                  {uploadingImage ? (
                    <span className="text-xs font-medium">Uploading...</span>
                  ) : (
                    <span className="flex flex-col items-center gap-1">
                      <FiImage size={18} />
                      <span className="text-[11px] font-medium">Upload Image</span>
                    </span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              )}
            </div>
          </div>
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Attach PDF / Document (optional — students can download it)
            </label>
            <div className="flex items-center gap-3">
              {form.attachment ? (
                <div className="flex items-center gap-3 rounded-lg border border-dark-200 bg-dark-50 px-3 py-2">
                  <FiFileText className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-ink max-w-[180px] truncate">{form.attachment.fileName}</span>
                  <button
                    type="button"
                    onClick={() => handleChange('attachment', null)}
                    className="rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                    title="Remove document"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-dark-200 px-4 text-dark-400 hover:border-primary-400 hover:text-primary-500 transition-colors">
                  {uploadingPdf ? (
                    <span className="text-xs font-medium">Uploading...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiFileText size={16} />
                      <span className="text-[11px] font-medium">Upload PDF</span>
                    </span>
                  )}
                  <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" className="hidden" onChange={handlePdfUpload} disabled={uploadingPdf} />
                </label>
              )}
            </div>
          </div>
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Announcement Video (optional — plays in student portal)
            </label>
            <div className="flex items-center gap-3">
              {form.video ? (
                <div className="flex items-center gap-3 rounded-lg border border-dark-200 bg-dark-50 px-3 py-2">
                  <FiVideo className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-ink max-w-[180px] truncate">Video attached</span>
                  <button
                    type="button"
                    onClick={() => handleChange('video', '')}
                    className="rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                    title="Remove video"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-dark-200 px-4 text-dark-400 hover:border-primary-400 hover:text-primary-500 transition-colors">
                  {uploadingVideo ? (
                    <span className="text-xs font-medium">Uploading...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiVideo size={16} />
                      <span className="text-[11px] font-medium">Upload Video</span>
                    </span>
                  )}
                  <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska" className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo} />
                </label>
              )}
            </div>
          </div>
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Content
            </label>
            <textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={6}
              placeholder="Write the announcement details..."
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
            />
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              Publish Announcement
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
