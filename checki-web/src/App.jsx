import React, { useState } from 'react';
import { ThemeProvider } from './contexts/Themecontext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage         from './pages/Login';
import AdminDashboard    from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SettingsPage      from './pages/Settings';
import SchedulePage      from './pages/Schedule';
import ReportsPage       from './pages/Reports';
import EmployeesPage     from './pages/Employee';

// ============================================================================
// ROUTER INTERNO (mismo sistema de páginas, ahora con AuthContext)
// ============================================================================
function AppRouter() {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [navParams, setNavParams] = useState({});

  const handleLogout = () => {
    logout();
    setPage('home');
    setNavParams({});
  };

  const handleNav = (pageId, params = {}) => {
    setPage(pageId);
    setNavParams(params);
  };

  // Pantalla de carga mientras verifica el token
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0c10]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366f1]/30 border-t-[#6366f1]" />
          <p className="text-[13px] text-[#5a6478]">Loading...</p>
        </div>
      </div>
    );
  }

  // No autenticado → Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const role = user.role;

  return (
    <>
      {/* ── SETTINGS & REPORTS (Comunes) ── */}
      {page === 'settings' && (
        <SettingsPage role={role} onLogout={handleLogout} onNav={handleNav} />
      )}

      {page === 'reports' && (
        <ReportsPage role={role} onLogout={handleLogout} onNav={handleNav} />
      )}

      {/* ── VISTAS DE EMPLEADO ── */}
      {role === 'employee' && page === 'home' && (
        <EmployeeDashboard onLogout={handleLogout} onNav={handleNav} />
      )}

      {role === 'employee' && page === 'schedule' && (
        <SchedulePage onLogout={handleLogout} onNav={handleNav} />
      )}

      {/* ── VISTAS DE ADMIN ── */}
      {role === 'admin' && (page === 'home' || page === 'dashboard') && (
        <AdminDashboard onLogout={handleLogout} onNav={handleNav} />
      )}

      {role === 'admin' && page === 'employees' && (
        <EmployeesPage
          onLogout={handleLogout}
          onNav={handleNav}
          initialDept={navParams.dept || undefined}
          key={navParams.dept || 'all'}
        />
      )}
    </>
  );
}

// ============================================================================
// APP — Providers wrapping
// ============================================================================
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppRouter />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}