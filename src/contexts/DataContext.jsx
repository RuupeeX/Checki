import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import initialReportsData, { CURRENT_EMPLOYEE } from '../data/reportsData';
import { notificationsData, employeeNotificationsData } from '../data/mockData';

// ============================================================================
// 1. CONTEXTO
// ============================================================================
const DataContext = createContext(null);

// ============================================================================
// 2. PROVEEDOR
// ============================================================================
export function DataProvider({ children }) {
  // ── Reports compartidos ──
  const [reports, setReports] = useState(initialReportsData);

  // ── Notificaciones compartidas (admin y employee por separado) ──
  const [adminNotifs, setAdminNotifs] = useState(notificationsData);
  const [employeeNotifs, setEmployeeNotifs] = useState(employeeNotificationsData);

  // ── Reports: acciones ──
  const addReport = useCallback((report) => {
    setReports(prev => [report, ...prev]);
  }, []);

  const updateReportStatus = useCallback((id, newStatus) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  }, []);

  const deleteReport = useCallback((id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }, []);

  // ── Notificaciones: acciones ──
  const markAllAdminRead = useCallback(() => {
    setAdminNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markAllEmployeeRead = useCallback(() => {
    setEmployeeNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addAdminNotification = useCallback((notif) => {
    setAdminNotifs(prev => [notif, ...prev]);
  }, []);

  const addEmployeeNotification = useCallback((notif) => {
    setEmployeeNotifs(prev => [notif, ...prev]);
  }, []);

  // ── Datos derivados ──
  const adminUnreadCount = useMemo(
    () => adminNotifs.filter(n => !n.read).length,
    [adminNotifs]
  );

  const employeeUnreadCount = useMemo(
    () => employeeNotifs.filter(n => !n.read).length,
    [employeeNotifs]
  );

  const pendingAdminReports = useMemo(
    () => reports.filter(r => r.status === 'Pending'),
    [reports]
  );

  const myPendingReports = useMemo(
    () => reports.filter(r => r.employee === CURRENT_EMPLOYEE && r.status === 'Pending'),
    [reports]
  );

  const value = {
    // Reports
    reports,
    addReport,
    updateReportStatus,
    deleteReport,
    pendingAdminReports,
    myPendingReports,

    // Notificaciones admin
    adminNotifs,
    setAdminNotifs,
    adminUnreadCount,
    markAllAdminRead,
    addAdminNotification,

    // Notificaciones empleado
    employeeNotifs,
    setEmployeeNotifs,
    employeeUnreadCount,
    markAllEmployeeRead,
    addEmployeeNotification,
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