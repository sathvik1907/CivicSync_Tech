import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, invalidateCsrfToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const data = await api.get('/api/v1/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(email, password) {
    const data = await api.post('/api/v1/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }

  async function register(email, password, displayName) {
    const data = await api.post('/api/v1/auth/register', { email, password, displayName });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api.post('/api/v1/auth/logout', {});
    } finally {
      setUser(null);
      invalidateCsrfToken();
    }
  }

  // Quick 1-click demo login for hackathon evaluation
  async function quickLogin(roleType) {
    let email = 'resident@civicsync.demo';
    let pass = 'ResidentPass123!';

    if (roleType === 'officer') {
      email = 'officer.gcc@civicsync.demo';
      pass = 'OfficerPass123!';
    } else if (roleType === 'coordinator') {
      email = 'coordinator@civicsync.demo';
      pass = 'CoordPass123!';
    }

    return await login(email, pass);
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    role: user?.role || 'public',
    isResident: user?.role === 'resident',
    isOfficial: ['officer', 'coordinator'].includes(user?.role),
    isCoordinator: user?.role === 'coordinator',
    login,
    register,
    logout,
    quickLogin,
    refreshUser: checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
