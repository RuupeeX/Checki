import React, { useState } from 'react';
import { ThemeProvider } from './contexts/Themecontext';
import LoginPage         from './pages/Login';
import AdminDashboard    from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SettingsPage      from './pages/Settings';
import SchedulePage      from './pages/Schedule'; 
import ReportsPage       from './pages/Reports'; 
import EmployeesPage     from './pages/Employee'; 

export default function App() {
  const [userRole, setUserRole] = useState(null);   // null | 'admin' | 'employee'
  const [page, setPage] = useState('home'); 

  const handleLogout = () => {
    setUserRole(null);
    setPage('home');
  };

  const handleNav = (pageId) => {
    setPage(pageId);
  };

  return (
    <ThemeProvider>
      {/* ── LOGIN ── */}
      {!userRole && (
        <LoginPage onLogin={(role) => { setUserRole(role); setPage('home'); }} />
      )}

      {/* ── SETTINGS & REPORTS (Comunes para Admin y Empleado) ── */}
      {userRole && page === 'settings' && (
        <SettingsPage role={userRole} onLogout={handleLogout} onNav={handleNav} />
      )}
      
      {userRole && page === 'reports' && (
        <ReportsPage role={userRole} onLogout={handleLogout} onNav={handleNav} />
      )}

      {/* ── VISTAS DE EMPLEADO ── */}
      {userRole === 'employee' && page === 'home' && (
        <EmployeeDashboard onLogout={handleLogout} onNav={handleNav} />
      )}
      
      {userRole === 'employee' && page === 'schedule' && (
        <SchedulePage onLogout={handleLogout} onNav={handleNav} />
      )}

      {/* ── VISTAS DE ADMIN ── */}
      {userRole === 'admin' && (page === 'home' || page === 'dashboard') && (
        <AdminDashboard onLogout={handleLogout} onNav={handleNav} />
      )}
      
      {/* ── AÑADIDO: VISTA DE EMPLEADOS (Solo Admin) ── */}
      {userRole === 'admin' && page === 'employees' && (
        <EmployeesPage onLogout={handleLogout} onNav={handleNav} />
      )}
      
    </ThemeProvider>
  );
}