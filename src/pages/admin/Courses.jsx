import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import courseService from '../../services/courseService';
import { COURSE_LEVELS } from '../../constants/index';
import { formatDate } from '../../utils/helpers';

const levelColor = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'danger',
};

const lessonTypeOptions = [
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text / Article' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exercise', label: 'Exercise' },
];

const initialCourseForm = {
  title: '',
  description: '',
  level: '',
  category: '',
  price: '',
};

const initialLessonForm = {
  title: '',
  type: '',
  content: '',
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [lessonForm, setLessonForm] = useState(initialLessonForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses({ page, perPage: 10 });
      const body = response.data;
      const list = body.data || [];
      setCourses(Array.isArray(list) ? list : []);
      setTotalPages(body.pagination?.totalPages || Math.ceil((body.pagination?.total || 0) / 10) || 1);
      setTotalItems(body.pagination?.total || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseChange = (field, value) => {
    setCourseForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLessonChange = (field, value) => {
    setLessonForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setCourseForm(initialCourseForm);
    setCourseModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      level: course.level || '',
      category: course.category || '',
      price: course.price ?? '',
    });
    setCourseModalOpen(true);
  };

  const openLessonModal = (course) => {
    setSelectedCourse(course);
    setLessonForm(initialLessonForm);
    setLessonModalOpen(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim() || courseForm.title.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    if (!courseForm.description.trim() || courseForm.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    if (!courseForm.level) {
      toast.error('Please select a difficulty level');
      return;
    }
    if (!courseForm.category.trim()) {
      toast.error('Category is required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        title: courseForm.title,
        description: courseForm.description,
        level: courseForm.level,
        category: courseForm.category,
        price: courseForm.price ? Number(courseForm.price) : 0,
        ...(editingCourse ? {} : { isPublished: true }),
      };
      if (editingCourse) {
        await courseService.updateCourse(editingCourse._id || editingCourse.id, payload);
        toast.success('Course updated successfully');
      } else {
        await courseService.createCourse(payload);
        toast.success('Course created successfully');
      }
      setCourseModalOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await courseService.addLesson(selectedCourse._id || selectedCourse.id, lessonForm);
      toast.success('Lesson added successfully');
      setLessonModalOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (course) => {
    const courseId = course._id || course.id;
    const newPublished = !course.isPublished;
    try {
      await courseService.updateCourse(courseId, { isPublished: newPublished });
      toast.success(`Course ${newPublished ? 'published' : 'unpublished'} successfully`);
      setCourses((prev) =>
        prev.map((c) =>
          (c._id || c.id) === courseId ? { ...c, isPublished: newPublished } : c
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update publish status');
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await courseService.deleteCourse(course._id || course.id);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete course');
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Course',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-ink text-sm">{row.title}</p>
          {row.category && (
            <p className="text-xs text-dark-400 mt-0.5">{row.category}</p>
          )}
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (_, row) => (
        <Badge color={levelColor[row.level] || 'neutral'}>
          {row.level || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (_, row) => {
        const price = row.price ?? 0;
        return (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-700">
            <FiDollarSign className="h-3.5 w-3.5 text-dark-400" />
            {price > 0 ? `$${price}` : 'Free'}
          </span>
        );
      },
    },
    {
      key: 'totalLessons',
      header: 'Lessons',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-dark-500">
          <FiBookOpen className="h-3.5 w-3.5 text-dark-400" />
          {row.totalLessons ?? row.lessons?.length ?? 0}
        </span>
      ),
    },
    {
      key: 'totalStudents',
      header: 'Students',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-dark-500">
          <FiUsers className="h-3.5 w-3.5 text-dark-400" />
          {row.totalStudents ?? row.enrolledStudents ?? 0}
        </span>
      ),
    },
    {
      key: 'isPublished',
      header: 'Status',
      render: (_, row) => (
        <Badge color={row.isPublished ? 'success' : 'warning'}>
          {row.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (_, row) => (
        <span className="text-sm text-dark-400">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEditModal(row)}
            className="rounded-xl p-2 text-dark-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            title="Edit course"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => openLessonModal(row)}
            className="rounded-xl p-2 text-dark-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            title="Add lesson"
          >
            <FiPlus className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleTogglePublish(row)}
            className={`rounded-xl p-2 transition-colors ${
              row.isPublished
                ? 'text-dark-400 hover:bg-amber-50 hover:text-amber-600'
                : 'text-dark-400 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
            title={row.isPublished ? 'Unpublish' : 'Publish'}
          >
            {row.isPublished ? <FiXCircle className="h-4 w-4" /> : <FiCheckCircle className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete course"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink font-sans tracking-tight">Courses</h1>
          <p className="mt-1 text-sm text-dark-500">
            Manage courses, lessons, and publishing
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus className="h-4 w-4" />
          New Course
        </Button>
      </div>

      <div className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
        <DataTable
          columns={columns}
          data={courses}
          loading={loading}
          emptyMessage="No courses found. Create your first course to get started."
        />
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-100">
            <p className="text-sm text-dark-500">
              {totalItems} course{totalItems !== 1 ? 's' : ''} total
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Create Course'}
        size="md"
      >
        <form onSubmit={handleCourseSubmit} className="space-y-5">
          <Input
            label="Course Title"
            placeholder="e.g. Complete Forex Trading Masterclass"
            value={courseForm.title}
            onChange={(e) => handleCourseChange('title', e.target.value)}
            required
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-dark-500 mb-1.5">
              Description
            </label>
            <textarea
              value={courseForm.description}
              onChange={(e) => handleCourseChange('description', e.target.value)}
              rows={4}
              required
              placeholder="Describe the course content and learning objectives..."
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors"
            />
          </div>
          <Select
            label="Level"
            options={COURSE_LEVELS}
            value={courseForm.level}
            onChange={(e) => handleCourseChange('level', e.target.value)}
            placeholder="Select difficulty level..."
          />
          <Input
            label="Category"
            placeholder="e.g. Forex, Crypto, Stocks, Risk Management"
            value={courseForm.category}
            onChange={(e) => handleCourseChange('category', e.target.value)}
          />
          <Input
            label="Price ($)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0 = Free, 100 = $100"
            value={courseForm.price}
            onChange={(e) => handleCourseChange('price', e.target.value)}
          />
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCourseModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title={`Add Lesson — ${selectedCourse?.title || ''}`}
        size="md"
      >
        <form onSubmit={handleLessonSubmit} className="space-y-5">
          <Input
            label="Lesson Title"
            placeholder="e.g. Introduction to Support and Resistance"
            value={lessonForm.title}
            onChange={(e) => handleLessonChange('title', e.target.value)}
            required
          />
          <Select
            label="Lesson Type"
            options={lessonTypeOptions}
            value={lessonForm.type}
            onChange={(e) => handleLessonChange('type', e.target.value)}
            placeholder="Select lesson type..."
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-dark-500 mb-1.5">
              Content
            </label>
            <textarea
              value={lessonForm.content}
              onChange={(e) => handleLessonChange('content', e.target.value)}
              rows={8}
              placeholder="Enter lesson content, instructions, or notes..."
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              Add Lesson
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLessonModalOpen(false)}
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
