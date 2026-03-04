import React, { useState, useEffect } from 'react';
import { Home, Calendar, BarChart2, LogOut, Clock, TrendingUp, CheckCircle2, Bell, CheckCircle, Settings } from 'lucide-react';
import { useTokens, useTheme } from '../contexts/Themecontext';

// ============================================================================
// 1. DATOS SIMULADOS (MOCKS)
// ============================================================================

// Datos para el gráfico de barras de "Horas de la semana"
const weekData = [
  { day: 'Mon', hours: 8 },
  { day: 'Tue', hours: 9.5 },
  { day: 'Wed', hours: 8.5 },
  { day: 'Thu', hours: 10 },
  { day: 'Fri', hours: 7 },
  { day: 'Sat', hours: 0 },
];

// Datos para la lista de "Actividad Reciente" (Panel derecho)
const activityData = [
  { name: 'Alejandro Nicolás', time: '04:30 PM', status: 'checked-in' },
  { name: 'Nuria García',      time: '04:30 PM', status: 'checked-in' },
  { name: 'Miguel Hernández',  time: '04:30 PM', status: 'checked-out' },
  { name: 'Diego Martín',      time: '04:30 PM', status: 'checked-in' },
  { name: 'Lucia Sastre',      time: '04:30 PM', status: 'checked-out' },
];

// Degradados para las fotos de perfil automáticas
const avatarGradients = [
  'from-[#6366f1] to-[#8b5cf6]',
  'from-[#f093fb] to-[#f5576c]',
  'from-[#4facfe] to-[#00f2fe]',
  'from-[#43e97b] to-[#38f9d7]',
  'from-[#fa709a] to-[#fee140]',
];

// Cálculos derivados para las estadísticas
const totalHours = weekData.reduce((a, b) => a + b.hours, 0); // Suma todas las horas de la semana
const maxHours   = Math.max(...weekData.map((d) => d.hours)); // Encuentra el día con más horas para escalar el gráfico

// Utilidad para extraer iniciales de un nombre (Ej: "Alejandro Nicolas" -> "AN")
const initials   = (name) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

// ============================================================================
// 2. COMPONENTE PRINCIPAL: EmployeeDashboard
// ============================================================================
export default function EmployeeDashboard({ onLogout, onNav }) {
  // Inicializamos los tokens de diseño (colores según tema oscuro/claro)
  const tokens = useTokens();
  const { isDark } = useTheme();

  // ESTADOS DE REACT
  // `time`: Guarda la hora actual para el reloj en vivo.
  const [time,         setTime]       = useState(new Date());
  // `checkedIn`: Estado del botón de fichaje (Falso = No ha entrado, Verdadero = Fichó entrada)
  const [checkedIn,  setCheckedIn]  = useState(false);
  // `hoveredBar`: Guarda qué barra del gráfico está siendo "apuntada" con el ratón
  const [hoveredBar, setHoveredBar] = useState(null);

  // EFECTO DE RELOJ EN TIEMPO REAL
  // Se ejecuta una vez al cargar el componente y actualiza la hora cada segundo (1000ms)
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t); // Limpiamos el intervalo si el usuario cambia de página
  }, []);

  // Formateo del tiempo actual para mostrar en el reloj gigante
  const hours   = time.getHours();
  const mins    = time.getMinutes().toString().padStart(2, '0');
  const secs    = time.getSeconds().toString().padStart(2, '0');
  const ampm    = hours >= 12 ? 'PM' : 'AM';
  const display = (hours % 12 || 12).toString().padStart(2, '0'); // Convierte formato 24h a 12h
  
  // Saludo dinámico según la hora del día
  const greeting = hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening';

  // Configuración del menú lateral del empleado
  const navItems = [
    { id: 'home',     label: 'Home',     Icon: Home },
    { id: 'schedule', label: 'Schedule', Icon: Calendar },
    { id: 'reports',  label: 'Reports',  Icon: BarChart2 },
    { id: 'settings', label: 'Settings', Icon: Settings },
  ];

  return (
    // Contenedor general de la vista
    <div
      className="flex h-screen overflow-hidden font-[DM_Sans,system-ui,sans-serif]"
      style={{ background: tokens.bg, color: tokens.textPrimary }}
    >
      {/* Inyección de estilos globales y animación del botón de 'Live' */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ======================= SIDEBAR ======================= */}
      <aside
        className="flex w-[220px] shrink-0 flex-col gap-1.5 px-4 py-6"
        style={{ background: tokens.bgSidebar, borderRight: `1px solid ${tokens.borderSide}` }}
      >
        {/* LOGO */}
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <img 
            src="./Checki_purple.png" 
            alt="Logo CheckIn"
            className="h-10 w-full rounded-[8px] object-contain" 
          />
        </div>

        <p className="mb-1 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: tokens.textMuted }}>
          Menu
        </p>

        {/* RENDERIZADO DEL MENÚ */}
        {navItems.map(({ id, label, Icon }) => {
          const active = id === 'home'; // En este componente, el "Home" es siempre la página activa
          return (
            <button
              key={id}
              onClick={() => onNav?.(id)} // Función que cambia de página (comunica con App.jsx)
              className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-all"
              style={{
                background: active ? tokens.accentLight : 'transparent',
                color: active ? tokens.accentText : tokens.textSecondary,
                border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.color = tokens.textPrimary; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textSecondary; } }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}

        <div className="flex-1" />

        {/* TARJETA DE PERFIL (Bottom Sidebar) */}
        <div
          className="rounded-[12px] border p-3.5"
          style={{ background: tokens.bgCard, borderColor: tokens.border }}
        >
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-[12px] font-bold text-white">
              AP
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Antonio Pérez</p>
              <p className="text-[11px]" style={{ color: tokens.textSecondary }}>Web Designer</p>
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

      {/* ======================= CONTENIDO PRINCIPAL ======================= */}
      <main className="flex-1 overflow-auto p-8">

        {/* CABECERA: Saludo, Fecha y Botones de Campana/Semana */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>
              Good {greeting}, Antonio 
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: tokens.textSecondary }}>
              {time.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border"
              style={{ borderColor: tokens.border, background: tokens.bgCard }}
            >
              <Bell size={15} style={{ color: tokens.textSecondary }} />
            </button>
            <div
              className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium"
              style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
            >
              Week 9 / 2026
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL (Dos columnas: 1fr Izquierda, 320px Derecha) */}
        <div className="grid grid-cols-[1fr_320px] gap-5">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="flex flex-col gap-5">

            {/* 1. TARJETA DEL RELOJ Y FICHAJE */}
            <div
              className="relative overflow-hidden rounded-[16px] border p-6"
              style={{ background: tokens.bgCard, borderColor: tokens.border }}
            >
              {/* Resplandor circular de fondo. Si está Checked In es Verde, si no, Morado */}
              <div
                className="pointer-events-none absolute -right-14 -top-14 h-[200px] w-[200px] rounded-full transition-all duration-700"
                style={{
                  background: checkedIn
                    ? 'radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)'
                    : 'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)',
                }}
              />
              <div className="flex items-center justify-between">
                {/* Zona del reloj */}
                <div>
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: tokens.textSecondary }}>
                    Current Time
                  </p>
                  <div className="flex items-baseline gap-2">
                    {/* Hora principal usando una tipografía monoespaciada para que no baile */}
                    <span className="font-[DM_Mono,monospace] text-[52px] font-medium leading-none tracking-[-0.03em]" style={{ color: tokens.textPrimary }}>
                      {display}:{mins}
                    </span>
                    <span className="font-[DM_Mono,monospace] text-[28px]" style={{ color: tokens.textSecondary }}>:{secs}</span>
                    <span
                      className="rounded-[6px] px-2 py-0.5 text-[13px] font-semibold"
                      style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                    >
                      {ampm}
                    </span>
                  </div>
                  {/* Mensaje de estado que aparece solo cuando el usuario ficha */}
                  {checkedIn && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#22c55e]" style={{ animation: 'pulse 2s infinite', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
                      <span className="text-[12px] font-medium text-[#22c55e]">Active session — clocked in at 09:00 AM</span>
                    </div>
                  )}
                </div>
                
                {/* Botón de fichar (Alterna entre Morado y Verde) */}
                <button
                  onClick={() => setCheckedIn(!checkedIn)} // Cambia el estado al hacer clic
                  className="rounded-[12px] px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-px active:translate-y-0"
                  style={{
                    background: checkedIn
                      ? 'linear-gradient(135deg,#16a34a,#15803d)'
                      : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    boxShadow: checkedIn
                      ? '0 8px 24px rgba(22,163,74,0.25)'
                      : '0 8px 24px rgba(99,102,241,0.3)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {checkedIn ? '✓ Checked In' : 'Check In'}
                </button>
              </div>
            </div>

            {/* 2. CHIPS DE ESTADÍSTICAS (Mapeo rápido de 3 mini tarjetas) */}
            <div className="grid grid-cols-3 gap-3.5">
              {[
                { label: 'Hours This Week', value: `${totalHours}h`,               sub: '+2.5h vs last week',  Icon: Clock,       color: '#818cf8', iconBg: 'rgba(129,140,248,0.1)' },
                { label: 'Avg Daily Hours', value: `${(totalHours/5).toFixed(1)}h`, sub: 'Mon – Fri',          Icon: TrendingUp,  color: '#34d399', iconBg: 'rgba(52,211,153,0.1)'  },
                { label: 'Days Present',    value: '5 / 5',                         sub: 'Perfect attendance', Icon: CheckCircle, color: '#f59e0b', iconBg: 'rgba(245,158,11,0.1)'  },
              ].map(({ label, value, sub, Icon, color, iconBg }) => (
                <div
                  key={label}
                  className="rounded-[16px] border px-5 py-4"
                  style={{ background: tokens.bgCard, borderColor: tokens.border }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: tokens.textSecondary }}>{label}</span>
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px]" style={{ background: iconBg }}>
                      <Icon size={13} color={color} />
                    </div>
                  </div>
                  <p className="text-[26px] font-semibold leading-none tracking-[-0.02em]" style={{ color }}>{value}</p>
                  <p className="mt-1.5 text-[11px]" style={{ color: tokens.textSecondary }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* 3. GRÁFICO DE BARRAS DE HORAS */}
            <div
              className="rounded-[16px] border p-6"
              style={{ background: tokens.bgCard, borderColor: tokens.border }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>Weekly Hours</p>
                  <p className="mt-0.5 text-[12px]" style={{ color: tokens.textSecondary }}>Feb 19 – Feb 24, 2026</p>
                </div>
                {/* Botones selectores Week/Month (decorativos por ahora) */}
                <div className="flex gap-2">
                  {['Week', 'Month'].map((t, i) => (
                    <button
                      key={t}
                      className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                      style={{
                        background: i === 0 ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: i === 0 ? '#818cf8' : tokens.textSecondary,
                        border: i === 0 ? '1px solid rgba(99,102,241,0.3)' : `1px solid ${tokens.border}`,
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenedor de las barras (flexbox que alinea al fondo: items-end) */}
              <div className="flex h-36 items-end gap-1">
                {weekData.map((item, idx) => {
                  // Calcular el porcentaje de altura (basado en un maximo de 12 horas)
                  const pct = maxHours > 0 ? (item.hours / 12) * 100 : 0;
                  const hovered = hoveredBar === idx; // Saber si el ratón está encima

                  return (
                    <div
                      key={item.day}
                      className="flex flex-1 cursor-pointer flex-col items-center gap-1.5"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Etiqueta tooltip con las horas. Se muestra (opacity: 1) si hay hover */}
                      <span
                        className="rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold transition-opacity"
                        style={{
                          border: '1px solid rgba(99,102,241,0.2)',
                          background: 'rgba(99,102,241,0.15)',
                          color: '#818cf8',
                          opacity: hovered ? 1 : 0,
                        }}
                      >
                        {item.hours}h
                      </span>
                      {/* Fondo de la barra */}
                      <div
                        className="flex w-full flex-1 items-end overflow-hidden rounded-[8px]"
                        style={{ background: tokens.bg }}
                      >
                        {/* La barra de relleno propiamente dicha */}
                        <div
                          className="w-full rounded-t-[6px] transition-all duration-200"
                          style={{
                            height: `${pct}%`,
                            minHeight: item.hours > 0 ? 4 : 0,
                            // Si horas son 0, la pinta gris, si no, un gradiente que se ilumina al hacer hover
                            background: item.hours === 0
                              ? tokens.border
                              : hovered
                                ? 'linear-gradient(180deg,#818cf8,#6366f1)'
                                : 'linear-gradient(180deg,#5a5fcf,#4347a0)',
                          }}
                        />
                      </div>
                      {/* Etiqueta del día bajo la barra */}
                      <span
                        className="text-[11px] font-medium transition-colors"
                        style={{ color: hovered ? '#818cf8' : tokens.textMuted }}
                      >
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================= COLUMNA DERECHA ======================= */}
          <div className="flex flex-col gap-5">
            
            {/* 1. TARJETA RESUMEN DEL DÍA */}
            <div
              className="rounded-[16px] border p-5"
              style={{ background: tokens.bgCard, borderColor: tokens.border }}
            >
              <p className="mb-4 text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Today's Summary</p>
              {[
                { label: 'Clock In',     value: '09:00 AM', color: '#34d399' },
                { label: 'Break',        value: '30 min',   color: '#f59e0b' },
                { label: 'Expected Out', value: '06:00 PM', color: '#818cf8' },
              ].map(({ label, value, color }, i, arr) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: i < arr.length - 1 ? `1px solid ${tokens.border}` : 'none' }}
                >
                  <span className="text-[12px]" style={{ color: tokens.textSecondary }}>{label}</span>
                  <span className="text-[13px] font-semibold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* 2. LISTA DE ACTIVIDAD RECIENTE */}
            <div
              className="flex flex-1 flex-col rounded-[16px] border p-5"
              style={{ background: tokens.bgCard, borderColor: tokens.border }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Recent Activity</p>
                <span className="cursor-pointer text-[11px]" style={{ color: tokens.textSecondary }}>View all →</span>
              </div>
              {activityData.map((person, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 py-3"
                  style={{ borderBottom: idx < activityData.length - 1 ? `1px solid ${tokens.border}` : 'none' }}
                >
                  {/* Foto de perfil generada dinámicamente con las iniciales */}
                  <div
                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${avatarGradients[idx % 5].replace('from-[','').replace('] to-[',', ').replace(']','')})` }}
                  >
                    {initials(person.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{person.name}</p>
                    <p className="mt-0.5 text-[11px]" style={{ color: tokens.textMuted }}>24 / 02 / 2026 · {person.time}</p>
                  </div>
                  {/* Puntito indicador de estado (Verde si entró, Gris si salió) */}
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{
                      background: person.status === 'checked-in' ? '#22c55e' : tokens.textSecondary,
                      boxShadow: person.status === 'checked-in' ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}