import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, X, Trash2, Calendar,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import AppLayout from '../components/AppLayout';
import { scheduleEventTypeConfig } from '../data/mockData.js';

// ============================================================================
// UTILIDADES
// ============================================================================
function getWeekDays(baseMonday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    const today = new Date();
    return {
      day:      ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
      date:     d.getDate().toString(),
      month:    d.getMonth(),
      year:     d.getFullYear(),
      fullDate: new Date(d),
      active:   i < 5,
      isToday:  d.toDateString() === today.toDateString(),
    };
  });
}

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(days) {
  const first = days[0]; const last = days[6];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (first.month === last.month) return `${first.date} – ${last.date} ${months[first.month]}`;
  return `${first.date} ${months[first.month]} – ${last.date} ${months[last.month]}`;
}

// ============================================================================
// MODAL DE NUEVO EVENTO
// ============================================================================
function AddEventModal({ onClose, onAdd, tokens }) {
  const [title, setTitle] = useState('');
  const [date,  setDate]  = useState('');
  const [time,  setTime]  = useState('');
  const [type,  setType]  = useState('meeting');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (!date)         { setError('Please select a date.'); return; }
    onAdd({ title: title.trim(), date, time, type, id: Date.now() });
    onClose();
  };

  // Cerrar con Escape
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="New Event">
      <div className="w-full max-w-[420px] rounded-[20px] border p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)] sm:p-7" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              <Plus size={15} className="text-white" />
            </div>
            <p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>New Event</p>
          </div>
          <button onClick={onClose} style={{ color: tokens.textSecondary }} className="transition-colors hover:text-[#e2e8f0]" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Title *</label>
            <input
              value={title} onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="e.g. Team standup"
              className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1]"
              style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Date *</label>
              <input type="date" value={date} onChange={e => { setDate(e.target.value); setError(''); }}
                className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark]"
                style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Time (optional)</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark]"
                style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(scheduleEventTypeConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => setType(key)}
                  className={`rounded-[8px] border py-1.5 text-[11px] font-semibold transition-all
                    ${type === key ? `${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}` : ''}`}
                  style={{ borderColor: type === key ? undefined : tokens.border, color: type === key ? undefined : tokens.textSecondary }}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          <button onClick={handleSubmit}
            className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', border: 'none', cursor: 'pointer' }}
          >Add event</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL — Responsive
// ============================================================================
export default function SchedulePage({ onLogout, onNav }) {
  const tokens = useTokens();

  const [monday,    setMonday]    = useState(() => getMondayOf(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [events,    setEvents]    = useState([
    { id: 1, title: 'Team Meeting',           date: (() => { const d = new Date(); d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7 || 7)); return d.toISOString().split('T')[0]; })(), time: '10:00', type: 'meeting'  },
    { id: 2, title: 'Summer Holiday Request', date: (() => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); return d.toISOString().split('T')[0]; })(), time: '12:00', type: 'deadline' },
  ]);

  const weekDays  = getWeekDays(monday);
  const weekLabel = formatWeekLabel(weekDays);

  const prevWeek = () => { const d = new Date(monday); d.setDate(d.getDate() - 7); setMonday(d); };
  const nextWeek = () => { const d = new Date(monday); d.setDate(d.getDate() + 7); setMonday(d); };
  const goToday  = () => setMonday(getMondayOf(new Date()));

  const addEvent    = (ev) => setEvents(prev => [...prev, ev]);
  const deleteEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));

  const upcomingEvents = events
    .filter(ev => new Date(ev.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <AppLayout role="employee" activePage="schedule" onNav={onNav} onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1050px]">

          {/* Header — responsive */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]" style={{ color: tokens.textPrimary }}>My Schedule</h1>
              <p className="mt-1 text-[13px] sm:text-[14px]" style={{ color: tokens.textSecondary }}>Manage your shifts and time off requests.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-0.5 rounded-[12px] border p-1" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <button onClick={prevWeek} className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-white/5" style={{ color: tokens.textSecondary }} aria-label="Previous week"><ChevronLeft size={16} /></button>
                <span className="min-w-[120px] text-center text-[12px] font-semibold sm:min-w-[140px] sm:text-[13px]" style={{ color: tokens.textPrimary }}>{weekLabel}</span>
                <button onClick={nextWeek} className="flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors hover:bg-white/5" style={{ color: tokens.textSecondary }} aria-label="Next week"><ChevronRight size={16} /></button>
              </div>
              <button onClick={goToday} className="rounded-[10px] border px-3 py-2 text-[12px] font-medium transition-all hover:border-[#818cf8] hover:text-[#818cf8] sm:px-3.5 sm:text-[13px]" style={{ borderColor: tokens.border, background: tokens.bgCard, color: tokens.textSecondary }}>Today</button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-[12px] px-4 py-2 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[13px]"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}>
                <Plus size={16} strokeWidth={2.5} /> Add Event
              </button>
            </div>
          </div>

          {/* Calendar Card — responsive: horizontal scroll on small screens */}
          <div className="rounded-[16px] border p-4 sm:rounded-[24px] sm:p-7" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[600px] grid-cols-7 gap-3 sm:gap-5">
                {weekDays.map((dayObj, index) => (
                  <div key={index} className="flex flex-col gap-3 sm:gap-3.5">
                    <div className="flex flex-col items-center pb-2">
                      <span className={`text-[11px] font-medium uppercase tracking-[0.05em] sm:text-[12px] ${dayObj.isToday ? 'text-[#818cf8]' : ''}`} style={{ color: dayObj.isToday ? undefined : tokens.textSecondary }}>
                        {dayObj.day}
                      </span>
                      <div className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold transition-colors sm:h-8 sm:w-8 sm:text-[14px]
                        ${dayObj.isToday ? 'bg-[#818cf8] text-white' : ''}`}
                        style={{ color: dayObj.isToday ? undefined : tokens.textPrimary }}>
                        {dayObj.date}
                      </div>
                    </div>

                    {dayObj.active ? (
                      <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="flex h-[70px] cursor-pointer flex-col items-center justify-center rounded-[12px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(99,102,241,0.35)] sm:h-[90px] sm:rounded-[14px]" style={{ background: 'linear-gradient(135deg,#6366f1,#7a5cf5)' }}>
                          <span className="text-[12px] font-bold tracking-wide text-white sm:text-[14px]">8:00 AM</span>
                          <span className="mt-0.5 text-[10px] font-medium text-white/75 sm:text-[12px]">2:15 PM</span>
                        </div>
                        <div className="flex h-[70px] cursor-pointer flex-col items-center justify-center rounded-[12px] bg-[#6366f1]/10 transition-colors hover:bg-[#6366f1]/18 sm:h-[90px] sm:rounded-[14px]" style={{ border: '1px dashed rgba(99,102,241,0.3)' }}>
                          <span className="text-[12px] font-bold text-[#818cf8] sm:text-[14px]">2:30 PM</span>
                          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.05em] text-[#818cf8]/65 sm:text-[11px]">Lunch</span>
                        </div>
                        <div className="flex h-[70px] cursor-pointer flex-col items-center justify-center rounded-[12px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(99,102,241,0.35)] sm:h-[90px] sm:rounded-[14px]" style={{ background: 'linear-gradient(135deg,#6366f1,#7a5cf5)' }}>
                          <span className="text-[12px] font-bold tracking-wide text-white sm:text-[14px]">3:30 PM</span>
                          <span className="mt-0.5 text-[10px] font-medium text-white/75 sm:text-[12px]">6:30 PM</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:gap-3">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="h-[70px] rounded-[12px] border opacity-45 sm:h-[90px] sm:rounded-[14px]" style={{ background: tokens.bgInput, borderColor: tokens.border }} />
                        ))}
                      </div>
                    )}

                    {(() => {
                      const dayEvents = events.filter(ev => new Date(ev.date).toDateString() === dayObj.fullDate.toDateString());
                      if (!dayEvents.length) return null;
                      return (
                        <div className="flex flex-col gap-1">
                          {dayEvents.map(ev => {
                            const cfg = scheduleEventTypeConfig[ev.type];
                            return (
                              <div key={ev.id} className={`flex items-center gap-1 rounded-[6px] border px-1.5 py-0.5 ${cfg.bgClass} ${cfg.borderClass}`}>
                                <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: cfg.color }} />
                                <span className={`truncate text-[9px] font-semibold sm:text-[10px] ${cfg.textClass}`}>{ev.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>

            <div className="my-6 h-px w-full sm:my-8" style={{ background: tokens.border }} />

            {/* Upcoming Events */}
            <div>
              <div className="mb-4 flex items-center justify-between sm:mb-5">
                <h2 className="text-[15px] font-semibold tracking-[-0.01em] sm:text-[17px]" style={{ color: tokens.textPrimary }}>Upcoming Events</h2>
                <span className="text-[11px] sm:text-[12px]" style={{ color: tokens.textMuted }}>{upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}</span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center gap-2.5 rounded-[16px] border border-dashed py-8" style={{ borderColor: tokens.border }}>
                  <Calendar size={28} style={{ color: tokens.textMuted }} />
                  <p className="text-[13px]" style={{ color: tokens.textMuted }}>No upcoming events. Add one!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingEvents.map((ev) => {
                    const cfg       = scheduleEventTypeConfig[ev.type];
                    const d         = new Date(ev.date);
                    const dateLabel = `${d.getDate()} ${months[d.getMonth()]}`;
                    const timeLabel = ev.time ? `${dateLabel} · ${ev.time}` : dateLabel;
                    return (
                      <div key={ev.id} className="group relative flex items-center overflow-hidden rounded-[12px] border px-4 py-3 transition-colors sm:rounded-[16px] sm:px-5 sm:py-4" style={{ background: tokens.bgInput, borderColor: tokens.border }}
                        onMouseEnter={(e) => e.currentTarget.style.background = tokens.bgCard}
                        onMouseLeave={(e) => e.currentTarget.style.background = tokens.bgInput}>
                        <div className="absolute bottom-0 left-0 top-0 w-[4px] rounded-l-[12px] sm:rounded-l-[16px]" style={{ background: `linear-gradient(180deg,${cfg.color},${cfg.color}88)` }} />
                        <div className="ml-3 mr-3 shrink-0 sm:mr-4">
                          <span className={`rounded-[6px] border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em] sm:text-[10px] ${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}`}>{cfg.label}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold sm:text-[14px]" style={{ color: tokens.textPrimary }}>{ev.title}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-[12px]" style={{ color: tokens.textSecondary }}>
                            <Clock size={12} className="text-[#818cf8]" />
                            {timeLabel}
                          </div>
                        </div>
                        <button onClick={() => deleteEvent(ev.id)}
                          className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] transition-all hover:bg-[#f87171]/10 hover:text-[#f87171] sm:h-[30px] sm:w-[30px]"
                          style={{ color: tokens.textMuted }}
                          aria-label={`Delete event: ${ev.title}`}>
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

      {showModal && <AddEventModal onClose={() => setShowModal(false)} onAdd={addEvent} tokens={tokens} />}
    </AppLayout>
  );
}