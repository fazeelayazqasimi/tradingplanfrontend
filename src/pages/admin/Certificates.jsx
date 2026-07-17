import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiAward, FiCalendar, FiHash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const initialForm = {
  userId: '',
  courseId: '',
  certificateNumber: '',
};

function generateCertNumber() {
  const prefix = 'CERT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const pagination = usePagination({ totalItems: certificates.length, perPage: 10 });

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCertificates({
        search: searchQuery,
        page: pagination.currentPage,
        perPage: pagination.perPage,
      });
      pagination.setTotalItems(data.pagination?.total || 0);
      setCertificates(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setForm({ ...initialForm, certificateNumber: generateCertNumber() });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId.trim()) {
      toast.error('User ID is required');
      return;
    }
    if (!form.courseId.trim()) {
      toast.error('Course ID is required');
      return;
    }
    if (!form.certificateNumber.trim()) {
      toast.error('Certificate number is required');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.createCertificate({
        userId: form.userId,
        courseId: form.courseId,
        certificateNumber: form.certificateNumber,
      });
      toast.success('Certificate issued successfully');
      setModalOpen(false);
      fetchCertificates();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to issue certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cert) => {
    if (!window.confirm('Delete this certificate? This cannot be undone.')) return;
    const certId = cert._id || cert.id;
    try {
      setDeletingId(certId);
      await adminService.deleteCertificate(certId);
      toast.success('Certificate deleted successfully');
      setCertificates((prev) => prev.filter((c) => (c._id || c.id) !== certId));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete certificate');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'certificateNumber',
      header: 'Certificate Number',
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
            <FiHash className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <span className="font-mono text-sm font-medium text-ink">{row.certificateNumber}</span>
        </div>
      ),
    },
    {
      key: 'studentName',
      header: 'Student',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-ink text-sm">
            {row.userId?.firstName} {row.userId?.lastName}
          </p>
          {row.userId?.email && (
            <p className="text-xs text-dark-400 mt-0.5">{row.userId.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <FiAward className="h-3.5 w-3.5 text-primary-500" />
          </div>
          <span className="text-sm text-ink">{row.courseId?.title || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'issuedDate',
      header: 'Issued Date',
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-[14.5px] text-dark-500">
          <FiCalendar className="h-3.5 w-3.5 text-dark-400" />
          {formatDate(row.issuedDate || row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => {
        const certId = row._id || row.id;
        return (
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleDelete(row)}
              disabled={deletingId === certId}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-ink leading-tight">Certificates</h1>
          <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
            Issue and manage student certificates
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus className="h-4 w-4" />
          Issue Certificate
        </Button>
      </div>

      <div className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiAward className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by certificate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 pl-10 pr-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        <DataTable
          columns={columns}
          data={certificates}
          loading={loading}
          emptyMessage="No certificates found"
          rowKey="id"
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dark-100">
            <p className="text-sm text-dark-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} certificates)
            </p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={pagination.prevPage} disabled={pagination.currentPage <= 1}>
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page} variant={page === pagination.currentPage ? 'primary' : 'outline'} size="sm" onClick={() => pagination.goToPage(page)}>{page}</Button>
              ))}
              <Button variant="outline" size="sm" onClick={pagination.nextPage} disabled={pagination.currentPage >= pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue Certificate"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="User ID"
            placeholder="Enter the student's user ID"
            value={form.userId}
            onChange={(e) => handleChange('userId', e.target.value)}
            required
          />
          <Input
            label="Course ID"
            placeholder="Enter the course ID"
            value={form.courseId}
            onChange={(e) => handleChange('courseId', e.target.value)}
            required
          />
          <Input
            label="Certificate Number"
            placeholder="Auto-generated certificate number"
            value={form.certificateNumber}
            onChange={(e) => handleChange('certificateNumber', e.target.value)}
            required
          />
          <p className="text-xs text-dark-400 -mt-2">
            A default number has been generated. You may overwrite it with a custom value.
          </p>
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              Issue Certificate
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
