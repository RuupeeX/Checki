import React, { useState, useEffect } from 'react';
import {
  Home, Users, Calendar, BarChart2, Settings, LogOut, Menu, X,
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
  { id: 'home',      label: 'Home',      Icon: Home },
  { id: 'schedule',  label: 'Schedule',  Icon: Calendar },
  { id: 'reports',   label: 'Reports',   Icon: BarChart2 },
  { id: 'settings',  label: 'Settings',  Icon: Settings },
];

// ============================================================================
// HOOK: Detectar si es móvil
// ============================================================================
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}

// ============================================================================
// COMPONENTE: AppLayout
// ============================================================================
export default function AppLayout({
  role = 'employee',
  activePage = 'home',
  onNav,
  onLogout,
  children,
}) {
  const tokens = useTokens();
  const { isDark } = useTheme();
  const isMobile = useIsMobile();

  // Sidebar drawer abierto/cerrado (solo móvil)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar móvil al navegar
  const handleNav = (id) => {
    onNav?.(id);
    if (isMobile) setSidebarOpen(false);
  };

  // Cerrar sidebar móvil con Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const h = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [sidebarOpen]);

  const navItems = role === 'admin' ? adminNav : employeeNav;
  const profile  = userProfiles[role] || userProfiles.employee;
  const menuTitle = role === 'admin' ? 'Main' : 'Menu';

  // ── Contenido del sidebar (siempre expandido) ──
  const SidebarContent = (
    <>
      {/* LOGO */}
      <div className="mb-2 flex items-center ml-7 px-2">
        <div
          className="h-12 w-full"
          style={{
            backgroundColor: tokens.accent,
            WebkitMask: `url('./Checki_purple.svg') no-repeat left center`,
            WebkitMaskSize: 'contain',
            mask: `url('./Checki_purple.svg') no-repeat left center`,
            maskSize: 'contain',
          }}
          role="img"
          aria-label="CheckIn — Workforce Management"
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
            onClick={() => handleNav(id)}
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
    </>
  );

  return (
    <div
      className="flex h-screen overflow-hidden font-[DM_Sans,system-ui,sans-serif]"
      style={{ background: tokens.bg, color: tokens.textPrimary }}
    >
      {/* ── ESTILOS GLOBALES ── */}
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

      {/* ── MOBILE: Hamburger + Overlay + Drawer ── */}
      {isMobile && (
        <>
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-[10px] border shadow-lg"
            style={{ background: tokens.bgCard, borderColor: tokens.border, color: tokens.textPrimary }}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          <aside
            className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col gap-1.5 px-4 py-6 transition-transform duration-300"
            style={{
              background: tokens.bgSidebar,
              borderRight: `1px solid ${tokens.borderSide}`,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}
            role="navigation"
            aria-label="Main navigation"
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors"
              style={{ color: tokens.textSecondary, background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            {SidebarContent}
          </aside>
        </>
      )}

      {/* ── TABLET/DESKTOP: Sidebar fijo siempre expandido ── */}
      {!isMobile && (
        <aside
          className="flex w-[220px] shrink-0 flex-col gap-1.5 px-4 py-6"
          style={{
            background: tokens.bgSidebar,
            borderRight: `1px solid ${tokens.borderSide}`,
          }}
          role="navigation"
          aria-label="Main navigation"
        >
          {SidebarContent}
        </aside>
      )}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
}