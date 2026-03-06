import React from 'react';
import {
  Home, Users, Calendar, BarChart2, Settings, LogOut,
} from 'lucide-react';
import { useTokens, useTheme } from '../contexts/Themecontext';
import { userProfiles } from '../data/mockData';

// ============================================================================
// NAVEGACIÓN SEGÚN ROL
// ============================================================================
const adminNav = [
  { id: 'dashboard', label: 'Dashboard', Icon: Home },
  { id: 'employees', label: 'Employees', Icon: Users },
  { id: 'reports',   label: 'Reports',   Icon: BarChart2 },
  { id: 'settings',  label: 'Settings',  Icon: Settings },
];

const employeeNav = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'schedule', label: 'Schedule', Icon: Calendar },
  { id: 'reports',  label: 'Reports',  Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

// ============================================================================
// COMPONENTE: AppLayout
// Sidebar compartido + zona de contenido principal.
// Elimina la duplicación que había en cada página.
// ============================================================================
export default function AppLayout({
  role = 'employee',   // 'admin' | 'employee'
  activePage = 'home', // id de la página activa para resaltar en el sidebar
  onNav,               // callback de navegación
  onLogout,            // callback de cierre de sesión
  children,            // contenido de la página (se renderiza a la derecha)
}) {
  const tokens = useTokens();
  const { isDark } = useTheme();

  const navItems = role === 'admin' ? adminNav : employeeNav;
  const profile  = userProfiles[role] || userProfiles.employee;
  const menuTitle = role === 'admin' ? 'Main' : 'Menu';

  return (
    <div
      className="flex h-screen overflow-hidden font-[DM_Sans,system-ui,sans-serif]"
      style={{ background: tokens.bg, color: tokens.textPrimary }}
    >
      {/* ── ESTILOS GLOBALES (una sola vez, no en cada componente) ── */}
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--ck-scrollbar, ${isDark ? '#2a2f3a' : '#d1d5db'}); border-radius: 2px; }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        .card-enter   { animation: fadeInUp 0.35s ease both; }
        .anim-fadeup  { animation: fadeUp   0.3s ease both; }
        .anim-slidein { animation: slideIn  0.25s ease both; }
        .anim-pulse   { animation: pulse    2s infinite; }
        select option { background: ${tokens.bgCard}; color: ${tokens.textPrimary}; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside
        className="flex w-[220px] shrink-0 flex-col gap-1.5 px-4 py-6"
        style={{ background: tokens.bgSidebar, borderRight: `1px solid ${tokens.borderSide}` }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <img
            src="./Checki_purple.png"
            alt="CheckIn — Workforce Management"
            className="h-10 w-full rounded-[8px] object-contain"
          />
        </div>

        {/* Sección label */}
        <p
          className="mb-1 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: tokens.textMuted }}
        >
          {menuTitle}
        </p>

        {/* Nav items */}
        {navItems.map(({ id, label, Icon }) => {
          const isActive = id === activePage;
          return (
            <button
              key={id}
              onClick={() => onNav?.(id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-all"
              style={{
                background: isActive ? tokens.accentLight : 'transparent',
                color: isActive ? tokens.accentText : tokens.textSecondary,
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = tokens.bgHover;
                  e.currentTarget.style.color = tokens.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = tokens.textSecondary;
                }
              }}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </button>
          );
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Perfil de usuario */}
        <div
          className="rounded-[12px] border p-3.5"
          style={{ background: tokens.bgCard, borderColor: tokens.border }}
        >
          <div className="mb-3 flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${profile.gradientClass} text-[12px] font-bold text-white`}
              aria-hidden="true"
            >
              {profile.initials}
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>
                {profile.name}
              </p>
              <p className="text-[11px]" style={{ color: tokens.textSecondary }}>
                {profile.role}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] border py-1.5 text-[12px] font-medium transition-all"
            style={{
              borderColor: tokens.border,
              color: tokens.textSecondary,
              background: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f87171';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = tokens.border;
              e.currentTarget.style.color = tokens.textSecondary;
            }}
            aria-label="Log out"
          >
            <LogOut size={12} aria-hidden="true" /> Log out
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}