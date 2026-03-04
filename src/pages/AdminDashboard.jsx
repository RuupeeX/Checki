import React, { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Bell, LogOut, Users, BarChart2, Home, Settings, ChevronRight } from 'lucide-react';
import { useTokens, useTheme } from '../contexts/Themecontext'; 

// ============================================================================
// 1. DATOS SIMULADOS (MOCKS)
// Estos arrays actúan como nuestra base de datos falsa para rellenar la UI.
// En producción, estos datos vendrían de una API o base de datos.
// ============================================================================

// Datos de las tarjetas de los departamentos (la cuadrícula de 4 tarjetas)
const departmentData = [
  { name: 'IT',        present: 25, total: 50, status: 'good',    color: '#818cf8', barColor: 'bg-[#818cf8]' },
  { name: 'Sales',     present: 13, total: 50, status: 'warning', color: '#f59e0b', barColor: 'bg-[#f59e0b]' },
  { name: 'HR',        present: 28, total: 50, status: 'good',    color: '#34d399', barColor: 'bg-[#34d399]' },
  { name: 'Marketing', present: 30, total: 50, status: 'good',    color: '#22d3ee', barColor: 'bg-[#22d3ee]' },
];

// Datos de la lista de actividad reciente (la columna derecha)
const recentEvents = [
  { name: 'Carlos Ruiz',  dept: 'IT',        time: '9:02 AM', type: 'in' },
  { name: 'Sofia Martín', dept: 'HR',        time: '9:15 AM', type: 'in' },
  { name: 'Pablo García', dept: 'Sales',     time: '9:47 AM', type: 'late' },
  { name: 'Elena Torres', dept: 'Marketing', time: 'All day', type: 'leave' },
  { name: 'Javier López', dept: 'IT',        time: '1:30 PM', type: 'out' },
];

// Array de degradados para asignar colores aleatorios pero consistentes a los avatares
const avatarGradients = [
  'from-[#6366f1] to-[#8b5cf6]', // Morado
  'from-[#f093fb] to-[#f5576c]', // Rosa/Rojo
  'from-[#4facfe] to-[#00f2fe]', // Azul
  'from-[#43e97b] to-[#38f9d7]', // Verde
  'from-[#fa709a] to-[#fee140]', // Naranja/Amarillo
];

// ============================================================================
// 2. FUNCIONES DE AYUDA Y CONFIGURACIONES VISUALES
// ============================================================================

// Función que toma un nombre ("Carlos Ruiz") y devuelve sus iniciales ("CR")
const initials = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

// Diccionario de estilos para los diferentes estados en la lista de actividad (in, out, late, leave)
const typeConfig = {
  in:    { label: 'In',    textColor: 'text-[#34d399]', bg: 'bg-[#34d399]/10', border: 'border-[#34d399]/20' }, // Verde
  out:   { label: 'Out',   textColor: 'text-[#5a6478]', bg: 'bg-[#5a6478]/10', border: 'border-[#5a6478]/20' }, // Gris
  late:  { label: 'Late',  textColor: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20' }, // Naranja
  leave: { label: 'Leave', textColor: 'text-[#818cf8]', bg: 'bg-[#818cf8]/10', border: 'border-[#818cf8]/20' }, // Morado
};

// ============================================================================
// 3. COMPONENTES REUTILIZABLES INTERNOS
// ============================================================================

// Componente para pintar el círculo de progreso (SVG) en las tarjetas de departamentos
function CircleProgress({ present, total, color, tokens }) {
  const radius = 42; // Radio del círculo
  const circumference = 2 * Math.PI * radius; // Longitud total del círculo
  // Calculamos cuánto trazo debemos "ocultar" según el porcentaje de asistencia
  const offset = circumference - (present / total) * circumference;
  
  return (
    <div className="relative flex h-[110px] w-[110px] shrink-0 items-center justify-center">
      {/* SVG rotado -90 grados para que el trazo empiece desde arriba (las 12 en punto) */}
      <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90 absolute inset-0">
        {/* Círculo de fondo (gris/borde) */}
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke={tokens.border} strokeWidth="7" />
        {/* Círculo de progreso (color) con transición animada */}
        <circle
          cx="50" cy="50" r={radius} fill="transparent"
          stroke={color} strokeWidth="7"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      {/* Texto en el centro del círculo */}
      <div className="relative z-10 text-center">
        <p className="text-[20px] font-bold leading-none" style={{ color: tokens.textPrimary }}>{present}</p>
        <p className="mt-1 text-[10px] font-medium" style={{ color: tokens.textSecondary }}>/ {total}</p>
      </div>
    </div>
  );
}

// ============================================================================
// 4. COMPONENTE PRINCIPAL: AdminDashboard
// ============================================================================

// Recibe onLogout (para cerrar sesión) y onNav (para cambiar de página)
export default function AdminDashboard({ onLogout, onNav }) {
  // Obtenemos los colores y el estado actual del tema (claro/oscuro)
  const tokens = useTokens();
  const { isDark } = useTheme();

  // Elementos de navegación del Sidebar específico para el Administrador
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: Home },
    { id: 'employees', label: 'Employees', Icon: Users },
    { id: 'reports',   label: 'Reports',   Icon: BarChart2 },
    { id: 'settings',  label: 'Settings',  Icon: Settings },
  ];

  // Datos y estilos para los 3 KPIs (Key Performance Indicators) de la parte superior
  const statCards = [
    {
      label: 'Present Today', value: '96', sub: '/ 200 employees', trend: '+4 vs yesterday',
      Icon: CheckCircle2,
      valueColor: '#34d399', iconBg: 'rgba(52,211,153,0.08)', iconColor: '#34d399',
      cardBorder: 'rgba(52,211,153,0.15)', glowBg: 'rgba(52,211,153,0.08)',
    },
    {
      label: 'Late Arrivals', value: '12', sub: 'Today', trend: '-2 vs yesterday',
      Icon: Clock,
      valueColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.08)', iconColor: '#f59e0b',
      cardBorder: 'rgba(245,158,11,0.15)', glowBg: 'rgba(245,158,11,0.08)',
    },
    {
      label: 'On Leave', value: '20', sub: 'Approved absences', trend: '3 pending approval',
      Icon: MapPin,
      valueColor: '#818cf8', iconBg: 'rgba(129,140,248,0.08)', iconColor: '#818cf8',
      cardBorder: 'rgba(129,140,248,0.15)', glowBg: 'rgba(129,140,248,0.08)',
    },
  ];

  return (
    // Contenedor principal de la vista: ocupa toda la pantalla (h-screen)
    <div 
      className="flex h-screen overflow-hidden font-[DM_Sans,system-ui,sans-serif]"
      style={{ background: tokens.bg, color: tokens.textPrimary }} // Aplica el color de fondo base
    >
      {/* Estilos globales inyectados, como la fuente y la personalización de la barra de desplazamiento (scrollbar) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#2a2f3a' : '#d1d5db'}; border-radius: 2px; }
      `}</style>

      {/* ======================= SIDEBAR (Barra lateral) ======================= */}
      <aside 
        className="flex w-[220px] shrink-0 flex-col gap-1.5 px-4 py-6"
        style={{ background: tokens.bgSidebar, borderRight: `1px solid ${tokens.borderSide}` }}
      >
        {/* LOGO DE LA EMPRESA */}
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <img 
            src="./Checki_purple.png" 
            alt="Logo CheckIn"
            className="h-10 w-full rounded-[8px] object-contain" 
          />
        </div>

        <p className="mb-1 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: tokens.textMuted }}>Main</p>

        {/* MAPEO DEL MENÚ DE NAVEGACIÓN */}
        {navItems.map(({ id, label, Icon }) => {
          const active = id === 'dashboard'; // El dashboard siempre se pinta como activo aquí
          return (
            <button
              key={id}
              onClick={() => onNav?.(id)} // Llama a la función de enrutamiento padre
              className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-all"
              style={{
                // Si está activo, usa los tokens de acento, si no, transparente
                background: active ? tokens.accentLight : 'transparent',
                color: active ? tokens.accentText : tokens.textSecondary,
                border: 'none', cursor: 'pointer',
              }}
              // Efectos hover mediante JS para cambiar el fondo dinámicamente
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.color = tokens.textPrimary; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textSecondary; } }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}

        {/* Espaciador flexible para empujar la tarjeta de perfil hacia abajo */}
        <div className="flex-1" />

        {/* TARJETA DE PERFIL DE USUARIO */}
        <div className="rounded-[12px] border p-3.5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f093fb] to-[#f5576c] text-[12px] font-bold text-white">
              RM
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Rosa Muñoz</p>
              <p className="text-[11px]" style={{ color: tokens.textSecondary }}>Administrator</p>
            </div>
          </div>
          {/* BOTÓN CERRAR SESIÓN */}
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] border py-1.5 text-[12px] font-medium transition-all"
            style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary; }}
          >
            <LogOut size={12} /> Log out
          </button>
        </div>
      </aside>

      {/* ======================= MAIN CONTENT (Área principal) ======================= */}
      <main className="flex-1 overflow-auto p-8">

        {/* CABECERA (Header con Título, Fecha, Notificaciones) */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>Admin Dashboard</h1>
            <p className="mt-1 text-[14px]" style={{ color: tokens.textSecondary }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Campana de Notificaciones con punto naranja */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border" style={{ borderColor: tokens.border, background: tokens.bgCard }}>
              <Bell size={15} style={{ color: tokens.textSecondary }} />
              <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px]" style={{ borderColor: tokens.bgCard, background: '#f59e0b' }} />
            </div>
            {/* Chip indicador de Semana */}
            <div className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium" style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
              Week 9 / 2026
            </div>
          </div>
        </div>

        {/* 1. SECCIÓN: TARJETAS DE KPIs (Presentes, Tarde, Ausentes) */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {statCards.map(({ label, value, sub, trend, Icon, valueColor, iconBg, iconColor, cardBorder, glowBg }) => (
            <div 
              key={label} 
              className="relative overflow-hidden rounded-[16px] border p-6"
              style={{ background: tokens.bgCard, borderColor: cardBorder }}
            >
              {/* Círculo borroso de fondo (Glow effect) */}
              <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full" style={{ background: glowBg }} />
              
              <div className="mb-4 flex items-start justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: tokens.textSecondary }}>{label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: iconBg }}>
                  <Icon size={14} color={iconColor} />
                </div>
              </div>
              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="text-[36px] font-bold leading-none tracking-[-0.03em]" style={{ color: valueColor }}>{value}</span>
                <span className="text-[13px]" style={{ color: tokens.textSecondary }}>{sub}</span>
              </div>
              <p className="mt-2 text-[11px]" style={{ color: tokens.textSecondary }}>{trend}</p>
            </div>
          ))}
        </div>

        {/* CONTENEDOR INFERIOR DIVIDIDO EN 2 COLUMNAS (Departamentos y Live Activity) */}
        <div className="grid grid-cols-[1fr_320px] gap-5">

          {/* 2. SECCIÓN IZQUIERDA: TARJETAS DE DEPARTAMENTOS */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>Department Overview</h2>
              {/* Botón de reporte completo con hover state JS */}
              <button 
                className="flex items-center gap-1 rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-all"
                style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary; e.currentTarget.style.background = 'transparent'; }}
              >
                Full report <ChevronRight size={12} />
              </button>
            </div>

            {/* Grid 2x2 de los departamentos */}
            <div className="grid grid-cols-2 gap-3.5">
              {departmentData.map((dept) => {
                // Cálculo matemático del porcentaje de asistencia para la barra y el badge
                const pct = Math.round((dept.present / dept.total) * 100);
                const isWarning = dept.status === 'warning'; // Define si se pinta en rojo/naranja
                
                return (
                  <div
                    key={dept.name}
                    className="group cursor-pointer rounded-[16px] border p-5 transition-all hover:-translate-y-0.5"
                    style={{ background: tokens.bgCard, borderColor: tokens.border }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = isDark ? '#3a4155' : '#cbd5e1'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <p className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>{dept.name}</p>
                        <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>Department</p>
                      </div>
                      {/* Badge con el porcentaje (cambia de color si hay un warning) */}
                      <span className="rounded-[6px] border px-2 py-0.5 text-[12px] font-semibold"
                        style={{
                          borderColor: isWarning ? 'rgba(245,158,11,0.2)' : 'rgba(52,211,153,0.2)',
                          background: isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(52,211,153,0.1)',
                          color: isWarning ? '#f59e0b' : '#34d399'
                        }}>
                        {pct}%
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-5">
                      {/* Renderizamos el componente del círculo SVG */}
                      <CircleProgress present={dept.present} total={dept.total} color={dept.color} tokens={tokens} />
                      
                      {/* Barra de progreso horizontal */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <p className="mb-1.5 text-[11px]" style={{ color: tokens.textSecondary }}>Attendance rate</p>
                          <div className="h-[5px] overflow-hidden rounded-full" style={{ background: tokens.bgInput }}>
                            <div className={`h-full rounded-full ${dept.barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        {/* Números inferiores */}
                        <div className="flex justify-between">
                          <div>
                            <p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>{dept.present}</p>
                            <p className="text-[10px]" style={{ color: tokens.textSecondary }}>Present</p>
                          </div>
                          <div>
                            <p className="text-[16px] font-semibold" style={{ color: tokens.textSecondary }}>{dept.total - dept.present}</p>
                            <p className="text-[10px]" style={{ color: tokens.textSecondary }}>Absent</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SECCIÓN DERECHA: ACTIVIDAD EN VIVO (Live Activity) */}
          <div>
            <div className="mb-4 mt-2 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>Live Activity</h2>
              {/* Indicador pulsante "Live" verde */}
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#34d399]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399] shadow-[0_0_6px_rgba(52,211,94,0.6)]" />
                Live
              </div>
            </div>

            {/* Contenedor de la lista de eventos */}
            <div className="rounded-[16px] border px-5 py-1" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
              {recentEvents.map((ev, idx) => {
                const cfg = typeConfig[ev.type]; // Cogemos colores según el tipo (in, out, late)
                return (
                  <div key={idx} className="flex items-center gap-3.5 py-3" style={{ borderBottom: idx < recentEvents.length - 1 ? `1px solid ${tokens.border}` : 'none' }}>
                    {/* Avatar con gradiente */}
                    <div className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} text-[11px] font-bold text-white`}>
                      {initials(ev.name)}
                    </div>
                    {/* Nombre y hora */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{ev.name}</p>
                      <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>{ev.dept} · {ev.time}</p>
                    </div>
                    {/* Badge de estado derecho */}
                    <span className={`rounded-[5px] border px-1.5 py-0.5 text-[10px] font-bold tracking-[0.04em] ${cfg.textColor} ${cfg.bg} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dos pequeñas tarjetas de resumen inferior en Live Activity */}
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              {[
                { label: 'Total checked in', value: '96',  color: '#34d399' },
                { label: 'Still pending',    value: '104', color: tokens.textSecondary },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-[12px] border p-3.5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                  <p className="text-[20px] font-bold tracking-[-0.02em]" style={{ color }}>{value}</p>
                  <p className="mt-1 text-[10px] font-medium" style={{ color: tokens.textSecondary }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

    </div>
  );
} 