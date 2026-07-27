import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import websiteService from '../services/websiteService';

const SettingsContext = createContext(null);

const DEFAULTS = {
  institute_name: 'The 4x Hub',
  institute_email: '',
  institute_phone: '',
  institute_address: '',
  site_tagline: 'Master the Markets',
  site_description: '',
  institute_logo: '',
  institute_favicon: '',
  footer_logo: '',
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

  useEffect(() => {
    const favicon = settings.institute_favicon;
    if (favicon) {
      let link = document.querySelector('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [settings.institute_favicon]);

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
