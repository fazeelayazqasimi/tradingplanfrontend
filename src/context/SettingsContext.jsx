import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import websiteService from '../services/websiteService';

const SettingsContext = createContext(null);

const DEFAULTS = {
  institute_name: 'Dream Trader',
  institute_email: 'support@dreamtrader.edu',
  institute_phone: '+92 300 1234567',
  institute_address: 'Clifton Block 5, Karachi, Pakistan',
  site_tagline: 'Master the Markets',
  site_description: 'Professional trading education, signals and community for serious students of the market.',
  institute_logo: '',
  social_instagram: '#',
  social_twitter: '#',
  social_youtube: '#',
  social_telegram: '#',
  membership_price: '100',
  membership_duration: '365',
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteService.getSettings();
      const data = res.data || {};
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.warn('Failed to load settings, using defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = (key, fallback = '') => {
    return settings[key] !== undefined && settings[key] !== '' ? settings[key] : fallback;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings, getSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
