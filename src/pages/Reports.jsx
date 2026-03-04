import React, { useState } from 'react';
import {
  Home, Calendar, BarChart2, Settings as SettingsIcon, LogOut,
  CheckCircle2, Download, Search, Filter, AlertCircle, FileText, 
  Clock, CheckCircle, XCircle, Umbrella, Stethoscope
} from 'lucide-react';
import { useTheme, useTokens } from '../contexts/Themecontext';

// ============================================================================
// 1. DATOS SIMULADOS (MOCKS)
// ============================================================================

// Datos para las 4 tarjetas de resumen (KPIs) en la parte superior
const summaryCards = [
  { title: 'Total Hours', value: '156h', sub: 'This month', color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  { title: 'Vacation Days', value: '12 / 22', sub: 'Days remaining', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  { title: 'Pending Requests', value: '2', sub: 'Needs approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { title: 'Incidents', value: '1', sub: 'Resolved', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
];

// Base de datos estática para la tabla de reportes/solicitudes
const reportsData = [
  { id: 'REQ-001', date: '15 Mar 2026', type: 'Vacation', desc: 'Summer holidays trip', status: 'Approved', icon: Umbrella },
  { id: 'REQ-002', date: '02 Mar 2026', type: 'Medical', desc: 'Dentist appointment (Morning)', status: 'Pending', icon: Stethoscope },
  { id: 'INC-045', date: '28 Feb 2026', type: 'Incident', desc: 'Forgot to clock out', status: 'Resolved', icon: AlertCircle },
  { id: 'REQ-003', date: '10 Feb 2026', type: 'Vacation', desc: 'Personal day', status: 'Rejected', icon: Umbrella },
  { id: 'REP-102', date: '31 Jan 2026', type: 'Timesheet', desc: 'January Monthly Report', status: 'Approved', icon: FileText },
];

// Diccionario de estilos visuales según el estado del reporte. 
// Define qué color, fondo e icono se usa para cada "Badge" (etiqueta).
const statusStyles = {
  Approved: { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', icon: CheckCircle }, // Verde
  Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Clock },       // Naranja
  Resolved: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', icon: CheckCircle2 },// Morado
  Rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', icon: XCircle },    // Rojo
};

// ============================================================================
// 2. COMPONENTE PRINCIPAL: ReportsPage
// ============================================================================
export default function ReportsPage({ role = 'employee', onLogout, onNav }) {
  // Obtenemos los colores del tema actual
  const tokens = useTokens();
  const { isDark } = useTheme();
  
  // Estado para controlar qué pestaña del filtro está activa (Por defecto: "All")
  const [activeTab, setActiveTab] = useState('All');

  // Lista de pestañas disponibles para filtrar la tabla
  const tabs = ['All', 'Vacations', 'Medical', 'Incidents'];

  // LÓGICA DEL SIDEBAR: Comprueba si el usuario es admin o empleado
  const isAdmin = role === 'admin';
  // Genera el menú lateral correspondiente según el rol
  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', Icon: Home },
        { id: 'employees', label: 'Employees', Icon: Calendar }, // Asumiendo Users icon si lo tienes importado
        { id: 'reports',   label: 'Reports',   Icon: BarChart2 },
        { id: 'settings',  label: 'Settings',  Icon: SettingsIcon },
      ]
    : [
        { id: 'home',      label: 'Home',      Icon: Home },
        { id: 'schedule',  label: 'Schedule',  Icon: Calendar },
        { id: 'reports',   label: 'Reports',   Icon: BarChart2 },
        { id: 'settings',  label: 'Settings',  Icon: SettingsIcon },
      ];

  // LÓGICA DE FILTRADO DE LA TABLA:
  // Si la pestaña es "All", muestra todo. Si no, filtra los reportes donde el 'type' coincida con la pestaña.
  const filteredReports = activeTab === 'All' 
    ? reportsData 
    : reportsData.filter(r => r.type === activeTab || (activeTab === 'Medical' && r.type === 'Medical'));

  return (
    // Contenedor principal de pantalla completa
    <div
      className="flex h-screen overflow-hidden font-[DM_Sans,system-ui,sans-serif]"
      style={{ background: tokens.bg, color: tokens.textPrimary }}
    >
      {/* Estilos globales y personalización de la barra de desplazamiento (Scrollbar) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#2a2f3a' : '#d1d5db'}; border-radius: 2px; }
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

        {/* Mapeo dinámico del menú lateral basado en la variable navItems (que depende del rol) */}
        {navItems.map(({ id, label, Icon }) => {
          const isActive = id === 'reports'; // Forzamos a que "Reports" sea la pestaña activa
          return (
            <button
              key={id}
              onClick={() => onNav?.(id)} // Llama al enrutador (App.jsx)
              className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-all"
              style={{
                background: isActive ? tokens.accentLight : 'transparent',
                color: isActive ? tokens.accentText : tokens.textSecondary,
                border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.color = tokens.textPrimary; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textSecondary; } }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}

        <div className="flex-1" />

        {/* TARJETA DE PERFIL (Dinámica según el rol) */}
        <div className="rounded-[12px] border p-3.5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
          <div className="mb-3 flex items-center gap-2.5">
            {/* El color y las iniciales cambian dependiendo si es admin o empleado */}
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${isAdmin ? 'bg-gradient-to-br from-[#f093fb] to-[#f5576c]' : 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]'}`}>
              {isAdmin ? 'RM' : 'AP'}
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{isAdmin ? 'Rosa Muñoz' : 'Antonio Pérez'}</p>
              <p className="text-[11px]" style={{ color: tokens.textSecondary }}>{isAdmin ? 'Administrator' : 'Web Designer'}</p>
            </div>
          </div>
          {/* BOTÓN CERRAR SESIÓN */}
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] border py-1.5 text-[12px] font-medium transition-all"
            style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary; }}
          >
            <LogOut size={12} /> Log out
          </button>
        </div>
      </aside>

      {/* ======================= CONTENIDO PRINCIPAL ======================= */}
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-[1050px]">
          
          {/* CABECERA Y BOTÓN DE EXPORTAR */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>
                Reports & Requests
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: tokens.textSecondary }}>
                Track your timesheets, absences, and logged incidents.
              </p>
            </div>
            
            <button 
              className="flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-all hover:bg-white/5"
              style={{ borderColor: tokens.border, color: tokens.textPrimary, background: tokens.bgCard }}
            >
              <Download size={15} /> Export PDF/CSV
            </button>
          </div>

          {/* TARJETAS DE RESUMEN KPI (Mapeadas desde summaryCards) */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <div key={i} className="rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textSecondary }}>
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-bold leading-none tracking-[-0.02em]" style={{ color: card.color }}>
                    {card.value}
                  </span>
                </div>
                <p className="mt-2 text-[11px]" style={{ color: tokens.textMuted }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* CONTENEDOR DE LA TABLA Y FILTROS */}
          <div className="rounded-[20px] border" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
            
            {/* TOOLBAR: Pestañas de filtrado y Búsqueda */}
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: tokens.border }}>
              
              {/* Pestañas (Tabs) */}
              <div className="flex gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)} // Cambia el estado, lo que dispara el re-render y filtra la tabla
                    className="rounded-[8px] px-4 py-1.5 text-[13px] font-medium transition-all"
                    style={{
                      // Resalta el botón si es la pestaña activa actualmente
                      background: activeTab === tab ? tokens.accentLight : 'transparent',
                      color: activeTab === tab ? tokens.accentText : tokens.textSecondary,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              {/* Controles de Búsqueda y Filtro adicional */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input 
                    type="text" 
                    placeholder="Search reports..." 
                    className="w-[200px] rounded-[8px] border py-1.5 pl-9 pr-3 text-[12px] outline-none"
                    style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }}
                  />
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-[8px] border transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>
                  <Filter size={14} />
                </button>
              </div>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className="px-6 py-2">
              
              {/* Cabecera de la tabla (Usamos Grid para alinear perfectamente las columnas) */}
              <div className="grid grid-cols-[1fr_2fr_3fr_1.5fr] gap-4 py-3 text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>
                <span>ID / Date</span>
                <span>Type</span>
                <span>Description</span>
                <span className="text-right">Status</span>
              </div>

              {/* Filas de reportes */}
              <div className="flex flex-col">
                {/* Mapeamos el array 'filteredReports' (ya filtrado por las pestañas) */}
                {filteredReports.map((row, i) => {
                  const StatusIcon = statusStyles[row.status].icon; // Obtenemos el icono correspondiente al estado
                  const RowIcon = row.icon; // Icono del tipo de reporte (Paraguas, Documento, etc)
                  
                  return (
                    <div 
                      key={row.id} 
                      className="grid grid-cols-[1fr_2fr_3fr_1.5fr] items-center gap-4 border-b py-4 last:border-none transition-colors hover:bg-white/[0.01]"
                      style={{ borderColor: tokens.border }}
                    >
                      {/* Columna 1: ID y Fecha */}
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{row.id}</p>
                        <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>{row.date}</p>
                      </div>

                      {/* Columna 2: Tipo de Reporte e Icono */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: tokens.bgInput }}>
                          <RowIcon size={14} style={{ color: tokens.textSecondary }} />
                        </div>
                        <span className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{row.type}</span>
                      </div>

                      {/* Columna 3: Descripción */}
                      <div className="truncate text-[13px]" style={{ color: tokens.textSecondary }}>
                        {row.desc}
                      </div>

                      {/* Columna 4: Etiqueta de Estado (Badge visual) */}
                      <div className="flex justify-end">
                        <div 
                          className="flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1"
                          style={{ 
                            background: statusStyles[row.status].bg, 
                            borderColor: statusStyles[row.status].border,
                            color: statusStyles[row.status].color
                          }}
                        >
                          <StatusIcon size={12} strokeWidth={2.5} />
                          <span className="text-[11px] font-bold tracking-wide">{row.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* ESTADO VACÍO: Se muestra si al filtrar no hay resultados (ej. Si pulsas Incidents y no hay ninguno) */}
                {filteredReports.length === 0 && (
                  <div className="py-12 text-center" style={{ color: tokens.textSecondary }}>
                    <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-[13px]">No records found for this category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}