import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, TrendingUp, CheckCircle2, Bell, CheckCircle,
  Coffee, Square, Play, LogIn, LogOut as LogOutIcon,
  X, Calendar, Umbrella,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import { useData } from '../contexts/DataContext';
import AppLayout from '../components/AppLayout';
import NotificationsDropdown from '../components/NotificationsDropdown';
import useCountUp from '../hooks/useCountUp';
import {
  weekData, avatarGradientsCSS, getInitials, userProfiles,
} from '../data/mockData';
import { CURRENT_EMPLOYEE, reportStatusStyles } from '../data/reportsData';

// ============================================================================
// UTILIDADES
// ============================================================================
const totalHours = weekData.reduce((a, b) => a + b.hours, 0);
const chartScale = 12;

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function formatTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// Calcular semana ISO actual
function getCurrentWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 604800000;
  return Math.ceil((diff / oneWeek) + start.getDay() / 7);
}

// ============================================================================
// REQUEST TIME OFF — Mini modal
// ============================================================================
function RequestTimeOffModal({ onClose, tokens }) {
  const { addReport, addEmployeeNotification } = useData();
  const [type, setType]  = useState('Vacation');
  const [date, setDate]  = useState('');
  const [desc, setDesc]  = useState('');
  const [sent, setSent]  = useState(false);

  const handleSubmit = () => {
    if (!date) return;
    const d = new Date(date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const pad = (n) => n.toString().padStart(2, '0');
    const dateStr = `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const nextId = `REQ-${String(Math.floor(Math.random() * 900) + 100)}`;

    addReport({
      id: nextId, date: dateStr, dateRaw: d, type, desc: desc.trim() || `${type} request`,
      status: 'Pending', icon: Umbrella, employee: CURRENT_EMPLOYEE, dept: 'IT',
    });

    addEmployeeNotification({
      id: Date.now(), title: `${type} request submitted`, desc: `Your ${type.toLowerCase()} request for ${dateStr} is pending.`,
      time: 'Just now', read: false, type: 'info',
    });

    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[400px] rounded-[20px] border p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#34d399]/15">
              <CheckCircle2 size={28} className="text-[#34d399]" />
            </div>
            <p className="text-[15px] font-semibold" style={{ color: tokens.textPrimary }}>Request submitted!</p>
            <p className="text-[12px]" style={{ color: tokens.textSecondary }}>Your manager will review it shortly.</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
                  <Calendar size={14} className="text-white" />
                </div>
                <p className="text-[15px] font-semibold" style={{ color: tokens.textPrimary }}>Request Time Off</p>
              </div>
              <button onClick={onClose} style={{ color: tokens.textSecondary }} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="mb-2 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Vacation', 'Medical', 'Personal'].map(t => (
                    <button key={t} onClick={() => setType(t)}
                      className={`rounded-[8px] border py-2 text-[11px] font-semibold transition-all ${type === t ? 'border-[#6366f1]/40 bg-[#6366f1]/15 text-[#818cf8]' : ''}`}
                      style={{ borderColor: type === t ? undefined : tokens.border, color: type === t ? undefined : tokens.textSecondary }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Date *</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark]"
                  style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Note (optional)</label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Family event"
                  className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1]"
                  style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!date}
                className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', border: 'none', cursor: date ? 'pointer' : 'not-allowed' }}>
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CHART TOOLTIP
// ============================================================================
function ChartTooltip({ item, tokens }) {
  const diff = item.hours - item.target;
  const overUnder = diff >= 0 ? `+${diff.toFixed(1)}h over` : `${diff.toFixed(1)}h under`;
  const isOver = diff >= 0;
  return (
    <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 min-w-[130px] -translate-x-1/2 rounded-[10px] border px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
      style={{ background: tokens.bgCard, borderColor: tokens.border }}>
      <p className="mb-1 text-[13px] font-bold text-[#818cf8]">{item.hours}h worked</p>
      {item.target > 0 && (
        <>
          <p className="mb-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>Target: {item.target}h</p>
          <p className={`text-[11px] font-semibold ${isOver ? 'text-[#34d399]' : 'text-[#f87171]'}`}>{overUnder}</p>
        </>
      )}
      <div className="absolute bottom-[-5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r" style={{ background: tokens.bgCard, borderColor: tokens.border }} />
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function EmployeeDashboard({ onLogout, onNav }) {
  const tokens = useTokens();
  const { myPendingReports, employeeNotifs, employeeUnreadCount } = useData();

  const [time, setTime]               = useState(new Date());
  const [workStatus, setWorkStatus]   = useState('idle');
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [history, setHistory]         = useState([]);
  const [hoveredBar, setHoveredBar]   = useState(null);
  const [chartMode, setChartMode]     = useState('week');
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const workRef  = useRef(null);
  const breakRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (workStatus === 'active') { workRef.current = setInterval(() => setWorkSeconds(s => s + 1), 1000); }
    else { clearInterval(workRef.current); }
    return () => clearInterval(workRef.current);
  }, [workStatus]);

  useEffect(() => {
    if (workStatus === 'break') { breakRef.current = setInterval(() => setBreakSeconds(s => s + 1), 1000); }
    else { clearInterval(breakRef.current); }
    return () => clearInterval(breakRef.current);
  }, [workStatus]);

  const hours   = time.getHours();
  const mins    = time.getMinutes().toString().padStart(2, '0');
  const secs    = time.getSeconds().toString().padStart(2, '0');
  const ampm    = hours >= 12 ? 'PM' : 'AM';
  const display = (hours % 12 || 12).toString().padStart(2, '0');
  const greeting = hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening';

  const handleCheckIn    = () => { setWorkStatus('active'); setHistory(h => [...h, { type: 'in', label: 'Checked in', time: new Date(), color: '#34d399' }]); };
  const handleStartBreak = () => { setWorkStatus('break');  setHistory(h => [...h, { type: 'break', label: 'Break started', time: new Date(), color: '#f59e0b' }]); };
  const handleEndBreak   = () => { setWorkStatus('active'); setHistory(h => [...h, { type: 'resume', label: 'Resumed work', time: new Date(), color: '#818cf8' }]); };
  const handleCheckOut   = () => {
    setHistory(h => [...h, { type: 'out', label: 'Checked out', time: new Date(), color: '#f87171' }]);
    setWorkStatus('idle'); setWorkSeconds(0); setBreakSeconds(0);
  };

  const targetSeconds = 8 * 3600;
  const workProgress  = Math.min((workSeconds / targetSeconds) * 100, 100);

  // Glow dinámico según estado
  const glowColor   = workStatus === 'active' ? 'rgba(34,197,94,0.07)' : workStatus === 'break' ? 'rgba(245,158,11,0.07)' : 'rgba(99,102,241,0.07)';
  const dotColor     = workStatus === 'active' ? '#22c55e' : workStatus === 'break' ? '#f59e0b' : '#6366f1';
  const statusLabel  = workStatus === 'active' ? 'Working' : workStatus === 'break' ? 'On break' : 'Not clocked in';
  const clockGlow    = workStatus === 'active' ? '0 0 60px rgba(34,197,94,0.12), 0 0 120px rgba(34,197,94,0.05)'
                     : workStatus === 'break'  ? '0 0 60px rgba(245,158,11,0.12), 0 0 120px rgba(245,158,11,0.05)'
                     :                           '0 0 60px rgba(99,102,241,0.08), 0 0 120px rgba(99,102,241,0.03)';
  const clockBorderColor = workStatus === 'active' ? 'rgba(34,197,94,0.15)' : workStatus === 'break' ? 'rgba(245,158,11,0.15)' : tokens.border;

  const weekNumber = getCurrentWeekNumber();

  const employeeTypeColors = { success: '#34d399', info: '#818cf8', alert: '#f59e0b', error: '#f87171' };

  return (
    <AppLayout role="employee" activePage="home" onNav={onNav} onLogout={onLogout}>
      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .anim-card { animation: cardIn 0.4s ease both; }
      `}</style>

      <div className="p-4 sm:p-6 lg:p-8">

        {/* Header — responsive */}
        <div className="anim-card relative z-20 mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between" style={{ animationDelay: '0ms' }}>
          <div>
            <h1 className="text-[18px] font-semibold tracking-[-0.02em] sm:text-[22px]" style={{ color: tokens.textPrimary }}>
              Good {greeting}, {userProfiles.employee.name.split(' ')[0]}
            </h1>
            <p className="mt-1 text-[13px] sm:text-[14px]" style={{ color: tokens.textSecondary }}>
              {time.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTimeOff(true)}
              className="flex items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[12px] font-semibold transition-all hover:border-[#818cf8] hover:text-[#818cf8]"
              style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent' }}>
              <Umbrella size={14} /> <span className="hidden sm:inline">Time Off</span>
            </button>
            <div className="relative z-[60]">
              <button onClick={() => setShowNotifs(!showNotifs)}
                className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border transition-all"
                style={{ borderColor: showNotifs ? '#818cf8' : tokens.border, background: showNotifs ? 'rgba(99,102,241,0.1)' : tokens.bgCard }}
                aria-label="Notifications">
                <Bell size={15} style={{ color: showNotifs ? '#818cf8' : tokens.textSecondary }} />
                {employeeUnreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f87171] px-1 text-[9px] font-bold text-white">{employeeUnreadCount}</span>}
              </button>
              {showNotifs && (
                <NotificationsDropdown
                  tokens={tokens}
                  onClose={() => setShowNotifs(false)}
                  notifications={employeeNotifs}
                  typeColors={employeeTypeColors}
                />
              )}
            </div>
            <div className="hidden rounded-[8px] px-3 py-1.5 text-[12px] font-medium sm:block" style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
              Week {weekNumber} / {time.getFullYear()}
            </div>
          </div>
        </div>

        {/* CLOCK CARD — responsive */}
        <div
          className="anim-card relative mb-6 overflow-hidden rounded-[20px] border px-6 py-8 transition-all duration-1000 sm:mb-8 sm:rounded-[32px] sm:px-10 lg:px-16 lg:py-12"
          style={{ background: tokens.bgCard, borderColor: clockBorderColor, boxShadow: clockGlow, animationDelay: '80ms' }}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-[600px] w-[600px] rounded-full transition-all duration-1000"
            style={{ background: `radial-gradient(circle,${glowColor} 0%,transparent 70%)` }} />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            {/* Left */}
            <div className="flex-1">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] sm:mb-4 sm:text-[13px]" style={{ color: tokens.textSecondary }}>Current Time</p>
              <div className="mb-4 flex items-baseline gap-2 sm:mb-6 sm:gap-3">
                <span className="font-[DM_Mono,monospace] text-[60px] font-medium leading-none tracking-[-0.04em] sm:text-[80px] lg:text-[110px]" style={{ color: tokens.textPrimary }}>{display}:{mins}</span>
                <span className="hidden font-[DM_Mono,monospace] text-[30px] sm:inline sm:text-[40px] lg:text-[50px]" style={{ color: tokens.textSecondary }}>:{secs}</span>
                <span className="rounded-[8px] border px-2.5 py-1 text-[16px] font-bold text-[#818cf8] sm:rounded-[10px] sm:px-4 sm:py-1.5 sm:text-[24px]" style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)' }}>{ampm}</span>
              </div>

              {workStatus !== 'idle' && (
                <div className="anim-fadeup">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-[6px] max-w-[400px] flex-1 overflow-hidden rounded-full" style={{ background: tokens.bgInput }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${workProgress}%`, background: workProgress >= 100 ? '#34d399' : 'linear-gradient(90deg,#6366f1,#818cf8)' }} />
                    </div>
                    <span className="shrink-0 text-[12px] font-semibold sm:text-[13px]" style={{ color: tokens.textSecondary }}>{workProgress.toFixed(0)}% of 8h</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2.5">
                      <span className="anim-pulse h-2.5 w-2.5 rounded-full" style={{ background: dotColor, boxShadow: `0 0 10px ${dotColor}` }} />
                      <span className="font-[DM_Mono,monospace] text-[22px] font-medium sm:text-[32px]" style={{ color: tokens.textPrimary }}>{formatDuration(workSeconds)}</span>
                      <span className="text-[12px] font-medium sm:text-[14px]" style={{ color: tokens.textSecondary }}>worked</span>
                    </div>
                    {breakSeconds > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-[DM_Mono,monospace] text-[16px] font-medium text-[#f59e0b] sm:text-[20px]">{formatDuration(breakSeconds)}</span>
                        <span className="text-[12px] sm:text-[13px]" style={{ color: tokens.textSecondary }}>break</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {workStatus === 'idle' && <p className="text-[14px] font-medium sm:text-[18px]" style={{ color: tokens.textMuted }}>You haven't checked in yet today.</p>}
            </div>

            {/* Right — botones responsive */}
            <div className="flex shrink-0 flex-col gap-3 sm:gap-4">
              {workStatus === 'idle' && (
                <button onClick={handleCheckIn}
                  className="flex h-[60px] w-full items-center justify-center gap-3 rounded-[16px] text-[18px] font-bold text-white transition-all hover:-translate-y-1 active:translate-y-0 sm:h-[80px] sm:w-[280px] sm:rounded-[20px] sm:text-[22px]"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', border: 'none', cursor: 'pointer' }}>
                  <CheckCircle2 size={24} /> Check In
                </button>
              )}
              {workStatus !== 'idle' && (
                <div className="anim-fadeup flex flex-col gap-3 sm:gap-4">
                  {workStatus === 'active' ? (
                    <button onClick={handleStartBreak}
                      className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[14px] text-[16px] font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 sm:h-[64px] sm:w-[280px] sm:rounded-[16px] sm:text-[18px]"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 6px 20px rgba(245,158,11,0.3)', border: 'none', cursor: 'pointer' }}>
                      <Coffee size={20} /> Start Break
                    </button>
                  ) : (
                    <button onClick={handleEndBreak}
                      className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[14px] text-[16px] font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 sm:h-[64px] sm:w-[280px] sm:rounded-[16px] sm:text-[18px]"
                      style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 6px 20px rgba(22,163,74,0.3)', border: 'none', cursor: 'pointer' }}>
                      <Play size={20} /> End Break
                    </button>
                  )}
                  <button onClick={handleCheckOut} disabled={workStatus === 'break'}
                    className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[14px] text-[16px] font-bold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 active:translate-y-0 sm:h-[64px] sm:w-[280px] sm:rounded-[16px] sm:text-[18px]"
                    style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: workStatus === 'break' ? 'none' : '0 6px 20px rgba(239,68,68,0.3)', border: 'none', cursor: workStatus === 'break' ? 'not-allowed' : 'pointer' }}>
                    <Square size={18} className="fill-current opacity-80" /> Check Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid — responsive: stack on mobile, 2 cols on lg */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-5">

            {/* Stat chips — responsive: 1 col on mobile, 3 cols on sm */}
            <div className="anim-card grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4" style={{ animationDelay: '160ms' }}>
              {[
                { label: 'Hours This Week', value: `${totalHours}h`, sub: '+2.5h vs last week', Icon: Clock, valueColor: '#818cf8', iconBg: 'rgba(129,140,248,0.1)', iconColor: '#818cf8' },
                { label: 'Avg Daily Hours', value: `${(totalHours/5).toFixed(1)}h`, sub: 'Mon – Fri', Icon: TrendingUp, valueColor: '#34d399', iconBg: 'rgba(52,211,153,0.1)', iconColor: '#34d399' },
                { label: 'Days Present', value: '5 / 5', sub: 'Perfect attendance', Icon: CheckCircle, valueColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.1)', iconColor: '#f59e0b' },
              ].map(({ label, value, sub, Icon, valueColor, iconBg, iconColor }) => (
                <div key={label} className="rounded-[16px] border px-5 py-5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: tokens.textSecondary }}>{label}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: iconBg }}><Icon size={14} style={{ color: iconColor }} /></div>
                  </div>
                  <p className="text-[24px] font-bold leading-none tracking-[-0.02em] sm:text-[28px]" style={{ color: valueColor }}>{value}</p>
                  <p className="mt-1.5 text-[11px]" style={{ color: tokens.textSecondary }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Chart — responsive */}
            <div className="anim-card rounded-[16px] border px-5 py-6 sm:px-7" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '240ms' }}>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[16px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>Weekly Hours</p>
                  <p className="mt-0.5 text-[12px]" style={{ color: tokens.textSecondary }}>
                    {time.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} week
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    {[{ label: 'Worked', color: '#6366f1' }, { label: 'Over target', color: '#34d399' }].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-[3px]" style={{ background: l.color }} />
                        <span className="text-[11px]" style={{ color: tokens.textSecondary }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {[['week','Week'],['target','vs Target']].map(([mode, lbl]) => (
                      <button key={mode} onClick={() => setChartMode(mode)}
                        className="rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-all"
                        style={{ borderColor: chartMode === mode ? 'rgba(99,102,241,0.3)' : tokens.border, background: chartMode === mode ? 'rgba(99,102,241,0.15)' : 'transparent', color: chartMode === mode ? '#818cf8' : tokens.textSecondary }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="flex w-7 shrink-0 flex-col justify-between pb-7" style={{ height: 220 }}>
                  {[12, 9, 6, 3, 0].map(v => <span key={v} className="text-right text-[10px]" style={{ color: tokens.textMuted }}>{v}h</span>)}
                </div>
                <div className="flex flex-1 items-end gap-1.5 sm:gap-2.5" style={{ height: 220 }}>
                  {weekData.map((item, idx) => {
                    const hovered = hoveredBar === idx;
                    const workedPct = (item.hours / chartScale) * 100;
                    const targetPct = (item.target / chartScale) * 100;
                    const isOver = item.hours > item.target && item.target > 0;
                    const barBg = item.hours === 0 ? 'transparent' : isOver ? 'linear-gradient(180deg,#34d399,#16a34a)' : 'linear-gradient(180deg,#818cf8,#6366f1)';
                    const barHoverBg = isOver ? 'linear-gradient(180deg,#6ee7b7,#34d399)' : 'linear-gradient(180deg,#a5b4fc,#818cf8)';
                    return (
                      <div key={item.day} className="relative flex h-full flex-1 cursor-pointer flex-col items-center"
                        onMouseEnter={() => setHoveredBar(idx)} onMouseLeave={() => setHoveredBar(null)}>
                        {hovered && item.hours > 0 && <ChartTooltip item={item} tokens={tokens} />}
                        <div className="relative mb-2 w-full flex-1 overflow-visible rounded-[8px] bg-white/[0.02]">
                          {chartMode === 'target' && item.target > 0 && (
                            <div className="absolute -left-0.5 -right-0.5 h-[2px] rounded-full opacity-40" style={{ bottom: `${targetPct}%`, zIndex: 2, background: tokens.textMuted }} />
                          )}
                          <div className="absolute bottom-0 left-0 right-0 rounded-[8px] transition-all duration-500 ease-out"
                            style={{ height: `${workedPct}%`, minHeight: item.hours > 0 ? 4 : 0, background: hovered ? barHoverBg : barBg, boxShadow: hovered ? '0 0 14px rgba(99,102,241,0.35)' : 'none' }} />
                        </div>
                        <span className="text-[11px] font-semibold transition-colors sm:text-[12px]" style={{ color: hovered ? '#818cf8' : tokens.textMuted }}>{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-between gap-2 border-t pt-5" style={{ borderColor: tokens.borderSide }}>
                {[
                  { label: 'Total worked', value: `${totalHours}h`, color: '#818cf8' },
                  { label: 'Weekly target', value: '40h', color: tokens.textSecondary },
                  { label: 'Difference', value: `+${totalHours - 40}h`, color: '#34d399' },
                  { label: 'Best day', value: '10h (Thu)', color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className="text-[14px] font-bold sm:text-[15px]" style={{ color }}>{value}</p>
                    <p className="mt-0.5 text-[11px]" style={{ color: tokens.textMuted }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — responsive */}
          <div className="flex flex-col gap-5">

            {/* Today's Summary */}
            <div className="anim-card rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '200ms' }}>
              <p className="mb-3.5 text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Today's Summary</p>
              {[
                { label: 'Clock In', value: history.find(h => h.type === 'in') ? formatTime(history.find(h => h.type === 'in').time) : '—', color: '#34d399', mono: false },
                { label: 'Time Worked', value: workSeconds > 0 ? formatDuration(workSeconds) : '—', color: '#818cf8', mono: true },
                { label: 'Break Time', value: breakSeconds > 0 ? formatDuration(breakSeconds) : '—', color: '#f59e0b', mono: true },
                { label: 'Expected Out', value: '06:00 PM', color: tokens.textSecondary, mono: false },
              ].map(({ label, value, color, mono }, i, arr) => (
                <div key={label}
                  className={`flex items-center justify-between rounded-[8px] -mx-2 px-2 py-2.5 transition-all duration-150 ${i < arr.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: tokens.borderSide }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <span className="text-[12px]" style={{ color: tokens.textSecondary }}>{label}</span>
                  <span className={`text-[13px] font-semibold ${mono ? 'font-[DM_Mono,monospace]' : ''}`} style={{ color }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Pending Requests — now from DataContext */}
            <div className="anim-card rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '260ms' }}>
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>My Requests</p>
                  {myPendingReports.length > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f59e0b]/15 px-1 text-[9px] font-bold text-[#f59e0b]">{myPendingReports.length}</span>
                  )}
                </div>
                <button onClick={() => onNav?.('reports')} className="text-[11px] font-medium text-[#818cf8]">View all</button>
              </div>
              {myPendingReports.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4" style={{ color: tokens.textMuted }}>
                  <CheckCircle2 size={20} className="opacity-40" />
                  <p className="text-[11px]">No pending requests</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {myPendingReports.map(r => {
                    const ss = reportStatusStyles[r.status];
                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-[10px] border px-3 py-2.5 transition-all"
                        style={{ borderColor: tokens.border }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold" style={{ color: tokens.textPrimary }}>{r.type}: {r.desc}</p>
                          <p className="mt-0.5 text-[10px]" style={{ color: tokens.textMuted }}>{r.date}</p>
                        </div>
                        <span className={`rounded-full border px-2 py-[2px] text-[9px] font-bold ${ss.bg} ${ss.border} ${ss.text}`}>
                          {r.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Today's Log */}
            <div className="anim-card flex min-h-[140px] flex-1 flex-col rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '320ms' }}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Today's Log</p>
                {workStatus !== 'idle' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: dotColor }}>
                    <span className="anim-pulse h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />{statusLabel}
                  </div>
                )}
              </div>
              {history.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  <Clock size={26} style={{ color: tokens.textMuted }} />
                  <p className="text-[13px]" style={{ color: tokens.textMuted }}>No activity yet today</p>
                </div>
              ) : (
                <div className="relative flex flex-col">
                  <div className="absolute bottom-3.5 left-3 top-3.5 w-px" style={{ background: tokens.border }} />
                  {history.map((entry, idx) => {
                    const iconMap = { in: LogIn, out: LogOutIcon, break: Coffee, resume: Play };
                    const I = iconMap[entry.type] || Clock;
                    return (
                      <div key={idx} className={`anim-slidein flex items-start gap-3 ${idx < history.length - 1 ? 'pb-3.5' : ''}`}>
                        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{ background: `${entry.color}18`, border: `1.5px solid ${entry.color}50` }}>
                          <I size={11} style={{ color: entry.color }} />
                        </div>
                        <div className="pt-0.5">
                          <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{entry.label}</p>
                          <p className="mt-0.5 text-[11px]" style={{ color: tokens.textMuted }}>{formatTime(entry.time)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Team Activity */}
            <div className="anim-card rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '380ms' }}>
              <div className="mb-3.5 flex items-center justify-between">
                <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Team Activity</p>
                <span className="cursor-pointer text-[11px] font-medium text-[#818cf8]">View all</span>
              </div>
              {[
                { name: 'Alejandro Nicolás', time: '04:30 PM', status: 'checked-in' },
                { name: 'Nuria García',      time: '04:30 PM', status: 'checked-in' },
                { name: 'Miguel Hernández',  time: '04:30 PM', status: 'checked-out' },
                { name: 'Diego Martín',      time: '04:30 PM', status: 'checked-in' },
                { name: 'Lucia Sastre',      time: '04:30 PM', status: 'checked-out' },
              ].map((person, idx) => (
                <div key={idx}
                  className={`flex items-center gap-3 rounded-[8px] -mx-2 px-2 py-2.5 transition-all duration-150 ${idx < 4 ? 'border-b' : ''}`}
                  style={{ borderColor: tokens.borderSide }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: avatarGradientsCSS[idx % 5] }}>{getInitials(person.name)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{person.name}</p>
                    <p className="mt-0.5 text-[11px]" style={{ color: tokens.textMuted }}>{person.time}</p>
                  </div>
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: person.status === 'checked-in' ? '#22c55e' : tokens.textSecondary, boxShadow: person.status === 'checked-in' ? '0 0 6px rgba(34,197,94,0.5)' : 'none' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTimeOff && <RequestTimeOffModal onClose={() => setShowTimeOff(false)} tokens={tokens} />}
    </AppLayout>
  );
}