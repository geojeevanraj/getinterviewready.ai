import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService, getProfile } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // true until initial hydration finishes

  const isAuthenticated = !!token && !!user;

  // Sync user data from profile API on mount if token exists
  useEffect(() => {
    if (token && !user) {
      getProfile()
        .then((data) => {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        })
        .catch(() => {
          // Token invalid, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const data = await loginService(credentials);
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const data = await registerService(userData);
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    authLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
