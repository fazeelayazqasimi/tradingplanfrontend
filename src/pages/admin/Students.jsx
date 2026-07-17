import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEye, FiUserX, FiUserCheck, FiMail, FiPhone, FiCalendar, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

function getStudentId(student) {
  return student._id || student.id;
}

function getStatusColor(student) {
  if (student.isSuspended) return 'warning';
  return student.isActive !== false ? 'success' : 'danger';
}

function getStatusLabel(student) {
  if (student.isSuspended) return 'Suspended';
  return student.isActive !== false ? 'Active' : 'Inactive';
}

function getStatusBadge(student) {
  return <Badge color={getStatusColor(student)}>{getStatusLabel(student)}</Badge>;
}

const columns = [
  {
    key: 'avatar',
    header: '',
    width: 'w-10',
    render: (_, row) => (
      <img
        src={row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.firstName + ' ' + row.lastName)}&background=2563EB&color=fff&size=40`}
        alt={row.firstName}
        className="h-9 w-9 rounded-xl object-cover ring-2 ring-dark-100"
      />
    ),
  },
  {
    key: 'name',
    header: 'Student',
    sortable: true,
    render: (_, row) => (
      <div>
        <p className="font-semibold text-ink text-sm">{row.firstName} {row.lastName}</p>
        <p className="text-xs text-dark-400 mt-0.5">{row.email}</p>
      </div>
    ),
  },
  {
    key: 'isActive',
    header: 'Status',
    sortable: true,
    render: (_, row) => getStatusBadge(row),
  },
  {
    key: 'isApproved',
    header: 'Approval',
    sortable: true,
    render: (_, row) => (
      <Badge color={row.isApproved ? 'success' : 'warning'}>
        {row.isApproved ? 'Approved' : 'Pending'}
      </Badge>
    ),
  },
  {
    key: 'createdAt',
    header: 'Joined',
    sortable: true,
    render: (_, row) => (
      <span className="text-sm text-dark-500">
        {formatDate(row.createdAt)}
      </span>
    ),
  },
];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const pagination = usePagination({ totalItems: students.length, perPage: 10 });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers({
        search: searchQuery,
        page: pagination.currentPage,
        perPage: pagination.perPage,
      });
      pagination.setTotalItems(data.pagination?.total || 0);
      setStudents(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
    fetchStudents();
  };

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student "${student.firstName} ${student.lastName}"? This cannot be undone.`)) return;
    const studentId = getStudentId(student);
    try {
      setDeletingId(studentId);
      await adminService.deleteUser(studentId);
      toast.success('Student deleted successfully');
      setStudents((prev) => prev.filter((s) => getStudentId(s) !== studentId));
      pagination.setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (student) => {
    const studentId = getStudentId(student);
    try {
      setTogglingId(studentId);
      const newIsActive = student.isActive === false;
      await adminService.updateUser(studentId, { isActive: newIsActive });
      toast.success(`Student ${newIsActive ? 'activated' : 'deactivated'} successfully`);
      setStudents((prev) =>
        prev.map((s) => (getStudentId(s) === studentId ? { ...s, isActive: newIsActive } : s))
      );
      if (getStudentId(selectedStudent) === studentId) {
        setSelectedStudent((prev) => (prev ? { ...prev, isActive: newIsActive } : prev));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update student');
    } finally {
      setTogglingId(null);
    }
  };

  const actionColumn = {
    key: 'actions',
    header: 'Actions',
    width: 'w-32',
    render: (_, row) => {
      const rowId = getStudentId(row);
      const isActive = row.isActive !== false;
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetails(row)}
            className="rounded-xl p-2 text-dark-400 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
            title="View details"
          >
            <FiEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleActive(row)}
            disabled={togglingId === rowId}
            className={`rounded-xl p-2 transition-all duration-200 ${
              isActive
                ? 'text-dark-400 hover:bg-red-50 hover:text-red-600'
                : 'text-dark-400 hover:bg-emerald-50 hover:text-emerald-600'
            } disabled:opacity-50`}
            title={isActive ? 'Deactivate' : 'Activate'}
          >
            {isActive ? (
              <FiUserX className="h-4 w-4" />
            ) : (
              <FiUserCheck className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => handleDelete(row)}
            disabled={deletingId === rowId}
            className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
            title="Delete"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      );
    },
  };

  const allColumns = [...columns, actionColumn];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink leading-tight">Students</h1>
        <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
          Manage student accounts and access
        </p>
      </div>

      <div className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
          columns={allColumns}
          data={students}
          loading={loading}
          emptyMessage="No students found"
          rowKey={(row) => getStudentId(row)}
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dark-100">
            <p className="text-sm text-dark-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} students)
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.prevPage}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Student Details"
        size="md"
      >
        {selectedStudent ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={
                  selectedStudent.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.firstName + ' ' + selectedStudent.lastName)}&background=2563EB&color=fff&size=64`
                }
                alt={selectedStudent.firstName}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-primary-50"
              />
              <div>
                <h3 className="text-lg font-bold text-ink">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(selectedStudent)}
                  <Badge color={selectedStudent.isApproved ? 'success' : 'warning'}>
                    {selectedStudent.isApproved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dark-100 divide-y divide-dark-100">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-[42px] h-[42px] rounded-[11px] bg-primary-50 text-primary-500 flex items-center justify-center">
                  <FiMail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-dark-400 uppercase tracking-wider font-medium">Email</p>
                  <p className="text-sm font-medium text-ink">
                    {selectedStudent.email}
                  </p>
                </div>
              </div>
              {selectedStudent.phone && (
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-[42px] h-[42px] rounded-[11px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiPhone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-dark-400 uppercase tracking-wider font-medium">Phone</p>
                    <p className="text-sm font-medium text-ink">
                      {selectedStudent.phone}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-[42px] h-[42px] rounded-[11px] bg-primary-50 text-primary-500 flex items-center justify-center">
                  <FiCalendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-dark-400 uppercase tracking-wider font-medium">Joined</p>
                  <p className="text-sm font-medium text-ink">
                    {formatDate(selectedStudent.createdAt)}
                  </p>
                </div>
              </div>
              {selectedStudent.subscription && (
                <div className="px-4 py-3.5">
                  <p className="text-[11px] text-dark-400 uppercase tracking-wider font-medium mb-1.5">Subscription</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {selectedStudent.subscription.plan}
                    </span>
                    <Badge
                      color={
                        selectedStudent.subscription.status === 'active' ? 'success' : 'neutral'
                      }
                    >
                      {selectedStudent.subscription.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant={selectedStudent.isActive !== false ? 'danger' : 'success'}
                onClick={() => handleToggleActive(selectedStudent)}
                disabled={togglingId === getStudentId(selectedStudent)}
              >
                {selectedStudent.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
              </Button>
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        )}
      </Modal>
    </div>
  );
}
