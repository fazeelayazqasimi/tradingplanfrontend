import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus, FiTrash2, FiCalendar, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const columns = [
  {
    key: 'title',
    header: 'Title',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="w-[42px] h-[42px] rounded-[11px] bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
          <FiBookOpen className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-ink text-sm">{row.title}</p>
          {row.description && (
            <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">{row.description}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'courseId',
    header: 'Course',
    sortable: true,
    render: (_, row) => (
      <span className="text-sm text-dark-500">{row.courseId}</span>
    ),
  },
  {
    key: 'points',
    header: 'Points',
    sortable: true,
    render: (_, row) => (
      <Badge color="primary">{row.points}</Badge>
    ),
  },
  {
    key: 'dueDate',
    header: 'Due Date',
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <FiCalendar className="h-3.5 w-3.5 text-dark-400" />
        <span className="text-sm text-dark-500">{formatDate(row.dueDate)}</span>
      </div>
    ),
  },
  {
    key: 'submissionCount',
    header: 'Submissions',
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-medium text-ink">{row.submissionCount ?? 0}</span>
    ),
  },
];

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    courseId: '',
    description: '',
    points: '',
    dueDate: '',
  });

  const pagination = usePagination({ totalItems: assignments.length, perPage: 10 });

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAssignments({
        search: searchQuery,
        page: pagination.currentPage,
        perPage: pagination.perPage,
      });
      pagination.setTotalItems(data.pagination?.total || 0);
      setAssignments(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
  };

  const resetForm = () => {
    setForm({ title: '', courseId: '', description: '', points: '', dueDate: '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.courseId.trim()) {
      toast.error('Title and Course ID are required');
      return;
    }
    try {
      setCreating(true);
      await adminService.createAssignment({
        title: form.title.trim(),
        courseId: form.courseId.trim(),
        description: form.description.trim(),
        points: Number(form.points) || 0,
        dueDate: form.dueDate || undefined,
      });
      toast.success('Assignment created successfully');
      setCreateOpen(false);
      resetForm();
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create assignment');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (assignment) => {
    if (!window.confirm(`Delete "${assignment.title}"? This action cannot be undone.`)) return;
    try {
      setDeletingId(assignment.id);
      await adminService.deleteAssignment(assignment.id);
      toast.success('Assignment deleted');
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete assignment');
    } finally {
      setDeletingId(null);
    }
  };

  const actionColumn = {
    key: 'actions',
    header: 'Actions',
    width: 'w-20',
    render: (_, row) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleDelete(row)}
          disabled={deletingId === row.id}
          className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
          title="Delete assignment"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  };

  const allColumns = [...columns, actionColumn];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink leading-tight">Assignments</h1>
        <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
          Manage course assignments and track submissions
        </p>
      </div>

      <div className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search by course name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[11px] border border-dark-200 bg-dark-50 pl-10 pr-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <FiPlus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        <DataTable
          columns={allColumns}
          data={assignments}
          loading={loading}
          emptyMessage="No assignments found"
          rowKey="id"
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dark-100">
            <p className="text-sm text-dark-400">
              Showing {pagination.from}–{pagination.to} of {pagination.totalItems} assignments
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.prevPage}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              {pagination.pageNumbers.map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => pagination.goToPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.nextPage}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); resetForm(); }}
        title="Create Assignment"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Assignment title"
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">Course ID *</label>
            <input
              type="text"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              placeholder="e.g. 64a1f..."
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Assignment description (optional)"
              rows={3}
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Points</label>
              <input
                type="number"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: e.target.value })}
                placeholder="100"
                min="0"
                className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Due Date</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create Assignment'}
            </Button>
            <Button variant="outline" type="button" onClick={() => { setCreateOpen(false); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
