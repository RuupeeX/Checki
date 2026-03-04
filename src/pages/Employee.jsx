import React, { useState } from 'react';
import {
  Home, Calendar, BarChart2, Settings as SettingsIcon, LogOut,
  CheckCircle2, Search, Filter, Mail, MoreHorizontal, Plus, Users
} from 'lucide-react';
import { useTheme, useTokens } from '../contexts/Themecontext';

// ============================================================================
// 1. DATOS SIMULADOS (MOCKS)
// ============================================================================

// Base de datos estática de empleados para poblar la tabla.
// En un proyecto real, esto se obtendría mediante un fetch() o axios.
const employeesData = [
  { id: 1, name: 'Nuria García Martínez', role: 'IT Support', start: '8:30 AM', end: '5:30 PM', status: 'On Time' },
  { id: 2, name: 'Antonio Nieves Monge', role: 'System Admin', start: '8:30 AM', end: '5:30 PM', status: 'Late' },
  { id: 3, name: 'Jaime López Ramos', role: 'Network Eng.', start: '11:30 PM', end: '8:30 AM', status: 'On Leave' },
  { id: 4, name: 'Alejandro González Prada', role: 'Security Ops', start: '8:30 AM', end: '5:30 PM', status: 'On Time' },
  { id: 5, name: 'Lucía Sastre', role: 'Data Analyst', start: '9:00 AM', end: '6:00 PM', status: 'On Time' },
];

// Array de degradados Tailwind. Usaremos el índice del empleado (i % 5) 
// para asignarle uno de estos fondos a su foto de perfil de manera consistente.
const avatarGradients = [
  'from-[#6366f1] to-[#8b5cf6]', // Morado
  'from-[#f093fb] to-[#f5576c]', // Rosa/Rojo
  'from-[#4facfe] to-[#00f2fe]', // Azul
  'from-[#43e97b] to-[#38f9d7]', // Verde
  'from-[#fa709a] to-[#fee140]', // Naranja/Amarillo
];

// Función utilitaria: Convierte un nombre ("Juan Perez") en iniciales ("JP")
const initials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// Diccionario que define los colores y fondos de los "Badges" (Etiquetas) de estado.
const statusStyles = {
  'On Time': { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' }, // Verde
  'Late':    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' }, // Naranja
  'On Leave':{ color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' }, // Morado
};

// ============================================================================
// 2. COMPONENTE PRINCIPAL: EmployeesPage
// ============================================================================
export default function EmployeesPage({ onLogout, onNav }) {
  const tokens = useTokens(); // Obtiene los colores actuales (modo oscuro o claro)
  const { isDark } = useTheme(); // Para saber si inyectar scrollbars oscuras o claras
  
  // Estado para la barra de búsqueda superior
  const [searchTerm, setSearchTerm] = useState('');

  // Elementos de la barra de navegación lateral para el Administrador
  const navItems = [
    { id: 'home',      label: 'Dashboard', Icon: Home },
    { id: 'employees', label: 'Employees', Icon: Users },
    { id: 'reports',   label: 'Reports',   Icon: BarChart2 },
    { id: 'settings',  label: 'Settings',  Icon: SettingsIcon },
  ];

  // LÓGICA DE FILTRADO: 
  // Filtramos la lista de empleados basándonos en si el nombre incluye lo que el usuario escribió.
  // Convertimos todo a minúsculas (.toLowerCase) para que la búsqueda no sea sensible a mayúsculas.
  const filteredEmployees = employeesData.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Contenedor base de la aplicación. Ocupa todo el alto de la pantalla.
    <div
      className="flex h-screen overflow-hidden font-[DM_Sans,system-ui,sans-serif]"
      style={{ background: tokens.bg, color: tokens.textPrimary }}
    >
      {/* Estilos globales inyectados (Fuente y personalización de la barra de desplazamiento) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#2a2f3a' : '#d1d5db'}; border-radius: 2px; }
      `}</style>

      {/* ======================= SIDEBAR (Barra Lateral) ======================= */}
      <aside
        className="flex w-[220px] shrink-0 flex-col gap-1.5 px-4 py-6"
        style={{ background: tokens.bgSidebar, borderRight: `1px solid ${tokens.borderSide}` }}
      >
        {/* Zona del LOGO */}
        <div className="mb-7 flex items-center gap-2.5 px-2">
          {/* Se inserta la imagen del logo */}
          <img 
            src="./Checki_purple.png" 
            alt="Logo CheckIn"
            className="h-10 w-full rounded-[8px] object-contain" 
          />
        </div>

        <p className="mb-1 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: tokens.textMuted }}>
          Main
        </p>

        {/* MAPEO DE LOS BOTONES DEL MENÚ */}
        {navItems.map(({ id, label, Icon }) => {
          const isActive = id === 'employees'; // Fuerza el estado activo para la página actual
          return (
            <button
              key={id}
              onClick={() => onNav?.(id)} // Función de navegación que le decimos al App.jsx
              className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-all"
              style={{
                // Si es la pestaña activa, pintamos el fondo ligeramente de morado
                background: isActive ? tokens.accentLight : 'transparent',
                color: isActive ? tokens.accentText : tokens.textSecondary,
                border: 'none', cursor: 'pointer',
              }}
              // Efectos hover: Cambiamos el color de fondo vía JS (inline styles)
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.color = tokens.textPrimary; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textSecondary; } }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}

        {/* Un div vacío con flex-1 empuja el bloque de perfil hasta la parte inferior */}
        <div className="flex-1" />

        {/* TARJETA DEL PERFIL DE USUARIO ADMIN */}
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
        <div className="mx-auto max-w-[1100px]">
          
          {/* CABECERA DE LA PÁGINA */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>
                IT Department
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: tokens.textSecondary }}>
                Manage team members, shifts, and statuses.
              </p>
            </div>
            
            {/* Botón principal de acción (+ Add Employee) */}
            <button 
              className="flex items-center gap-2 rounded-[12px] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}
            >
              <Plus size={16} strokeWidth={2.5} /> Add Employee
            </button>
          </div>

          {/* CONTENEDOR DE LA TABLA (Tarjeta con borde) */}
          <div className="rounded-[20px] border" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
            
            {/* BARRA DE HERRAMIENTAS (Toolbar) -> Búsqueda y Filtros */}
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: tokens.border }}>
              
              {/* Input de Búsqueda */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                <input 
                  type="text" 
                  placeholder="Search name..." 
                  value={searchTerm}
                  // Al escribir, se actualiza el estado y el filter superior recalcula la lista
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[280px] rounded-[10px] border py-2.5 pl-10 pr-4 text-[13px] outline-none transition-colors"
                  style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'} // Borde morado al hacer click
                  onBlur={(e) => e.target.style.borderColor = tokens.border}
                />
              </div>

              {/* Botones de filtros (actualmente decorativos) */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>
                  Shift Start <Filter size={14} />
                </button>
                <button className="flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>
                  Filters <Filter size={14} />
                </button>
              </div>

            </div>

            {/* ZONA DE LA TABLA */}
            <div className="px-6 py-2">
              {/* Cabecera de la tabla. Usamos grid para alinear las columnas perfectas */}
              {/* 2.5fr para el nombre, 1fr para el resto */}
              <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr] gap-4 py-4 text-[12px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>
                <span>Profile</span>
                <span>Shift Start</span>
                <span>Shift End</span>
                <span>Status</span>
                <span className="ml-4">Actions</span>
              </div>

              {/* Filas de empleados */}
              <div className="flex flex-col">
                {/* Mapeamos el array ya filtrado por la búsqueda */}
                {filteredEmployees.map((emp, i) => {
                  const s = statusStyles[emp.status]; // Obtenemos el color según "On Time", "Late", etc.
                  return (
                    <div 
                      key={emp.id} 
                      // Misma estructura de grid que la cabecera para que todo cuadre
                      className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b py-4 last:border-none transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: tokens.border }}
                    >
                      {/* Columna 1: Perfil (Avatar + Nombre + Rol) */}
                      <div className="flex items-center gap-3.5">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} text-[13px] font-bold text-white shadow-sm`}>
                          {initials(emp.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>{emp.name}</p>
                          <p className="mt-0.5 truncate text-[12px]" style={{ color: tokens.textSecondary }}>{emp.role}</p>
                        </div>
                      </div>

                      {/* Columna 2 y 3: Turnos */}
                      <div className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{emp.start}</div>
                      <div className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{emp.end}</div>

                      {/* Columna 4: Estado (Badge coloreado) */}
                      <div>
                        <span 
                          className="inline-flex items-center rounded-[6px] border px-2.5 py-1 text-[11px] font-bold tracking-wide"
                          style={{ background: s.bg, borderColor: s.border, color: s.color }}
                        >
                          {emp.status}
                        </span>
                      </div>

                      {/* Columna 5: Acciones (Botones) */}
                      <div className="flex justify-end gap-2">
                        {/* Botón de mensaje estilo ghost (Transparente hasta hacer hover) */}
                        <button 
                          className="flex items-center gap-2 rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-all"
                          style={{ borderColor: tokens.border, color: tokens.textPrimary, background: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textPrimary; e.currentTarget.style.background = 'transparent'; }}
                          title="Send Message"
                        >
                          <Mail size={14} /> Message
                        </button>
                        {/* Botón de opciones (...) */}
                        <button 
                          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border transition-colors hover:bg-white/5"
                          style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent' }}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Mensaje por si la búsqueda no encuentra a nadie */}
                {filteredEmployees.length === 0 && (
                  <div className="py-12 text-center" style={{ color: tokens.textSecondary }}>
                    <p className="text-[14px]">No employees found with that name.</p>
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