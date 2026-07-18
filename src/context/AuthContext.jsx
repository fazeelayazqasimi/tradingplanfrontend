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
      setUser(data.data);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    localStorage.setItem('token', data.data.token);
    if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data;
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    localStorage.setItem('token', data.data.token);
    if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateUser = (userData) => setUser((prev) => ({ ...prev, ...userData }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
