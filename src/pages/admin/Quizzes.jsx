import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus, FiTrash2, FiEye, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';
import courseService from '../../services/courseService';
import { formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const initialForm = {
  title: '',
  courseId: '',
  passingScore: 70,
};

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const pagination = usePagination({ totalItems: quizzes.length, perPage: 10 });

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await courseService.getCourses({ perPage: 100 });
      const list = res.data?.data || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch {
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getQuizzes({
        search: searchQuery,
        page: pagination.currentPage,
        perPage: pagination.perPage,
      });
      pagination.setTotalItems(data.pagination?.total || 0);
      setQuizzes(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.courseId) {
      toast.error('Please select a course');
      return;
    }
    if (!form.passingScore || form.passingScore < 0 || form.passingScore > 100) {
      toast.error('Passing score must be between 0 and 100');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.createQuiz({
        title: form.title,
        courseId: form.courseId,
        passingScore: Number(form.passingScore),
      });
      toast.success('Quiz created successfully');
      setModalOpen(false);
      fetchQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (quiz) => {
    const quizId = quiz._id || quiz.id;
    if (!window.confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return;
    try {
      setDeletingId(quizId);
      await adminService.deleteQuiz(quizId);
      toast.success('Quiz deleted successfully');
      setQuizzes((prev) => prev.filter((q) => (q._id || q.id) !== quizId));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete quiz');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = async (quiz) => {
    const quizId = quiz._id || quiz.id;
    try {
      setDetailLoading(true);
      setSelectedQuiz(null);
      setDetailOpen(true);
      const data = await adminService.getQuiz(quizId);
      setSelectedQuiz(data.data || data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load quiz details');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-semibold text-ink text-sm">{row.title}</p>
        </div>
      ),
    },
    {
      key: 'courseId',
      header: 'Course',
      render: (_, row) => (
        <span className="text-sm text-dark-500">
          {row.course?.title || row.courseTitle || row.courseId || 'N/A'}
        </span>
      ),
    },
    {
      key: 'questions',
      header: 'Questions',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-dark-500">
          {row.questions?.length ?? row.totalQuestions ?? 0}
        </span>
      ),
    },
    {
      key: 'passingScore',
      header: 'Passing Score',
      render: (_, row) => (
        <Badge color="info">
          {row.passingScore}%
        </Badge>
      ),
    },
    {
      key: 'attempts',
      header: 'Attempts',
      render: (_, row) => (
        <span className="text-sm text-dark-500">
          {row.totalAttempts ?? row.attempts ?? 0}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 'w-24',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetails(row)}
            className="rounded-xl p-2 text-dark-400 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
            title="View details"
          >
            <FiEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            disabled={deletingId === (row._id || row.id)}
            className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
            title="Delete quiz"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink leading-tight">Quizzes</h1>
        <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
          Manage quizzes and assessments for courses
        </p>
      </div>

      <div className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[11px] border border-dark-200 bg-dark-50 pl-10 pr-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
          <Button onClick={openCreateModal}>
            <FiPlus className="h-4 w-4" />
            Create Quiz
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={quizzes}
          loading={loading}
          emptyMessage="No quizzes found"
          rowKey={(row) => row._id || row.id}
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dark-100">
            <p className="text-sm text-dark-400">
              Showing {pagination.from}–{pagination.to} of {pagination.totalItems} quizzes
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Quiz"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Quiz Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Forex Basics Assessment"
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
              required
            />
          </div>
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Course
            </label>
            {coursesLoading ? (
              <div className="flex items-center gap-2 rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-dark-400">
                <FiLoader className="h-4 w-4 animate-spin" />
                Loading courses...
              </div>
            ) : (
              <Select
                value={form.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                options={courses.map((c) => ({ value: c._id || c.id, label: c.title }))}
                placeholder="Select a course..."
              />
            )}
          </div>
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Passing Score (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.passingScore}
              onChange={(e) => handleChange('passingScore', e.target.value)}
              placeholder="70"
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
              required
            />
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              Create Quiz
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

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Quiz Details"
        size="md"
      >
        {detailLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        ) : selectedQuiz ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-ink">{selectedQuiz.title}</h3>
              <div className="flex items-center gap-3 mt-2">
                <Badge color="info">
                  {selectedQuiz.passingScore}% passing
                </Badge>
                <span className="text-sm text-dark-400">
                  {selectedQuiz.questions?.length ?? selectedQuiz.totalQuestions ?? 0} questions
                </span>
                {selectedQuiz.course && (
                  <Badge color="neutral">
                    {selectedQuiz.course.title || selectedQuiz.courseId}
                  </Badge>
                )}
              </div>
            </div>

            {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">
                  Questions
                </p>
                <div className="rounded-xl border border-dark-100 divide-y divide-dark-100">
                  {selectedQuiz.questions.map((q, index) => (
                    <div key={q._id || q.id || index} className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">
                            {q.question || q.text || q.title}
                          </p>
                          {q.options && q.options.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {q.options.map((opt, oi) => (
                                <li
                                  key={oi}
                                  className={`text-xs pl-2 ${
                                    oi === q.correctAnswer || opt === q.correctAnswer
                                      ? 'text-emerald-600 font-medium'
                                      : 'text-dark-400'
                                  }`}
                                >
                                  {typeof opt === 'string' ? opt : opt.text || opt.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dark-100 p-8 text-center">
                <p className="text-sm text-dark-400">No questions added yet</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        )}
      </Modal>
    </div>
  );
}
