import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../services/api';

// ============================================================================
// 1. CONTEXTO
// ============================================================================
const AuthContext = createContext(null);

// ============================================================================
// 2. PROVEEDOR
// ============================================================================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('checkin-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('checkin-token'));
  const [loading, setLoading] = useState(true);

  // Verificar token al montar
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then((userData) => {
        setUser(userData);
        localStorage.setItem('checkin-user', JSON.stringify(userData));
      })
      .catch(() => {
        // Token inválido o expirado
        setUser(null);
        setToken(null);
        localStorage.removeItem('checkin-token');
        localStorage.removeItem('checkin-user');
      })
      .finally(() => setLoading(false));
  }, []); // Solo al montar

  // ── Login ──
  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('checkin-token', data.token);
    localStorage.setItem('checkin-user', JSON.stringify(data.user));
    return data.user;
  }, []);

  // ── Logout ──
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('checkin-token');
    localStorage.removeItem('checkin-user');
  }, []);

  // ── Refrescar datos del usuario ──
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
      localStorage.setItem('checkin-user', JSON.stringify(userData));
      return userData;
    } catch {
      return user;
    }
  }, [user]);

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// 3. HOOK
// ============================================================================
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}