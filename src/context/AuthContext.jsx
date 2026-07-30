import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authService.getMe();
      setUser(data.data || data);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const extractAuthData = (data) => {
    return data.data ? data.data : data;
  };

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    const authData = extractAuthData(data);
    localStorage.setItem('token', authData.token);
    if (authData.refreshToken) localStorage.setItem('refreshToken', authData.refreshToken);
    setUser(authData.user);
    return authData;
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    const authData = extractAuthData(data);
    localStorage.setItem('token', authData.token);
    if (authData.refreshToken) localStorage.setItem('refreshToken', authData.refreshToken);
    setUser(authData.user);
    return authData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateUser = (userData) => setUser((prev) => ({ ...prev, ...userData }));

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data.data || data);
    } catch {
      logout();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
