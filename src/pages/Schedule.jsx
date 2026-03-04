import React from 'react';
import {
  Home, Calendar, BarChart2, Settings as SettingsIcon, LogOut,
  CheckCircle2, ChevronLeft, ChevronRight, Plus, Clock
} from 'lucide-react';
import { useTheme, useTokens } from '../contexts/Themecontext';

// ============================================================================
// 1. DATOS SIMULADOS (MOCKS)
// ============================================================================

// Objeto que representa la semana actual.
// 'active: true' indica que es día laborable y hay que pintar los bloques de horario.
// 'active: false' pinta bloques vacíos/grises (ej. fin de semana).
// 'isToday: true' resalta el número del día en morado.
const weekSchedule = [
  { day: 'Mon', date: '23', active: true,  isToday: false },
  { day: 'Tue', date: '24', active: true,  isToday: false },
  { day: 'Wed', date: '25', active: true,  isToday: true  }, // Hoy es Miércoles 25
  { day: 'Thu', date: '26', active: true,  isToday: false },
  { day: 'Fri', date: '27', active: true,  isToday: false },
  { day: 'Sat', date: '28', active: false, isToday: false }, // Sábado (Inactivo)
  { day: 'Sun', date: '1',  active: false, isToday: false }, // Domingo (Inactivo)
];

// Lista de eventos próximos (reuniones, fechas límite, etc.)
const upcomingEvents = [
  { title: 'Team Meeting', time: 'Monday 10:00 AM', type: 'meeting' },
  { title: 'Summer Holiday Request', time: 'Deadline Friday 12:00 AM', type: 'deadline' },
];

// ============================================================================
// 2. COMPONENTE PRINCIPAL: SchedulePage
// ============================================================================
export default function SchedulePage({ onLogout, onNav }) {
  // Obtenemos los tokens de color dinámicos del contexto
  const tokens = useTokens();
  // Extraemos isDark para condicionar ciertos estilos (como el color del scrollbar)
  const { isDark } = useTheme();

  // Elementos de la barra lateral (Sidebar) específicos para el rol de Empleado
  const navItems = [
    { id: 'home',     label: 'Home',     Icon: Home },
    { id: 'schedule', label: 'Schedule', Icon: Calendar },
    { id: 'reports',  label: 'Reports',  Icon: BarChart2 },
    { id: 'settings', label: 'Settings', Icon: SettingsIcon },
  ];

  return (
    // Contenedor principal de la aplicación. Ocupa todo el viewport (h-screen, w-full implícito en flex)
    <div
      className="flex h-screen overflow-hidden font-[DM_Sans,system-ui,sans-serif]"
      style={{ background: tokens.bg, color: tokens.textPrimary }} // Fondo y color de texto base según el tema
    >
      {/* Estilos globales y personalización de la barra de desplazamiento lateral (Scrollbar) */}
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
        {/* LOGO: Mostramos la imagen png */}
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

        {/* MAPEO DE BOTONES DE NAVEGACIÓN */}
        {navItems.map(({ id, label, Icon }) => {
          // Forzamos que la pestaña 'schedule' aparezca siempre activa en este componente
          const isActive = id === 'schedule';
          return (
            <button
              key={id}
              onClick={() => onNav?.(id)} // Función que pasa el ID de la pestaña a App.jsx para cambiar la vista
              className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-all"
              style={{
                // Si está activo, usamos el color de acento claro del tema para el fondo
                background: isActive ? tokens.accentLight : 'transparent',
                // Texto en color principal si está activo, si no en gris (secundario)
                color: isActive ? tokens.accentText : tokens.textSecondary,
                border: 'none', cursor: 'pointer',
              }}
              // Efecto Hover: Cambiamos el fondo/texto inyectando CSS inline al pasar el ratón (solo si no está activo)
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.color = tokens.textPrimary; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textSecondary; } }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}

        {/* Empuja el contenedor del perfil hacia la parte inferior de la pantalla */}
        <div className="flex-1" />

        {/* TARJETA DE PERFIL (Sidebar Bottom) */}
        <div className="rounded-[12px] border p-3.5 transition-colors hover:border-[#2a2f3a]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-[12px] font-bold text-white shadow-sm">
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
            style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent', cursor: 'pointer' }}
            // Efecto Hover rojo (danger) al intentar cerrar sesión
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={12} /> Log out
          </button>
        </div>
      </aside>

      {/* ======================= CONTENIDO PRINCIPAL (Área derecha) ======================= */}
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-[1050px]">
          
          {/* CABECERA (Header) */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>
                My Schedule
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: tokens.textSecondary }}>
                Manage your shifts and time off requests.
              </p>
            </div>
            
            {/* CONTROLES DE LA DERECHA (Selector de fecha y Botón de añadir) */}
            <div className="flex items-center gap-4">
              
              {/* Controles de paginación de semanas (Botón Izquierda, Texto, Botón Derecha) */}
              <div className="flex items-center rounded-[12px] border p-1" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <button className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-white/5" style={{ color: tokens.textSecondary }}>
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-[140px] text-center text-[13px] font-semibold tracking-wide" style={{ color: tokens.textPrimary }}>
                  23 Feb - 1 March
                </span>
                <button className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-white/5" style={{ color: tokens.textSecondary }}>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Botón principal para solicitar ausencia (Request Absence) */}
              <button 
                className="flex items-center gap-2 rounded-[12px] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                  boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
                  border: 'none', cursor: 'pointer' 
                }}
              >
                <Plus size={16} strokeWidth={2.5} /> Request Abs
              </button>
            </div>
          </div>

          {/* TARJETA PRINCIPAL DEL CALENDARIO */}
          <div className="rounded-[24px] border p-7 shadow-sm" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
            
            {/* CUADRÍCULA SEMANAL (Grid de 7 columnas para los 7 días) */}
            <div className="grid grid-cols-7 gap-5">
              {weekSchedule.map((dayObj, index) => (
                <div key={index} className="flex flex-col gap-3.5">
                  
                  {/* CABECERA DE LA COLUMNA DEL DÍA */}
                  <div className="flex flex-col items-center justify-center pb-2">
                    {/* Nombre del día (Mon, Tue, Wed...) */}
                    <span className="text-[12px] font-medium uppercase tracking-[0.05em]" style={{ color: dayObj.isToday ? '#818cf8' : tokens.textSecondary }}>
                      {dayObj.day}
                    </span>
                    {/* Número del día. Si isToday es true, se pinta un círculo morado de fondo */}
                    <div 
                      className="mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold transition-colors"
                      style={{ 
                        background: dayObj.isToday ? '#818cf8' : 'transparent',
                        color: dayObj.isToday ? '#fff' : tokens.textPrimary
                      }}
                    >
                      {dayObj.date}
                    </div>
                  </div>
                  
                  {/* RENDERIZADO DE BLOQUES DE HORARIO */}
                  {/* Si el día es laborable (active: true), renderizamos los 3 bloques (Mañana, Comida, Tarde) */}
                  {dayObj.active ? (
                    <div className="flex flex-col gap-3">
                      
                      {/* BLOQUE 1: Turno de Mañana (Gradiente morado intenso) */}
                      <div 
                        className="group relative flex h-[90px] cursor-pointer flex-col items-center justify-center rounded-[14px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(99,102,241,0.3)]"
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7a5cf5 100%)' }}
                      >
                        <span className="text-[14px] font-bold tracking-wide text-white">8:00 AM</span>
                        <span className="mt-0.5 text-[12px] font-medium text-white/80">2:15 PM</span>
                      </div>
                      
                      {/* BLOQUE 2: Pausa para Comida (Fondo semi-transparente con borde discontinuo) */}
                      <div 
                        className="flex h-[90px] cursor-pointer flex-col items-center justify-center rounded-[14px] transition-colors hover:bg-[#6366f1]/20"
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px dashed rgba(99,102,241,0.3)' }}
                      >
                        <span className="text-[14px] font-bold tracking-wide text-[#818cf8]">2:30 PM</span>
                        <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#818cf8]/70">Lunch</span>
                      </div>
                      
                      {/* BLOQUE 3: Turno de Tarde (Gradiente morado intenso) */}
                      <div 
                        className="group relative flex h-[90px] cursor-pointer flex-col items-center justify-center rounded-[14px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(99,102,241,0.3)]"
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7a5cf5 100%)' }}
                      >
                        <span className="text-[14px] font-bold tracking-wide text-white">3:30 PM</span>
                        <span className="mt-0.5 text-[12px] font-medium text-white/80">6:30 PM</span>
                      </div>
                    </div>
                  ) : (
                    // Si el día NO es laborable (ej. Sábado, Domingo), renderizamos bloques "vacíos" grises
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map((_, i) => (
                        <div 
                          key={i} 
                          className="h-[90px] rounded-[14px]" 
                          style={{ background: tokens.bgInput, border: `1px solid ${tokens.border}`, opacity: 0.5 }} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Componente separador (Línea horizontal) */}
            <Divider />

            {/* SECCIÓN DE PRÓXIMOS EVENTOS (Upcoming Events) */}
            <div className="pt-2">
              <h2 className="mb-5 text-[17px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>
                Upcoming Events
              </h2>
              
              {/* Lista de tarjetas de eventos */}
              <div className="flex flex-col gap-3.5">
                {upcomingEvents.map((ev, i) => (
                  <div 
                    key={i} 
                    className="relative flex items-center overflow-hidden rounded-[16px] border p-5 transition-all hover:bg-white/[0.02]"
                    style={{ background: tokens.bgInput, borderColor: tokens.border }}
                  >
                    {/* Borde lateral de adorno (Gradiente morado posicionado a la izquierda) */}
                    <div className="absolute bottom-0 left-0 top-0 w-[5px] bg-gradient-to-b from-[#6366f1] to-[#8b5cf6]" />
                    
                    {/* Contenido del evento (Título y Hora con Icono) */}
                    <div className="pl-2">
                      <p className="text-[15px] font-semibold tracking-wide" style={{ color: tokens.textPrimary }}>{ev.title}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium" style={{ color: tokens.textSecondary }}>
                        <Clock size={13} className="text-[#818cf8]" /> 
                        {ev.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// 3. COMPONENTES DE UTILIDAD LOCAL
// ============================================================================

// Línea horizontal separadora que respeta el color del borde del tema
function Divider() {
  const tokens = useTokens();
  return <div className="my-8 h-[1px] w-full" style={{ background: tokens.border }} />;
}