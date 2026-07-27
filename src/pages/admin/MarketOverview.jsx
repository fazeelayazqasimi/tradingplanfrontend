import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiSave,
  FiTrendingUp,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiLink,
  FiFileText,
  FiLoader,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import adminService from '../../services/adminService';

const TREND_OPTIONS = [
  { value: 'bullish', label: 'Bullish' },
  { value: 'bearish', label: 'Bearish' },
  { value: 'neutral', label: 'Neutral' },
];

const FIELD_CONFIG = [
  { key: 'goldTrend', label: 'Gold Trend', icon: FiTrendingUp, type: 'select', options: TREND_OPTIONS, placeholder: 'Select trend...' },
  { key: 'marketNews', label: 'Market News', icon: FiBookOpen, type: 'textarea', rows: 4, placeholder: 'Enter latest market news...' },
  { key: 'nextLiveClassDate', label: 'Next Live Class Date', icon: FiCalendar, type: 'date' },
  { key: 'nextLiveClassTime', label: 'Next Live Class Time', icon: FiClock, type: 'time' },
  { key: 'nextLiveClassLink', label: 'Live Class Link', icon: FiLink, type: 'text', placeholder: 'https://...' },
  { key: 'dailyMarketSummary', label: 'Daily Market Summary', icon: FiFileText, type: 'textarea', rows: 4, placeholder: 'Enter daily market summary...' },
];

const initialForm = {
  goldTrend: '',
  marketNews: '',
  nextLiveClassDate: '',
  nextLiveClassTime: '',
  nextLiveClassLink: '',
  dailyMarketSummary: '',
};

export default function MarketOverview() {
  const { getSetting, institute_name } = useSettings();
  const [form, setForm] = useState(initialForm);
  const [original, setOriginal] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimerRef = useRef(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getMarketOverview();
      const mapped = {
        goldTrend: data.goldTrend || '',
        marketNews: data.marketNews || '',
        nextLiveClassDate: data.nextLiveClassDate || '',
        nextLiveClassTime: data.nextLiveClassTime || '',
        nextLiveClassLink: data.nextLiveClassLink || '',
        dailyMarketSummary: data.dailyMarketSummary || '',
      };
      setForm(mapped);
      setOriginal(mapped);
      setHasChanges(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load market overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const doSave = async () => {
    try {
      setSaving(true);
      await adminService.updateMarketOverview(form);
      setOriginal({ ...form });
      setHasChanges(false);
      setLastSaved(new Date());
      toast.success('Market overview saved successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save market overview');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!hasChanges) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      doSave();
    }, 1200);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [hasChanges, form]);

  const isDirty = (key) => form[key] !== original[key];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 rounded-lg bg-dark-200 animate-pulse" />
          <div className="h-4 w-64 rounded bg-dark-100 animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-dark-200 animate-pulse" />
                <div className="h-11 w-full rounded-lg bg-dark-100 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Market Overview</h1>
        <p className="text-sm text-primary-100 mt-1">
          Manage market trend, news, live class details, and daily summaries for{' '}
          {getSetting('institute_name', institute_name)}
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">Overview Settings</h2>
            <p className="text-sm text-dark-500 mt-0.5">
              Configure market overview data for your institute
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-dark-400 flex items-center gap-1">
                <FiCheckCircle className="text-primary-500" size={12} />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {hasChanges && !saving && (
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <FiLoader className="animate-spin" size={12} />
                Unsaved changes
              </span>
            )}
            <Button
              onClick={doSave}
              disabled={!hasChanges || saving}
              loading={saving}
              size="sm"
            >
              <FiSave size={14} />
              {saving ? 'Saving...' : 'Save All'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FIELD_CONFIG.map((field) => {
            const Icon = field.icon;
            const value = form[field.key];
            const dirty = isDirty(field.key);

            if (field.type === 'select') {
              return (
                <div key={field.key} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <Icon size={14} className="text-dark-400" />
                    {field.label}
                    {dirty && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                  </label>
                  <Select
                    options={field.options}
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            }

            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <Icon size={14} className="text-dark-400" />
                    {field.label}
                    {dirty && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    rows={field.rows || 3}
                    placeholder={field.placeholder || ''}
                    className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
                  />
                </div>
              );
            }

            return (
              <div key={field.key} className="space-y-1.5">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <Icon size={14} className="text-dark-400" />
                  {field.label}
                  {dirty && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                </label>
                <input
                  type={field.type}
                  value={value}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}