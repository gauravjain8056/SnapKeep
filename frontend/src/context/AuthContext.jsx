import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [dailyWarning, setDailyWarning] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.data?.success && res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for custom daily warning events from API responses
    const handleDailyWarningEvent = (e) => {
      if (e.detail) {
        setDailyWarning(e.detail);
      }
    };

    window.addEventListener('snapkeep:daily-warning', handleDailyWarningEvent);
    return () => {
      window.removeEventListener('snapkeep:daily-warning', handleDailyWarningEvent);
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data?.success && res.data?.data) {
      const { user, accessToken } = res.data.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      return user;
    }
  };

  const register = async (email, password, timezone = 'Asia/Kolkata') => {
    const res = await api.post('/api/auth/register', { email, password, timezone });
    if (res.data?.success && res.data?.data) {
      const { user, accessToken } = res.data.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      return user;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setDailyWarning(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const dismissWarning = () => {
    setDailyWarning(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        dailyWarning,
        login,
        register,
        logout,
        dismissWarning,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
