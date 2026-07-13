import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiDatabase,
  FiFileText,
  FiLayout,
  FiLoader,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import adminService from '../../services/adminService';

const PAGE_TABS = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'courses', label: 'Courses' },
  { value: 'contact', label: 'Contact' },
  { value: 'faq', label: 'FAQ' },
  { value: 'global', label: 'Global' },
];

const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'image', label: 'Image URL' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'json', label: 'JSON' },
];

const typeBadgeColor = {
  text: 'info',
  textarea: 'purple',
  image: 'success',
  number: 'warning',
  boolean: 'danger',
  json: 'neutral',
};

const initialContentForm = {
  key: '',
  page: 'home',
  section: '',
  type: 'text',
  value: '',
  label: '',
  order: 0,
};

export default function Content() {
  const [allContent, setAllContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [savingId, setSavingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialContentForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllContent();
      const list = Array.isArray(data) ? data : data.data || [];
      setAllContent(list);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const filteredContent = allContent.filter((item) => {
    if (activeTab === 'global') return !item.page || item.page === 'global';
    return item.page === activeTab;
  });

  const groupedBySection = filteredContent.reduce((acc, item) => {
    const section = item.section || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const sortedSections = Object.keys(groupedBySection).sort((a, b) => {
    const orderA = groupedBySection[a][0]?.order ?? 0;
    const orderB = groupedBySection[b][0]?.order ?? 0;
    return orderA - orderB;
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setForm({ ...initialContentForm, page: activeTab === 'global' ? 'global' : activeTab });
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.key.trim()) {
      toast.error('Key is required');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.createContent({
        key: form.key,
        page: form.page,
        section: form.section,
        type: form.type,
        value: form.value,
        label: form.label,
        order: Number(form.order) || 0,
      });
      toast.success('Content created successfully');
      setModalOpen(false);
      fetchContent();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInlineUpdate = async (item, newValue) => {
    const itemId = item._id || item.id;
    try {
      setSavingId(itemId);
      await adminService.updateContent(itemId, { value: newValue });
      setAllContent((prev) =>
        prev.map((c) =>
          (c._id || c.id) === itemId ? { ...c, value: newValue } : c
        )
      );
      toast.success('Content saved');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete content key "${item.key}"? This cannot be undone.`)) return;
    const itemId = item._id || item.id;
    try {
      await adminService.deleteContent(itemId);
      toast.success('Content deleted');
      setAllContent((prev) => prev.filter((c) => (c._id || c.id) !== itemId));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete content');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Seed default content? Existing items may be updated.')) return;
    try {
      setSeeding(true);
      await adminService.seedContent();
      toast.success('Default content seeded successfully');
      fetchContent();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to seed content');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Website Content</h1>
          <p className="mt-1 text-sm text-dark-500">
            Manage page content, labels, and dynamic text across your site
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSeed} disabled={seeding}>
            {seeding ? (
              <FiLoader className="h-4 w-4 animate-spin" />
            ) : (
              <FiDatabase className="h-4 w-4" />
            )}
            Seed Defaults
          </Button>
          <Button onClick={openCreateModal}>
            <FiPlus className="h-4 w-4" />
            New Content
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center gap-1 border-b border-dark-100 px-5 pt-4 overflow-x-auto">
          {PAGE_TABS.map((tab) => {
            const count = allContent.filter((item) =>
              tab.value === 'global'
                ? !item.page || item.page === 'global'
                : item.page === tab.value
            ).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-500'
                    : 'text-dark-500 hover:text-ink hover:bg-dark-50'
                }`}
              >
                <FiLayout className="h-3.5 w-3.5" />
                {tab.label}
                {count > 0 && (
                  <span className="text-[11px] text-dark-400 bg-dark-100 rounded-full px-1.5 py-0.5 font-semibold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-dark-400">
              <FiLoader className="h-5 w-5 animate-spin mr-2" />
              Loading content...
            </div>
          ) : sortedSections.length === 0 ? (
            <div className="text-center py-16">
              <FiFileText className="h-10 w-10 text-dark-300 mx-auto mb-3" />
              <p className="text-dark-500 font-medium">No content items for this page</p>
              <p className="text-sm text-dark-400 mt-1">
                Create new content or seed defaults to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedSections.map((section) => (
                <div key={section}>
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-3">
                    {section}
                  </h3>
                  <div className="space-y-2">
                    {groupedBySection[section]
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((item) => {
                        const itemId = item._id || item.id;
                        return (
                          <ContentRow
                            key={itemId}
                            item={item}
                            saving={savingId === itemId}
                            onUpdate={handleInlineUpdate}
                            onDelete={handleDelete}
                          />
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Content Item"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Key"
            placeholder="e.g. hero_title"
            value={form.key}
            onChange={(e) => handleChange('key', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Page"
              options={PAGE_TABS.map((t) => ({ value: t.value, label: t.label }))}
              value={form.page}
              onChange={(e) => handleChange('page', e.target.value)}
              placeholder="Select page..."
            />
            <Select
              label="Type"
              options={TYPE_OPTIONS}
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
              placeholder="Select type..."
            />
          </div>
          <Input
            label="Section"
            placeholder="e.g. hero, features, footer"
            value={form.section}
            onChange={(e) => handleChange('section', e.target.value)}
          />
          <Input
            label="Label"
            placeholder="Human-readable label for this content"
            value={form.label}
            onChange={(e) => handleChange('label', e.target.value)}
          />
          <div className="w-full">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1.5">
              Value
            </label>
            <textarea
              value={form.value}
              onChange={(e) => handleChange('value', e.target.value)}
              rows={4}
              placeholder="Content value..."
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
            />
          </div>
          <Input
            label="Display Order"
            type="number"
            min="0"
            value={form.order}
            onChange={(e) => handleChange('order', e.target.value)}
            placeholder="0"
          />
          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              Create Content
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

function ContentRow({ item, saving, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.value || '');

  useEffect(() => {
    setDraft(item.value || '');
    setEditing(false);
  }, [item.value]);

  const handleSave = () => {
    onUpdate(item, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(item.value || '');
    setEditing(false);
  };

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-dark-100 bg-white px-4 py-3 hover:border-dark-200 transition-colors">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{item.key}</span>
          <Badge color={typeBadgeColor[item.type] || 'neutral'}>
            {item.type || 'text'}
          </Badge>
          {item.label && (
            <span className="text-xs text-dark-400 hidden sm:inline">— {item.label}</span>
          )}
          <span className="text-[11px] text-dark-300 ml-auto whitespace-nowrap">
            order: {item.order ?? 0}
          </span>
        </div>
        {editing ? (
          <div className="flex items-start gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="flex-1 w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
            />
            <div className="flex flex-col gap-1.5 shrink-0 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
                title="Save"
              >
                <FiSave className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg bg-dark-100 text-dark-500 hover:bg-dark-200 transition-colors"
                title="Cancel"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <p
            onClick={() => setEditing(true)}
            className="text-sm text-dark-500 cursor-pointer hover:text-ink transition-colors break-words"
            title="Click to edit"
          >
            {item.value || <span className="italic text-dark-300">Click to set value</span>}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg p-1.5 text-dark-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(item)}
          className="rounded-lg p-1.5 text-dark-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <FiTrash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
