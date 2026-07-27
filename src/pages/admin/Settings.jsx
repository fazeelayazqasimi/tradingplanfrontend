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
  FiUsers,
  FiServer,
  FiLock,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import adminService from '../../services/adminService';
import authService from '../../services/authService';
import api from '../../services/api';
import { formatDateTime } from '../../utils/helpers';

const SECTIONS = [
  { id: 'profile', label: 'My Profile', icon: FiUser },
  { id: 'general', label: 'General', icon: FiGlobe },
  { id: 'social', label: 'Social Links', icon: FiInstagram },
  { id: 'subscription', label: 'Subscription', icon: FiDollarSign },
  { id: 'referral', label: 'Referral Commissions', icon: FiUsers },
  { id: 'broker', label: 'Broker APIs', icon: FiServer },
  { id: 'withdrawal', label: 'Withdrawals', icon: FiDollarSign },
  { id: 'funding', label: 'Funding Wallet', icon: FiDollarSign },
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
    { key: 'plan_days_monthly', label: 'Plan Days — Monthly', type: 'number', placeholder: '30' },
    { key: 'plan_days_yearly', label: 'Plan Days — Yearly', type: 'number', placeholder: '365' },
    { key: 'plan_days_lifetime', label: 'Plan Days — Lifetime', type: 'number', placeholder: '36500' },
  ],
  referral: [
    { key: 'referral_signup_bonus', label: 'Referral Signup Bonus ($)', icon: FiDollarSign, type: 'number', placeholder: '10', description: 'Bonus given to referrer when their referral signs up' },
    { key: 'referral_level_1_commission', label: 'Level 1 Commission ($)', icon: FiDollarSign, type: 'number', placeholder: '30' },
    { key: 'referral_level_2_commission', label: 'Level 2 Commission ($)', icon: FiDollarSign, type: 'number', placeholder: '10' },
    { key: 'referral_level_3_commission', label: 'Level 3 Commission ($)', icon: FiDollarSign, type: 'number', placeholder: '5' },
    { key: 'referral_level_4_commission', label: 'Level 4 Commission ($)', icon: FiDollarSign, type: 'number', placeholder: '3' },
    { key: 'referral_level_5_commission', label: 'Level 5 Commission ($)', icon: FiDollarSign, type: 'number', placeholder: '2' },
    { key: 'referral_max_levels', label: 'Max Referral Levels', icon: FiUsers, type: 'number', placeholder: '5' },
  ],
  broker: [
    { key: 'broker_dma_name', label: 'DMA Broker Name', icon: FiServer, placeholder: 'DMA' },
    { key: 'broker_dma_api_key', label: 'DMA API Key', icon: FiServer, placeholder: 'Enter DMA API key' },
    { key: 'broker_dma_api_secret', label: 'DMA API Secret', icon: FiServer, placeholder: 'Enter DMA API secret' },
    { key: 'broker_dma_api_endpoint', label: 'DMA API Endpoint', icon: FiServer, placeholder: 'https://api.dma-broker.com' },
    { key: 'broker_startrading_name', label: 'StarTrading Broker Name', icon: FiServer, placeholder: 'StarTrading' },
    { key: 'broker_startrading_api_key', label: 'StarTrading API Key', icon: FiServer, placeholder: 'Enter StarTrading API key' },
    { key: 'broker_startrading_api_secret', label: 'StarTrading API Secret', icon: FiServer, placeholder: 'Enter StarTrading API secret' },
    { key: 'broker_startrading_api_endpoint', label: 'StarTrading API Endpoint', icon: FiServer, placeholder: 'https://api.startrading.com' },
  ],
  withdrawal: [
    { key: 'min_withdrawal', label: 'Minimum Withdrawal ($)', icon: FiDollarSign, type: 'number', placeholder: '10' },
    { key: 'max_withdrawal', label: 'Maximum Withdrawal ($)', icon: FiDollarSign, type: 'number', placeholder: '5000' },
  ],
  funding: [
    { key: 'free_registration_bonus_enabled', label: 'Free Registration $1 Bonus', type: 'toggle', description: 'When enabled, new users get free registration bonus on registration' },
    { key: 'free_registration_bonus_amount', label: 'Free Registration Bonus Amount ($)', type: 'number', icon: FiDollarSign, placeholder: '1', description: 'Amount awarded as free registration bonus' },
    { key: 'funding_wallet_usage_percent', label: 'Funding Wallet Usage %', type: 'number', icon: FiDollarSign, placeholder: '20', description: 'Max percentage of membership amount that can be paid from funding wallet' },
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      const data = res.data || res;
      const arr = data?.settings || data;
      const flat = Array.isArray(arr)
        ? arr.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {})
        : {};
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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
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

    if (field.type === 'toggle') {
      const isEnabled = value === true || value === 'true';
      return (
        <div key={field.key} className="space-y-1.5">
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-50 border border-dark-100">
            <div>
              <label className="text-sm font-medium text-ink">{field.label}</label>
              {field.description && <p className="text-xs text-dark-400 mt-0.5">{field.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => handleChange(field.key, !isEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isEnabled ? 'bg-primary-500' : 'bg-dark-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          {dirtyFields.has(field.key) && (
            <button onClick={() => handleSaveField(field.key)} disabled={saving}
              className="text-xs font-medium text-primary-600 hover:text-primary-700">
              Save change
            </button>
          )}
        </div>
      );
    }

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
                          : activeSection === 'referral'
                            ? 'Configure referral signup bonus and commission amounts per level'
                            : activeSection === 'broker'
                              ? 'DMA and StarTrading broker API configuration'
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

            {activeSection === 'profile' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <FiLock className="text-primary-500" /> Change Password
                </h3>
                <div className="grid gap-3 max-w-md">
                  <div className="relative">
                    <input type={showPasswords.current ? 'text' : 'password'} placeholder="Current password" className="input w-full pr-10"
                      value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                      {showPasswords.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPasswords.new ? 'text' : 'password'} placeholder="New password (min 8 chars)" className="input w-full pr-10"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                      {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPasswords.confirm ? 'text' : 'password'} placeholder="Confirm new password" className="input w-full pr-10"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                      {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleChangePassword} loading={changingPassword} className="w-fit">
                    <FiLock size={14} /> Update Password
                  </Button>
                </div>
              </div>
            )}

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
