import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  reports as reportsApi,
  notifications as notifsApi,
} from '../services/api';

// ============================================================================
// 1. CONTEXTO
// ============================================================================
const DataContext = createContext(null);

// ============================================================================
// 2. PROVEEDOR — Conectado a la API real
// ============================================================================
export function DataProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  // ── Reports ──
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // ── Notificaciones ──
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);

  // ── Cargar reports ──
  const fetchReports = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    setReportsLoading(true);
    try {
      const data = await reportsApi.getAll(params);
      setReports(data.reports || []);
      return data;
    } catch (err) {
      console.error('Error fetching reports:', err);
      return { reports: [], total: 0 };
    } finally {
      setReportsLoading(false);
    }
  }, [isAuthenticated]);

  // ── Cargar notificaciones ──
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setNotifsLoading(true);
    try {
      const data = await notifsApi.getAll();
      setNotifs(data.notifications || []);
      setUnreadCount(data.unread || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotifsLoading(false);
    }
  }, [isAuthenticated]);

  // ── Cargar al autenticarse ──
  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
      fetchNotifications();
    } else {
      setReports([]);
      setNotifs([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchReports, fetchNotifications]);

  // ── Reports: acciones ──
  const addReport = useCallback(async (reportData) => {
    try {
      const newReport = await reportsApi.create(reportData);
      setReports(prev => [newReport, ...prev]);
      fetchNotifications();
      return newReport;
    } catch (err) {
      console.error('Error creating report:', err);
      throw err;
    }
  }, [fetchNotifications]);

  const updateReportStatus = useCallback(async (id, newStatus) => {
    try {
      const updated = await reportsApi.updateStatus(id, newStatus);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
      fetchNotifications();
      return updated;
    } catch (err) {
      console.error('Error updating report:', err);
      throw err;
    }
  }, [fetchNotifications]);

  const deleteReport = useCallback(async (id) => {
    try {
      await reportsApi.remove(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting report:', err);
      throw err;
    }
  }, []);

  // ── Notificaciones: acciones ──
  const markAllRead = useCallback(async () => {
    try {
      await notifsApi.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  }, []);

  const markNotifRead = useCallback(async (id) => {
    try {
      await notifsApi.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notif read:', err);
    }
  }, []);

  // ── Datos derivados ──
  const pendingAdminReports = useMemo(
    () => reports.filter(r => r.status === 'pending'),
    [reports]
  );

  const myPendingReports = useMemo(
    () => reports.filter(r => r.user_id === user?.id && r.status === 'pending'),
    [reports, user]
  );

  const value = {
    reports,
    reportsLoading,
    fetchReports,
    addReport,
    updateReportStatus,
    deleteReport,
    pendingAdminReports,
    myPendingReports,
    notifs,
    unreadCount,
    notifsLoading,
    fetchNotifications,
    markAllRead,
    markNotifRead,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// ============================================================================
// 3. HOOK
// ============================================================================
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}