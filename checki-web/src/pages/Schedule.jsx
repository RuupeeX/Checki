import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, X, Trash2, Calendar,
  List, Grid3X3, MapPin, Coffee, Briefcase, Edit3,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/AppLayout';
import { scheduleEventTypeConfig } from '../data/mockData.js';
import { events as eventsApi, attendance as attendanceApi } from '../services/api';

// ============================================================================
// UTILIDADES
// ============================================================================
function getWeekDays(baseMonday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    const today = new Date();
    return {
      day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
      dayFull: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i],
      date: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      fullDate: new Date(d),
      active: i < 5,
      isToday: d.toDateString() === today.toDateString(),
      isPast: d < new Date(today.toDateString()),
    };
  });
}

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(d) { return d.toISOString().split('T')[0]; }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatWeekLabel(days) {
  const f = days[0], l = days[6];
  if (f.month === l.month) return `${f.date} – ${l.date} ${MONTHS[f.month]} ${f.year}`;
  return `${f.date} ${MONTHS[f.month]} – ${l.date} ${MONTHS[l.month]} ${l.year}`;
}

function formatShiftTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  const hr = parseInt(h);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  return `${hr % 12 || 12}:${m} ${ampm}`;
}

// ============================================================================
// ADD EVENT MODAL
// ============================================================================
function AddEventModal({ onClose, onAdd, tokens }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('meeting');
  const [error, setError] = useState('');

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (!date) { setError('Please select a date.'); return; }
    try { await onAdd({ title: title.trim(), date, time: time || undefined, type }); onClose(); }
    catch (err) { setError(err.data?.error || 'Error creating event.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[420px] rounded-[20px] border p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)] sm:p-7" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"><Plus size={15} className="text-white" /></div>
            <p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>New Event</p>
          </div>
          <button onClick={onClose} style={{ color: tokens.textSecondary }} className="transition-colors hover:text-[#e2e8f0]"><X size={18} /></button>
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
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Time</label>
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
                  className={`rounded-[8px] border py-2 text-[11px] font-semibold transition-all ${type === key ? `${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}` : 'hover:bg-white/5'}`}
                  style={{ borderColor: type === key ? undefined : tokens.border, color: type === key ? undefined : tokens.textSecondary }}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          <button onClick={handleSubmit} className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}>Add event</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function SchedulePage({ onLogout, onNav }) {
  const tokens = useTokens();
  const { user } = useAuth();
  const [monday, setMonday] = useState(() => getMondayOf(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const weekDays = getWeekDays(monday);
  const weekLabel = formatWeekLabel(weekDays);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);

  // User shift times
  const shiftStart = formatShiftTime(user?.shift_start);
  const shiftEnd = formatShiftTime(user?.shift_end);
  // Calculate lunch break (roughly middle of shift)
  const shiftStartHr = user?.shift_start ? parseInt(user.shift_start.split(':')[0]) : 8;
  const lunchStart = `${shiftStartHr + 4}:30`;
  const lunchEnd = `${shiftStartHr + 5}:30`;

  // Fetch events + attendance from API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [evData, attData] = await Promise.all([
        eventsApi.getAll({ from: toISODate(monday), to: toISODate(sunday) }),
        attendanceApi.getHistory({ from: toISODate(monday), to: toISODate(sunday) }),
      ]);
      setEvents(Array.isArray(evData) ? evData : []);
      setAttendanceHistory(Array.isArray(attData) ? attData : []);
    } catch { setEvents([]); setAttendanceHistory([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [monday]);

  const prevWeek = () => { const d = new Date(monday); d.setDate(d.getDate() - 7); setMonday(d); };
  const nextWeek = () => { const d = new Date(monday); d.setDate(d.getDate() + 7); setMonday(d); };
  const goToday = () => setMonday(getMondayOf(new Date()));

  const addEvent = async (ev) => { await eventsApi.create(ev); fetchEvents(); };
  const deleteEvent = async (id) => { await eventsApi.remove(id); fetchEvents(); };

  const upcomingEvents = events.filter(ev => new Date(ev.date) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Get attendance record for a specific day
  const getAttForDay = (fullDate) => attendanceHistory.find(a => new Date(a.date).toDateString() === fullDate.toDateString());

  // Stats for the week
  const totalWorkedMinutes = attendanceHistory.reduce((sum, a) => sum + (a.worked_minutes || 0), 0);
  const daysWorked = attendanceHistory.filter(a => a.check_in).length;
  const avgHours = daysWorked > 0 ? (totalWorkedMinutes / daysWorked / 60).toFixed(1) : '0';

  return (
    <AppLayout role="employee" activePage="schedule" onNav={onNav} onLogout={onLogout}>
      <style>{`
        @keyframes scheduleIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .sched-anim { animation: scheduleIn 0.35s ease both; }
        .sched-anim-1 { animation-delay: 50ms; }
        .sched-anim-2 { animation-delay: 100ms; }
        .sched-anim-3 { animation-delay: 150ms; }
      `}</style>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1100px]">

          {/* Header */}
          <div className="sched-anim mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]" style={{ color: tokens.textPrimary }}>My Schedule</h1>
              <p className="mt-1 text-[13px] sm:text-[14px]" style={{ color: tokens.textSecondary }}>
                Your shifts, events, and time overview.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* View toggle */}
              <div className="flex rounded-[8px] border p-0.5" style={{ borderColor: tokens.border }}>
                <button onClick={() => setViewMode('grid')} className="flex h-8 w-8 items-center justify-center rounded-[6px] transition-all"
                  style={{ background: viewMode === 'grid' ? tokens.accentLight : 'transparent', color: viewMode === 'grid' ? '#818cf8' : tokens.textMuted }}><Grid3X3 size={14} /></button>
                <button onClick={() => setViewMode('list')} className="flex h-8 w-8 items-center justify-center rounded-[6px] transition-all"
                  style={{ background: viewMode === 'list' ? tokens.accentLight : 'transparent', color: viewMode === 'list' ? '#818cf8' : tokens.textMuted }}><List size={14} /></button>
              </div>
              {/* Week navigator */}
              <div className="flex items-center gap-0.5 rounded-[12px] border p-1" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <button onClick={prevWeek} className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-white/5" style={{ color: tokens.textSecondary }}><ChevronLeft size={16} /></button>
                <span className="min-w-[140px] text-center text-[12px] font-semibold sm:min-w-[170px] sm:text-[13px]" style={{ color: tokens.textPrimary }}>{weekLabel}</span>
                <button onClick={nextWeek} className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-white/5" style={{ color: tokens.textSecondary }}><ChevronRight size={16} /></button>
              </div>
              <button onClick={goToday} className="rounded-[10px] border px-3 py-2 text-[12px] font-medium transition-all hover:border-[#818cf8] hover:text-[#818cf8] sm:text-[13px]"
                style={{ borderColor: tokens.border, background: tokens.bgCard, color: tokens.textSecondary }}>Today</button>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-[12px] px-4 py-2 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[13px]"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}><Plus size={16} /> Add Event</button>
            </div>
          </div>

          {/* Week Stats Strip */}
          <div className="sched-anim sched-anim-1 mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Shift', value: `${shiftStart} – ${shiftEnd}`, icon: Briefcase, color: '#818cf8' },
              { label: 'Days Worked', value: `${daysWorked} / 5`, icon: Calendar, color: '#34d399' },
              { label: 'Hours This Week', value: `${(totalWorkedMinutes / 60).toFixed(1)}h`, icon: Clock, color: '#f59e0b' },
              { label: 'Avg / Day', value: `${avgHours}h`, icon: Coffee, color: '#22d3ee' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-[14px] border px-4 py-3 transition-colors hover:border-[#6366f1]/20" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `${color}12` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold leading-none" style={{ color }}>{value}</p>
                  <p className="mt-1 text-[10px] font-medium" style={{ color: tokens.textSecondary }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Card */}
          <div className="sched-anim sched-anim-2 rounded-[16px] border p-4 sm:rounded-[24px] sm:p-7" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
            {loading ? (
              <div className="flex items-center justify-center py-20"><div className="h-7 w-7 animate-spin rounded-full border-2 border-[#6366f1]/30 border-t-[#6366f1]" /></div>
            ) : viewMode === 'grid' ? (
              /* ════════ GRID VIEW ════════ */
              <div className="overflow-x-auto pb-2">
                <div className="grid min-w-[650px] grid-cols-7 gap-2 sm:gap-4">
                  {weekDays.map((dayObj, index) => {
                    const att = getAttForDay(dayObj.fullDate);
                    const dayEvents = events.filter(ev => new Date(ev.date).toDateString() === dayObj.fullDate.toDateString());
                    const hasCheckedIn = !!att?.check_in;
                    const workedH = att?.worked_minutes ? `${Math.floor(att.worked_minutes / 60)}h ${att.worked_minutes % 60}m` : null;

                    return (
                      <div key={index} className="flex flex-col gap-2" style={{ animationDelay: `${index * 30}ms` }}>
                        {/* Day Header */}
                        <div className="flex flex-col items-center py-2.5">
                          <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] sm:text-[11px] ${dayObj.isToday ? 'text-[#818cf8]' : ''}`}
                            style={{ color: dayObj.isToday ? undefined : tokens.textMuted }}>{dayObj.day}</span>
                          <div className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[16px] font-bold sm:h-10 sm:w-10 sm:text-[18px] ${dayObj.isToday ? 'bg-[#6366f1] text-white shadow-[0_2px_10px_rgba(99,102,241,0.4)]' : ''}`}
                            style={{ color: dayObj.isToday ? undefined : tokens.textPrimary }}>
                            {dayObj.date}
                          </div>
                        </div>

                        {/* Shift blocks */}
                        {dayObj.active ? (
                          <div className="flex flex-col gap-1.5 sm:gap-2">
                            {/* Morning shift */}
                            <div className={`relative flex flex-col items-center justify-center rounded-[10px] py-4 transition-all sm:rounded-[12px] sm:py-5 ${dayObj.isPast && hasCheckedIn ? 'opacity-100' : dayObj.isPast ? 'opacity-40' : ''}`}
                              style={{
                                background: hasCheckedIn || !dayObj.isPast
                                  ? `linear-gradient(135deg,${dayObj.isToday ? '#6366f1' : '#4f46e5'},${dayObj.isToday ? '#8b5cf6' : '#6366f1'})`
                                  : tokens.bgInput,
                                border: `1px solid ${hasCheckedIn || !dayObj.isPast ? 'transparent' : tokens.border}`,
                              }}>
                              <span className="text-[11px] font-bold text-white sm:text-[13px]">{shiftStart}</span>
                              <span className="mt-0.5 text-[9px] text-white/60 sm:text-[10px]">
                                {formatShiftTime(lunchStart)}
                              </span>
                              {hasCheckedIn && (
                                <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#34d399]">
                                  <span className="text-[8px] text-white">✓</span>
                                </div>
                              )}
                            </div>

                            {/* Lunch */}
                            <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed py-3 sm:rounded-[12px] sm:py-4"
                              style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
                              <Coffee size={12} style={{ color: '#818cf8', opacity: 0.5 }} />
                              <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.05em] sm:text-[9px]" style={{ color: tokens.textMuted }}>Lunch</span>
                            </div>

                            {/* Afternoon shift */}
                            <div className={`flex flex-col items-center justify-center rounded-[10px] py-4 sm:rounded-[12px] sm:py-5 ${dayObj.isPast && !hasCheckedIn ? 'opacity-40' : ''}`}
                              style={{
                                background: hasCheckedIn || !dayObj.isPast
                                  ? `linear-gradient(135deg,${dayObj.isToday ? '#6366f1' : '#4f46e5'},${dayObj.isToday ? '#8b5cf6' : '#6366f1'})`
                                  : tokens.bgInput,
                                border: `1px solid ${hasCheckedIn || !dayObj.isPast ? 'transparent' : tokens.border}`,
                              }}>
                              <span className="text-[11px] font-bold text-white sm:text-[13px]">
                                {formatShiftTime(lunchEnd)}
                              </span>
                              <span className="mt-0.5 text-[9px] text-white/60 sm:text-[10px]">{shiftEnd}</span>
                            </div>

                            {/* Worked time badge */}
                            {workedH && (
                              <div className="flex items-center justify-center gap-1 rounded-[8px] py-1.5" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                                <Clock size={10} style={{ color: '#34d399' }} />
                                <span className="text-[9px] font-bold text-[#34d399] sm:text-[10px]">{workedH}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Weekend — fills full column */
                          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed sm:rounded-[12px]"
                            style={{ borderColor: tokens.border, minHeight: 220 }}>
                            <Coffee size={14} style={{ color: tokens.textMuted, opacity: 0.4 }} />
                            <span className="text-[10px] font-medium" style={{ color: tokens.textMuted, opacity: 0.5 }}>Day off</span>
                          </div>
                        )}

                        {/* Events for this day */}
                        {dayEvents.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {dayEvents.map(ev => {
                              const cfg = scheduleEventTypeConfig[ev.type] || scheduleEventTypeConfig.other;
                              return (
                                <div key={ev.id} className={`group flex items-center gap-1 rounded-[6px] border px-1.5 py-1 transition-all hover:shadow-sm ${cfg.bgClass} ${cfg.borderClass}`}>
                                  <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: cfg.color }} />
                                  <span className={`flex-1 truncate text-[9px] font-semibold sm:text-[10px] ${cfg.textClass}`}>{ev.title}</span>
                                  <button onClick={() => deleteEvent(ev.id)} className="hidden shrink-0 text-[#f87171] opacity-60 group-hover:block hover:opacity-100"><Trash2 size={10} /></button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ════════ LIST VIEW ════════ */
              <div className="flex flex-col gap-2">
                {weekDays.filter(d => d.active).map((dayObj, index) => {
                  const att = getAttForDay(dayObj.fullDate);
                  const dayEvents = events.filter(ev => new Date(ev.date).toDateString() === dayObj.fullDate.toDateString());
                  const checkInStr = att?.check_in ? new Date(att.check_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
                  const checkOutStr = att?.check_out ? new Date(att.check_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
                  const workedH = att?.worked_minutes ? `${Math.floor(att.worked_minutes / 60)}h ${att.worked_minutes % 60}m` : '—';
                  const statusMap = { on_time: { color: '#34d399', label: 'On Time' }, late: { color: '#f59e0b', label: 'Late' } };
                  const st = statusMap[att?.status] || { color: tokens.textMuted, label: dayObj.isPast ? 'Absent' : 'Scheduled' };

                  return (
                    <div key={index}
                      className={`flex items-center gap-4 rounded-[14px] border px-5 py-4 transition-all ${dayObj.isToday ? 'border-[#6366f1]/30 shadow-[0_0_20px_rgba(99,102,241,0.06)]' : ''}`}
                      style={{ background: dayObj.isToday ? 'rgba(99,102,241,0.04)' : tokens.bgInput, borderColor: dayObj.isToday ? undefined : tokens.border }}
                      onMouseEnter={e => { if (!dayObj.isToday) e.currentTarget.style.background = tokens.bgCard; }}
                      onMouseLeave={e => { if (!dayObj.isToday) e.currentTarget.style.background = tokens.bgInput; }}>
                      {/* Day */}
                      <div className="flex w-[60px] shrink-0 flex-col items-center">
                        <span className="text-[10px] font-semibold uppercase" style={{ color: dayObj.isToday ? '#818cf8' : tokens.textMuted }}>{dayObj.day}</span>
                        <span className={`text-[22px] font-bold ${dayObj.isToday ? 'text-[#818cf8]' : ''}`} style={{ color: dayObj.isToday ? undefined : tokens.textPrimary }}>{dayObj.date}</span>
                      </div>
                      {/* Divider */}
                      <div className="h-10 w-px shrink-0" style={{ background: tokens.border }} />
                      {/* Shift info */}
                      <div className="flex flex-1 items-center gap-6">
                        <div>
                          <p className="text-[10px] font-medium uppercase" style={{ color: tokens.textMuted }}>Shift</p>
                          <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{shiftStart} – {shiftEnd}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase" style={{ color: tokens.textMuted }}>Check In</p>
                          <p className="text-[13px] font-semibold" style={{ color: att?.check_in ? '#34d399' : tokens.textMuted }}>{checkInStr}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase" style={{ color: tokens.textMuted }}>Check Out</p>
                          <p className="text-[13px] font-semibold" style={{ color: att?.check_out ? '#f87171' : tokens.textMuted }}>{checkOutStr}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase" style={{ color: tokens.textMuted }}>Worked</p>
                          <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{workedH}</p>
                        </div>
                      </div>
                      {/* Status + events */}
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="rounded-full border px-2.5 py-[2px] text-[10px] font-bold" style={{ color: st.color, borderColor: `${st.color}30`, background: `${st.color}10` }}>{st.label}</span>
                        {dayEvents.map(ev => {
                          const cfg = scheduleEventTypeConfig[ev.type] || scheduleEventTypeConfig.other;
                          return (
                            <span key={ev.id} className={`rounded-[4px] border px-1.5 py-0.5 text-[9px] font-semibold ${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}`}>{ev.title}</span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Divider */}
            <div className="my-6 h-px w-full sm:my-8" style={{ background: tokens.border }} />

            {/* Upcoming Events */}
            <div>
              <div className="mb-4 flex items-center justify-between sm:mb-5">
                <div className="flex items-center gap-2">
                  <Calendar size={15} style={{ color: '#818cf8' }} />
                  <h2 className="text-[15px] font-semibold sm:text-[17px]" style={{ color: tokens.textPrimary }}>Upcoming Events</h2>
                </div>
                <span className="rounded-[6px] px-2 py-0.5 text-[11px] font-semibold sm:text-[12px]" style={{ color: '#818cf8', background: 'rgba(99,102,241,0.08)' }}>
                  {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}
                </span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed py-10" style={{ borderColor: tokens.border }}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(99,102,241,0.08)' }}>
                    <Calendar size={22} style={{ color: tokens.textMuted }} />
                  </div>
                  <p className="text-[13px] font-medium" style={{ color: tokens.textMuted }}>No upcoming events</p>
                  <button onClick={() => setShowModal(true)} className="text-[12px] font-semibold text-[#818cf8] transition-colors hover:text-[#a5b4fc]">+ Add one</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {upcomingEvents.map((ev) => {
                    const cfg = scheduleEventTypeConfig[ev.type] || scheduleEventTypeConfig.other;
                    const d = new Date(ev.date);
                    const dateLabel = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
                    const timeLabel = ev.time ? `${dateLabel} · ${ev.time.slice(0, 5)}` : dateLabel;
                    const isThisWeek = d >= monday && d <= sunday;

                    return (
                      <div key={ev.id}
                        className="group relative flex items-center overflow-hidden rounded-[14px] border px-5 py-4 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                        style={{ background: tokens.bgInput, borderColor: tokens.border }}
                        onMouseEnter={(e) => e.currentTarget.style.background = tokens.bgCard}
                        onMouseLeave={(e) => e.currentTarget.style.background = tokens.bgInput}>
                        {/* Accent bar */}
                        <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-[14px]" style={{ background: cfg.color }} />
                        {/* Type badge */}
                        <div className="ml-2 mr-4 shrink-0">
                          <span className={`rounded-[6px] border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.04em] sm:text-[10px] ${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}`}>{cfg.label}</span>
                        </div>
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>{ev.title}</p>
                          <div className="mt-1 flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[11px] sm:text-[12px]" style={{ color: tokens.textSecondary }}>
                              <Clock size={12} style={{ color: cfg.color }} />{timeLabel}
                            </div>
                            {isThisWeek && (
                              <span className="rounded-[4px] bg-[#6366f1]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#818cf8]">This week</span>
                            )}
                          </div>
                        </div>
                        {/* Delete */}
                        <button onClick={() => deleteEvent(ev.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#f87171]/10"
                          style={{ color: tokens.textMuted }}>
                          <Trash2 size={14} className="transition-colors hover:text-[#f87171]" />
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

      {showModal && <AddEventModal onClose={() => setShowModal(false)} onAdd={addEvent} tokens={tokens} />}
    </AppLayout>
  );
}