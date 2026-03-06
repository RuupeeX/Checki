import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, X, Trash2, Calendar,
  Edit3, Check, List, Grid3X3,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import AppLayout from '../components/AppLayout';
import { scheduleEventTypeConfig } from '../data/mockData';

// ============================================================================
// UTILIDADES
// ============================================================================
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function getMondayOf(date) {
  const d = new Date(date); const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0,0,0,0); return d;
}

function getWeekDays(baseMonday) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday); d.setDate(baseMonday.getDate() + i);
    return { day: DAYS_SHORT[i], date: d.getDate(), month: d.getMonth(), year: d.getFullYear(), fullDate: new Date(d), active: i < 5, isToday: d.toDateString() === today.toDateString() };
  });
}

function formatWeekLabel(days) {
  const f = days[0], l = days[6];
  if (f.month === l.month) return `${f.date} – ${l.date} ${MONTHS_SHORT[f.month]}`;
  return `${f.date} ${MONTHS_SHORT[f.month]} – ${l.date} ${MONTHS_SHORT[l.month]}`;
}

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  let startDay = first.getDay(); if (startDay === 0) startDay = 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();
  const cells = [];
  for (let i = startDay - 1; i > 0; i--) cells.push({ date: daysInPrev - i + 1, current: false, fullDate: new Date(year, month - 1, daysInPrev - i + 1) });
  for (let i = 1; i <= daysInMonth; i++) { const d = new Date(year, month, i); cells.push({ date: i, current: true, fullDate: d, isToday: d.toDateString() === today.toDateString() }); }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ date: i, current: false, fullDate: new Date(year, month + 1, i) });
  return cells;
}

// Shift hours per day (fixed for demo)
const SHIFT_HOURS = { Mon: 8.25, Tue: 8.25, Wed: 8.25, Thu: 8.25, Fri: 8.25, Sat: 0, Sun: 0 };
const WEEKLY_TOTAL = Object.values(SHIFT_HOURS).reduce((a, b) => a + b, 0);

// ============================================================================
// EVENT MODAL (Add / Edit)
// ============================================================================
function EventModal({ event, onClose, onSave, onDelete, tokens }) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate]   = useState(event?.date || '');
  const [time, setTime]   = useState(event?.time || '');
  const [type, setType]   = useState(event?.type || 'meeting');
  const [error, setError] = useState('');

  useEffect(() => { const h = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

  const handleSubmit = () => {
    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (!date) { setError('Please select a date.'); return; }
    onSave({ title: title.trim(), date, time, type, id: event?.id || Date.now() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-[420px] rounded-[20px] border p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              {isEdit ? <Edit3 size={14} className="text-white" /> : <Plus size={15} className="text-white" />}
            </div>
            <p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>{isEdit ? 'Edit Event' : 'New Event'}</p>
          </div>
          <button onClick={onClose} style={{ color: tokens.textSecondary }} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Title *</label>
            <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }} placeholder="e.g. Team standup"
              className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1]"
              style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Date *</label>
              <input type="date" value={date} onChange={e => { setDate(e.target.value); setError(''); }}
                className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark]"
                style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Time (optional)</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark]"
                style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(scheduleEventTypeConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => setType(key)}
                  className={`rounded-[8px] border py-1.5 text-[11px] font-semibold transition-all ${type === key ? `${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}` : ''}`}
                  style={{ borderColor: type === key ? undefined : tokens.border, color: type === key ? undefined : tokens.textSecondary }}>{cfg.label}</button>
              ))}
            </div>
          </div>
          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            {isEdit && (
              <button onClick={() => { onDelete(event.id); onClose(); }}
                className="flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:text-[#f87171]" style={{ color: tokens.textMuted }}>
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
          <div className="flex gap-2.5">
            <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
            <button onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: isEdit ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: isEdit ? '0 4px 16px rgba(22,163,74,0.3)' : '0 4px 16px rgba(99,102,241,0.3)', border: 'none', cursor: 'pointer' }}>
              {isEdit ? <><Check size={14} /> Save</> : 'Add event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SHIFT TOOLTIP
// ============================================================================
function ShiftTooltip({ dayObj, tokens }) {
  if (!dayObj.active) return null;
  return (
    <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-30 min-w-[150px] -translate-x-1/2 rounded-[10px] border px-3.5 py-2.5 shadow-lg"
      style={{ background: tokens.bgCard, borderColor: tokens.border }}>
      <p className="mb-1 text-[12px] font-bold" style={{ color: tokens.textPrimary }}>{dayObj.day} · {dayObj.date} {MONTHS_SHORT[dayObj.month]}</p>
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px]" style={{ color: '#818cf8' }}>Morning: 8:00 – 14:15</p>
        <p className="text-[11px]" style={{ color: tokens.textMuted }}>Lunch: 14:15 – 15:30</p>
        <p className="text-[11px]" style={{ color: '#818cf8' }}>Afternoon: 15:30 – 18:30</p>
      </div>
      <p className="mt-1 text-[10px] font-semibold" style={{ color: '#34d399' }}>{SHIFT_HOURS[dayObj.day]}h total</p>
      <div className="absolute bottom-[-5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r" style={{ background: tokens.bgCard, borderColor: tokens.border }} />
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function SchedulePage({ onLogout, onNav }) {
  const tokens = useTokens();

  const [monday, setMonday]       = useState(() => getMondayOf(new Date()));
  const [viewMode, setViewMode]   = useState('week'); // 'week' | 'month'
  const [monthDate, setMonthDate] = useState(new Date());
  const [editEvent, setEditEvent] = useState(null); // null = closed, {} = new, {id,...} = edit
  const [hoveredShift, setHoveredShift] = useState(null);
  const [slideDir, setSlideDir]   = useState(null); // 'left' | 'right' | null
  const [slideKey, setSlideKey]   = useState(0);

  const [events, setEvents] = useState([
    { id: 1, title: 'Team Meeting', date: (() => { const d = new Date(); d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7 || 7)); return d.toISOString().split('T')[0]; })(), time: '10:00', type: 'meeting' },
    { id: 2, title: 'Holiday Request', date: (() => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); return d.toISOString().split('T')[0]; })(), time: '12:00', type: 'deadline' },
    { id: 3, title: 'Doctor Visit', date: new Date().toISOString().split('T')[0], time: '09:30', type: 'leave' },
  ]);

  const weekDays = getWeekDays(monday);
  const weekLabel = formatWeekLabel(weekDays);
  const monthGrid = useMemo(() => getMonthGrid(monthDate.getFullYear(), monthDate.getMonth()), [monthDate]);

  // Navigation with slide animation
  const navigateWeek = (dir) => {
    setSlideDir(dir > 0 ? 'left' : 'right');
    setSlideKey(k => k + 1);
    const d = new Date(monday); d.setDate(d.getDate() + dir * 7); setMonday(d);
  };
  const navigateMonth = (dir) => {
    setSlideDir(dir > 0 ? 'left' : 'right');
    setSlideKey(k => k + 1);
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  };
  const goToday = () => { setMonday(getMondayOf(new Date())); setMonthDate(new Date()); setSlideKey(k => k + 1); };

  const saveEvent = (ev) => {
    setEvents(prev => { const exists = prev.find(e => e.id === ev.id); return exists ? prev.map(e => e.id === ev.id ? ev : e) : [...prev, ev]; });
  };
  const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));

  const upcomingEvents = events.filter(ev => new Date(ev.date) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Events for a given date string
  const eventsForDate = (d) => events.filter(ev => new Date(ev.date).toDateString() === d.toDateString());

  return (
    <AppLayout role="employee" activePage="schedule" onNav={onNav} onLogout={onLogout}>
      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideFromLeft  { from { opacity:0; transform:translateX(-20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideFromRight { from { opacity:0; transform:translateX(20px) }  to { opacity:1; transform:translateX(0) } }
        .anim-card { animation: cardIn 0.4s ease both; }
        .slide-left  { animation: slideFromLeft 0.3s ease both; }
        .slide-right { animation: slideFromRight 0.3s ease both; }
      `}</style>

      <div className="p-8">
        <div className="mx-auto max-w-[1050px]">

          {/* Header */}
          <div className="anim-card mb-6 flex items-end justify-between" style={{ animationDelay: '0ms' }}>
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>My Schedule</h1>
              <p className="mt-1 text-[14px]" style={{ color: tokens.textSecondary }}>Manage your shifts and time off requests.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex rounded-[8px] border p-0.5" style={{ borderColor: tokens.border }}>
                <button onClick={() => setViewMode('week')} aria-label="Week view"
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] transition-all"
                  style={{ background: viewMode === 'week' ? tokens.accentLight : 'transparent', color: viewMode === 'week' ? '#818cf8' : tokens.textMuted }}>
                  <List size={14} />
                </button>
                <button onClick={() => setViewMode('month')} aria-label="Month view"
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] transition-all"
                  style={{ background: viewMode === 'month' ? tokens.accentLight : 'transparent', color: viewMode === 'month' ? '#818cf8' : tokens.textMuted }}>
                  <Grid3X3 size={14} />
                </button>
              </div>
              {/* Navigator */}
              <div className="flex items-center gap-0.5 rounded-[12px] border p-1" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <button onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-white/5" style={{ color: tokens.textSecondary }} aria-label="Previous"><ChevronLeft size={16} /></button>
                <span className="min-w-[160px] text-center text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>
                  {viewMode === 'week' ? weekLabel : `${MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`}
                </span>
                <button onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-white/5" style={{ color: tokens.textSecondary }} aria-label="Next"><ChevronRight size={16} /></button>
              </div>
              <button onClick={goToday} className="rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-all hover:border-[#818cf8] hover:text-[#818cf8]" style={{ borderColor: tokens.border, background: tokens.bgCard, color: tokens.textSecondary }}>Today</button>
              <button onClick={() => setEditEvent({})}
                className="flex items-center gap-2 rounded-[12px] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}>
                <Plus size={16} strokeWidth={2.5} /> Add Event
              </button>
            </div>
          </div>

          {/* Hours counter strip */}
          <div className="anim-card mb-6 flex items-center gap-4 rounded-[14px] border px-6 py-4" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '60ms' }}>
            <Clock size={18} style={{ color: '#818cf8' }} />
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[20px] font-bold tracking-[-0.02em] text-[#818cf8]">{WEEKLY_TOTAL}h</p>
                <p className="text-[10px] font-medium" style={{ color: tokens.textSecondary }}>Scheduled this week</p>
              </div>
              <div className="h-8 w-px" style={{ background: tokens.border }} />
              <div>
                <p className="text-[20px] font-bold tracking-[-0.02em] text-[#34d399]">5</p>
                <p className="text-[10px] font-medium" style={{ color: tokens.textSecondary }}>Working days</p>
              </div>
              <div className="h-8 w-px" style={{ background: tokens.border }} />
              <div>
                <p className="text-[20px] font-bold tracking-[-0.02em] text-[#f59e0b]">{upcomingEvents.length}</p>
                <p className="text-[10px] font-medium" style={{ color: tokens.textSecondary }}>Upcoming events</p>
              </div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="anim-card rounded-[24px] border p-7" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '120ms' }}>

            {/* ── WEEK VIEW ── */}
            {viewMode === 'week' && (
              <div key={slideKey} className={slideDir === 'left' ? 'slide-left' : slideDir === 'right' ? 'slide-right' : ''}>
                <div className="grid grid-cols-7 gap-5">
                  {weekDays.map((dayObj, index) => {
                    const dayEvents = eventsForDate(dayObj.fullDate);
                    const isHovered = hoveredShift === index;
                    return (
                      <div key={index} className="flex flex-col gap-3.5">
                        {/* Day header */}
                        <div className="flex flex-col items-center pb-2">
                          <span className={`text-[12px] font-medium uppercase tracking-[0.05em]`} style={{ color: dayObj.isToday ? '#818cf8' : tokens.textSecondary }}>{dayObj.day}</span>
                          <div className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold transition-all`}
                            style={{
                              background: dayObj.isToday ? '#818cf8' : 'transparent',
                              color: dayObj.isToday ? '#fff' : tokens.textPrimary,
                              boxShadow: dayObj.isToday ? '0 0 20px rgba(129,140,248,0.3), 0 0 40px rgba(129,140,248,0.1)' : 'none',
                            }}>
                            {dayObj.date}
                          </div>
                        </div>

                        {/* Shift blocks with tooltip */}
                        {dayObj.active ? (
                          <div className="relative flex flex-col gap-3"
                            onMouseEnter={() => setHoveredShift(index)} onMouseLeave={() => setHoveredShift(null)}>
                            {isHovered && <ShiftTooltip dayObj={dayObj} tokens={tokens} />}
                            {[
                              { start: '8:00 AM', end: '2:15 PM' },
                              { start: '2:30 PM', end: null, label: 'Lunch', dashed: true },
                              { start: '3:30 PM', end: '6:30 PM' },
                            ].map((block, bi) => (
                              block.dashed ? (
                                <div key={bi} className={`flex h-[90px] cursor-pointer flex-col items-center justify-center rounded-[14px] transition-all duration-200 ${isHovered ? 'bg-[#6366f1]/18' : 'bg-[#6366f1]/10'}`}
                                  style={{ border: '1px dashed rgba(99,102,241,0.3)' }}>
                                  <span className="text-[14px] font-bold text-[#818cf8]">{block.start}</span>
                                  <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#818cf8]/65">{block.label}</span>
                                </div>
                              ) : (
                                <div key={bi} className={`flex h-[90px] cursor-pointer flex-col items-center justify-center rounded-[14px] transition-all duration-300 ${isHovered ? '-translate-y-1 shadow-[0_8px_20px_rgba(99,102,241,0.35)]' : ''}`}
                                  style={{ background: isHovered ? 'linear-gradient(135deg,#7a5cf5,#8b5cf6)' : 'linear-gradient(135deg,#6366f1,#7a5cf5)' }}>
                                  <span className="text-[14px] font-bold tracking-wide text-white">{block.start}</span>
                                  <span className="mt-0.5 text-[12px] font-medium text-white/75">{block.end}</span>
                                </div>
                              )
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {[0,1,2].map(i => <div key={i} className="h-[90px] rounded-[14px] border opacity-45" style={{ background: tokens.bgInput, borderColor: tokens.border }} />)}
                          </div>
                        )}

                        {/* Event chips */}
                        {dayEvents.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {dayEvents.map(ev => {
                              const cfg = scheduleEventTypeConfig[ev.type];
                              return (
                                <button key={ev.id} onClick={() => setEditEvent(ev)}
                                  className={`flex items-center gap-1 rounded-[6px] border px-1.5 py-0.5 transition-all hover:opacity-80 ${cfg.bgClass} ${cfg.borderClass}`}>
                                  <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: cfg.color }} />
                                  <span className={`truncate text-[10px] font-semibold ${cfg.textClass}`}>{ev.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── MONTH VIEW ── */}
            {viewMode === 'month' && (
              <div key={slideKey} className={slideDir === 'left' ? 'slide-left' : slideDir === 'right' ? 'slide-right' : ''}>
                {/* Day headers */}
                <div className="mb-3 grid grid-cols-7 gap-2">
                  {DAYS_SHORT.map(d => (
                    <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>{d}</div>
                  ))}
                </div>
                {/* Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {monthGrid.map((cell, i) => {
                    const dayEvents = eventsForDate(cell.fullDate);
                    const isToday = cell.isToday && cell.current;
                    return (
                      <div key={i}
                        className={`min-h-[80px] rounded-[10px] border p-2 transition-all duration-150 ${cell.current ? 'cursor-pointer' : 'opacity-30'}`}
                        style={{
                          background: isToday ? 'rgba(99,102,241,0.06)' : 'transparent',
                          borderColor: isToday ? 'rgba(129,140,248,0.3)' : tokens.border,
                          boxShadow: isToday ? '0 0 16px rgba(129,140,248,0.1)' : 'none',
                        }}
                        onMouseEnter={(e) => { if (cell.current && !isToday) e.currentTarget.style.background = tokens.bgHover; }}
                        onMouseLeave={(e) => { if (cell.current && !isToday) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <p className={`mb-1 text-[12px] font-semibold ${isToday ? 'text-[#818cf8]' : ''}`}
                          style={{ color: isToday ? undefined : cell.current ? tokens.textPrimary : tokens.textMuted }}>
                          {cell.date}
                        </p>
                        {dayEvents.slice(0, 2).map(ev => {
                          const cfg = scheduleEventTypeConfig[ev.type];
                          return (
                            <button key={ev.id} onClick={() => setEditEvent(ev)}
                              className={`mb-0.5 flex w-full items-center gap-1 rounded-[4px] px-1 py-0.5 text-left transition-opacity hover:opacity-80 ${cfg.bgClass}`}>
                              <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: cfg.color }} />
                              <span className={`truncate text-[9px] font-semibold ${cfg.textClass}`}>{ev.title}</span>
                            </button>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <p className="text-[9px] font-medium" style={{ color: tokens.textMuted }}>+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="my-8 h-px w-full" style={{ background: tokens.border }} />

            {/* Upcoming Events */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[17px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>Upcoming Events</h2>
                <span className="text-[12px]" style={{ color: tokens.textMuted }}>{upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}</span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-2.5 rounded-[16px] border border-dashed py-8" style={{ borderColor: tokens.border }}>
                  <Calendar size={28} style={{ color: tokens.textMuted }} />
                  <p className="text-[13px]" style={{ color: tokens.textMuted }}>No upcoming events. Add one!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingEvents.map((ev) => {
                    const cfg = scheduleEventTypeConfig[ev.type];
                    const d = new Date(ev.date);
                    const dateLabel = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
                    const timeLabel = ev.time ? `${dateLabel} · ${ev.time}` : dateLabel;
                    return (
                      <div key={ev.id}
                        className="group relative flex items-center overflow-hidden rounded-[16px] border px-5 py-4 transition-all duration-150 cursor-pointer"
                        style={{ background: tokens.bgInput, borderColor: tokens.border }}
                        onClick={() => setEditEvent(ev)}
                        onMouseEnter={(e) => e.currentTarget.style.background = tokens.bgCard}
                        onMouseLeave={(e) => e.currentTarget.style.background = tokens.bgInput}>
                        <div className="absolute bottom-0 left-0 top-0 w-[4px] rounded-l-[16px]" style={{ background: `linear-gradient(180deg,${cfg.color},${cfg.color}88)` }} />
                        <div className="ml-3 mr-4 shrink-0">
                          <span className={`rounded-[6px] border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] ${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}`}>{cfg.label}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>{ev.title}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-[12px]" style={{ color: tokens.textSecondary }}>
                            <Clock size={12} className="text-[#818cf8]" />{timeLabel}
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}
                          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] transition-all hover:bg-[#f87171]/10 hover:text-[#f87171]"
                          style={{ color: tokens.textMuted }} aria-label={`Delete ${ev.title}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {editEvent !== null && (
        <EventModal
          event={editEvent.id ? editEvent : null}
          onClose={() => setEditEvent(null)}
          onSave={saveEvent}
          onDelete={deleteEvent}
          tokens={tokens}
        />
      )}
    </AppLayout>
  );
}