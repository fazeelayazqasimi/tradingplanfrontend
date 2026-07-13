import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiHelpCircle,
  FiCheck,
  FiX,
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
import adminService from '../../services/adminService';

const categoryOptions = [
  { value: 'general', label: 'General' },
  { value: 'trading', label: 'Trading' },
  { value: 'membership', label: 'Membership' },
  { value: 'referral', label: 'Referral' },
  { value: 'technical', label: 'Technical' },
  { value: 'other', label: 'Other' },
];

const categoryColor = {
  general: 'info',
  trading: 'success',
  membership: 'purple',
  referral: 'warning',
  technical: 'danger',
  other: 'neutral',
};

const initialForm = {
  question: '',
  answer: '',
  category: 'general',
  order: 0,
  isActive: true,
};

export default function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getFAQs({ page, perPage: 10 });
      const list = data.data || [];
      setFaqs(Array.isArray(list) ? list : []);
      setTotalPages(
        data.pagination?.totalPages ||
          Math.ceil((data.pagination?.total || 0) / 10) ||
          1
      );
      setTotalItems(
        data.pagination?.total || (Array.isArray(list) ? list.length : 0)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'general',
      order: faq.order ?? 0,
      isActive: faq.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) {
      toast.error('Question is required');
      return;
    }
    if (!form.answer.trim()) {
      toast.error('Answer is required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        question: form.question,
        answer: form.answer,
        category: form.category,
        order: Number(form.order) || 0,
        isActive: form.isActive,
      };
      if (editingFaq) {
        await adminService.updateFAQ(editingFaq._id || editingFaq.id, payload);
        toast.success('FAQ updated successfully');
      } else {
        await adminService.createFAQ(payload);
        toast.success('FAQ created successfully');
      }
      setModalOpen(false);
      fetchFAQs();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faq) => {
    if (!window.confirm(`Delete this FAQ? This cannot be undone.`)) return;
    const faqId = faq._id || faq.id;
    try {
      await adminService.deleteFAQ(faqId);
      toast.success('FAQ deleted successfully');
      setFaqs((prev) => prev.filter((f) => (f._id || f.id) !== faqId));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete FAQ');
    }
  };

  const handleToggle = async (faq) => {
    const faqId = faq._id || faq.id;
    try {
      await adminService.toggleFAQ(faqId);
      setFaqs((prev) =>
        prev.map((f) =>
          (f._id || f.id) === faqId
            ? { ...f, isActive: f.isActive === false ? true : false }
            : f
        )
      );
      toast.success(`FAQ ${faq.isActive !== false ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to toggle FAQ');
    }
  };

  const columns = [
    {
      key: 'question',
      header: 'Question',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
            <FiHelpCircle className="h-3.5 w-3.5 text-primary-500" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink truncate max-w-xs">{row.question}</p>
            {row.answer && (
              <p className="text-xs text-dark-500 mt-0.5 truncate max-w-sm">{row.answer}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (_, row) => (
        <Badge color={categoryColor[row.category] || 'neutral'}>
          {row.category || 'general'}
        </Badge>
      ),
    },
    {
      key: 'order',
      header: 'Order',
      render: (_, row) => (
        <span className="text-sm text-dark-500">{row.order ?? 0}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (_, row) => (
        <button
          onClick={() => handleToggle(row)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
            row.isActive !== false
              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              : 'bg-dark-100 text-dark-500 hover:bg-dark-200'
          }`}
        >
          {row.isActive !== false ? (
            <FiCheck className="h-3 w-3" />
          ) : (
            <FiX className="h-3 w-3" />
          )}
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => openEditModal(row)}
            className="rounded-lg p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="rounded-lg p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">FAQs</h1>
          <p className="mt-1 text-sm text-dark-500">
            Manage frequently asked questions displayed to students
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus className="h-4 w-4" />
          New FAQ
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={faqs}
          loading={loading}
          emptyMessage="No FAQs yet. Create one to help students find answers."
        />

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between px-4 pb-2">
            <p className="text-sm text-dark-500">
              {totalItems} FAQ{totalItems !== 1 ? 's' : ''} total
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFaq ? 'Edit FAQ' : 'New FAQ'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Question
            </label>
            <textarea
              value={form.question}
              onChange={(e) => handleChange('question', e.target.value)}
              rows={3}
              placeholder="e.g. How do I reset my password?"
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
              required
            />
          </div>
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Answer
            </label>
            <textarea
              value={form.answer}
              onChange={(e) => handleChange('answer', e.target.value)}
              rows={5}
              placeholder="Provide a clear and detailed answer..."
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Select category..."
            />
            <Input
              label="Display Order"
              type="number"
              min="0"
              value={form.order}
              onChange={(e) => handleChange('order', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChange('isActive', !form.isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                form.isActive ? 'bg-primary-500' : 'bg-dark-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.isActive ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5 ml-0.5`}
              />
            </button>
            <span className="text-sm text-dark-500">
              {form.isActive ? 'Visible to students' : 'Hidden from students'}
            </span>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              {editingFaq ? 'Update FAQ' : 'Create FAQ'}
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
