import { useState, useEffect, useCallback } from 'react';
import {
  FiSave,
  FiSettings,
  FiGlobe,
  FiDollarSign,
  FiTrendingUp,
  FiMail,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiSend,
  FiPhone,
  FiMapPin,
  FiUser,
  FiRefreshCw,
  FiUpload,
  FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import adminService from '../../services/adminService';
import api from '../../services/api';
import { formatDateTime } from '../../utils/helpers';

const SECTIONS = [
  { id: 'general', label: 'General', icon: FiGlobe },
  { id: 'social', label: 'Social Links', icon: FiInstagram },
  { id: 'subscription', label: 'Subscription', icon: FiDollarSign },
  { id: 'withdrawal', label: 'Withdrawals', icon: FiDollarSign },
  { id: 'trading', label: 'Trading', icon: FiTrendingUp },
  { id: 'smtp', label: 'SMTP', icon: FiMail },
];

const SETTING_FIELDS = {
  general: [
    { key: 'institute_name', label: 'Institute Name', icon: FiUser, placeholder: 'e.g. Trading Academy Pro' },
    { key: 'institute_logo', label: 'Institute Logo', type: 'logo', placeholder: 'Upload your institute logo' },
    { key: 'institute_email', label: 'Institute Email', icon: FiMail, type: 'email', placeholder: 'admin@academy.com' },
    { key: 'institute_phone', label: 'Phone Number', icon: FiPhone, type: 'tel', placeholder: '+1 (555) 000-0000' },
    { key: 'institute_address', label: 'Address', icon: FiMapPin, placeholder: '123 Trading St, New York, NY' },
    { key: 'site_tagline', label: 'Site Tagline', placeholder: 'Master the Markets' },
    { key: 'site_description', label: 'Site Description', placeholder: 'Your journey to financial freedom starts here', multiline: true },
  ],
  social: [
    { key: 'instagram', label: 'Instagram', icon: FiInstagram, placeholder: 'https://instagram.com/yourpage' },
    { key: 'twitter', label: 'Twitter / X', icon: FiTwitter, placeholder: 'https://x.com/yourhandle' },
    { key: 'youtube', label: 'YouTube', icon: FiYoutube, placeholder: 'https://youtube.com/@yourchannel' },
    { key: 'telegram', label: 'Telegram', icon: FiSend, placeholder: 'https://t.me/yourgroup' },
  ],
  subscription: [
    { key: 'membership_price', label: 'Membership Price ($)', icon: FiDollarSign, type: 'number', placeholder: '49.99' },
    { key: 'membership_duration', label: 'Duration (days)', type: 'number', placeholder: '30' },
  ],
  withdrawal: [
    { key: 'min_withdrawal', label: 'Minimum Withdrawal ($)', icon: FiDollarSign, type: 'number', placeholder: '10' },
    { key: 'max_withdrawal', label: 'Maximum Withdrawal ($)', icon: FiDollarSign, type: 'number', placeholder: '5000' },
  ],
  trading: [
    { key: 'broker_share_percent', label: 'Broker Share (%)', type: 'number', placeholder: '20' },
    { key: 'trader_share_percent', label: 'Trader Share (%)', type: 'number', placeholder: '50' },
    { key: 'network_share_percent', label: 'Network Share (%)', type: 'number', placeholder: '30' },
  ],
  smtp: [
    { key: 'smtp_host', label: 'SMTP Host', readOnly: true },
    { key: 'smtp_port', label: 'SMTP Port', readOnly: true },
    { key: 'smtp_user', label: 'SMTP Username', readOnly: true },
    { key: 'smtp_from', label: 'From Address', readOnly: true },
  ],
};

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({});
  const [editedSettings, setEditedSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirtyFields, setDirtyFields] = useState(new Set());
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      const data = res.data || res;
      const flat = data.settings || data;
      setSettings(flat);
      setEditedSettings({ ...flat });
      setDirtyFields(new Set());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key, value) => {
    setEditedSettings((prev) => ({ ...prev, [key]: value }));
    setDirtyFields((prev) => {
      const next = new Set(prev);
      if (String(value) !== String(settings[key] ?? '')) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleSaveField = async (key) => {
    try {
      setSaving(true);
      await adminService.updateSetting({ key, value: editedSettings[key] });
      setSettings((prev) => ({ ...prev, [key]: editedSettings[key] }));
      setDirtyFields((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      toast.success(`${key.replace(/_/g, ' ')} updated successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSection = async () => {
    const sectionFields = (SETTING_FIELDS[activeSection] || []).filter((f) => !f.readOnly && f.type !== 'logo');
    const dirty = sectionFields.filter((f) => dirtyFields.has(f.key));
    if (dirty.length === 0) {
      toast('No changes to save');
      return;
    }
    try {
      setSaving(true);
      await Promise.all(
        dirty.map((f) =>
          adminService.updateSetting({ key: f.key, value: editedSettings[f.key] })
        )
      );
      const updated = {};
      dirty.forEach((f) => { updated[f.key] = editedSettings[f.key]; });
      setSettings((prev) => ({ ...prev, ...updated }));
      setDirtyFields((prev) => {
        const next = new Set(prev);
        dirty.forEach((f) => next.delete(f.key));
        return next;
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSection = () => {
    const sectionFields = (SETTING_FIELDS[activeSection] || []).filter((f) => !f.readOnly);
    const restored = { ...editedSettings };
    sectionFields.forEach((f) => { restored[f.key] = settings[f.key] ?? ''; });
    setEditedSettings(restored);
    setDirtyFields((prev) => {
      const next = new Set(prev);
      sectionFields.forEach((f) => next.delete(f.key));
      return next;
    });
    toast('Changes reverted');
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await api.post('/settings/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const logoUrl = res.data?.data?.url || res.data?.url;
      if (logoUrl) {
        setEditedSettings((prev) => ({ ...prev, institute_logo: logoUrl }));
        setSettings((prev) => ({ ...prev, institute_logo: logoUrl }));
        toast.success('Logo uploaded successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const sectionHasChanges = (SETTING_FIELDS[activeSection] || []).some(
    (f) => !f.readOnly && dirtyFields.has(f.key)
  );

  const renderField = (field) => {
    const value = editedSettings[field.key] ?? '';
    const isDirty = dirtyFields.has(field.key);
    const isReadonly = field.readOnly;

    if (field.type === 'logo') {
      const logoUrl = editedSettings.institute_logo || settings.institute_logo || '';
      return (
        <div key={field.key} className="space-y-1.5">
          <label className="block text-sm font-medium text-dark-600 mb-1.5">Institute Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-dark-200 bg-dark-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <FiUpload className="text-dark-300" size={20} />
              )}
            </div>
            <div className="flex-1">
              <label className="btn-outline text-sm cursor-pointer inline-flex items-center gap-2">
                <FiUpload size={14} />
                {uploadingLogo ? 'Uploading...' : 'Choose Image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
              </label>
              <p className="text-xs text-dark-400 mt-1">Recommended: 200x200px, PNG or SVG</p>
            </div>
            {logoUrl && (
              <button
                onClick={() => {
                  setEditedSettings((prev) => ({ ...prev, institute_logo: '' }));
                  setDirtyFields((prev) => { const n = new Set(prev); n.add('institute_logo'); return n; });
                }}
                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove logo"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <Input
              label={field.label}
              icon={field.icon}
              type={field.type || 'text'}
              value={value}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              readOnly={isReadonly}
              className={`${isDirty ? 'border-amber-400' : ''} ${isReadonly ? 'border-dashed bg-dark-50 cursor-not-allowed opacity-70' : ''}`}
            />
          </div>
          {!isReadonly && isDirty && (
            <button
              onClick={() => handleSaveField(field.key)}
              disabled={saving}
              className="ml-3 mt-7 shrink-0 rounded-lg p-2.5 text-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
              title={`Save ${field.label}`}
            >
              <FiSave size={16} />
            </button>
          )}
        </div>
        {isReadonly && (
          <p className="text-xs text-dark-400 italic">
            Configured via environment variables — read only
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Platform Settings</h1>
          <p className="text-sm text-dark-500 mt-1">Loading settings...</p>
        </div>
        <Card className="p-6">
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 rounded bg-dark-200" />
                <div className="h-11 w-full rounded-[11px] bg-dark-100" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Platform Settings</h1>
        <p className="text-sm text-dark-500 mt-1">
          Configure your institute platform settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 shrink-0">
          <Card className="p-2">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const sectionDirty = (SETTING_FIELDS[section.id] || []).some(
                  (f) => !f.readOnly && dirtyFields.has(f.key)
                );
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 shadow-sm'
                        : 'text-dark-500 hover:bg-dark-50 hover:text-ink'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-primary-500' : ''} />
                    <span>{section.label}</span>
                    {sectionDirty && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </nav>

        <div className="flex-1 min-w-0">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  {SECTIONS.find((s) => s.id === activeSection)?.label} Settings
                </h2>
                <p className="text-sm text-dark-500 mt-0.5">
                  {activeSection === 'smtp'
                    ? 'SMTP configuration is managed through environment variables'
                    : activeSection === 'general'
                      ? 'Basic information about your institute'
                      : activeSection === 'social'
                        ? 'Social media profile links'
                        : activeSection === 'subscription'
                          ? 'Membership pricing and duration'
                          : activeSection === 'withdrawal'
                            ? 'Withdrawal limits for students'
                            : 'Revenue share percentages'}
                </p>
              </div>
              {activeSection !== 'smtp' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetSection}
                    disabled={!sectionHasChanges}
                  >
                    <FiRefreshCw size={14} />
                    Revert
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveSection}
                    disabled={!sectionHasChanges || saving}
                    loading={saving}
                  >
                    <FiSave size={14} />
                    Save All
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {(SETTING_FIELDS[activeSection] || []).map(renderField)}
            </div>

            {activeSection === 'trading' && (
              <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-200">
                <p className="text-sm text-primary-700">
                  <strong>Note:</strong>{' '}
                  Broker, Trader, and Network share percentages should total 100%. Current total:{' '}
                  <strong>
                    {(
                      (Number(editedSettings.broker_share_percent) || 0) +
                      (Number(editedSettings.trader_share_percent) || 0) +
                      (Number(editedSettings.network_share_percent) || 0)
                    ).toFixed(1)}
                    %
                  </strong>
                </p>
              </div>
            )}

            {activeSection === 'smtp' && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-700">
                  SMTP settings are read-only here. To modify them, update the corresponding environment
                  variables on your server and restart the application.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
