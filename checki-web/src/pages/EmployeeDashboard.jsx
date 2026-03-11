import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, TrendingUp, CheckCircle2, Bell, CheckCircle,
  Coffee, Square, Play, LogIn, LogOut as LogOutIcon,
  X, Calendar, Umbrella, History, MapPin, Briefcase,
  Building2, Home,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import AppLayout from '../components/AppLayout';
import NotificationsDropdown from '../components/NotificationsDropdown';
import { avatarGradientsCSS, getInitials } from '../data/mockData';
import { attendance as attendanceApi } from '../services/api';

// ============================================================================
// UTILIDADES
// ============================================================================
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}
function formatTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================================
// REQUEST TIME OFF MODAL
// ============================================================================
function RequestTimeOffModal({ onClose, tokens }) {
  const { addReport } = useData();
  const [type, setType] = useState('vacation');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!date) return;
    try {
      await addReport({ type, description: desc.trim() || `${type} request`, date });
      setSent(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[400px] rounded-[20px] border p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#34d399]/15"><CheckCircle2 size={28} className="text-[#34d399]" /></div>
            <p className="text-[15px] font-semibold" style={{ color: tokens.textPrimary }}>Request submitted!</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"><Calendar size={14} className="text-white" /></div>
                <p className="text-[15px] font-semibold" style={{ color: tokens.textPrimary }}>Request Time Off</p>
              </div>
              <button onClick={onClose} style={{ color: tokens.textSecondary }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="mb-2 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['vacation', 'medical', 'incident'].map(t => (
                    <button key={t} onClick={() => setType(t)}
                      className={`rounded-[8px] border py-2 text-[11px] font-semibold capitalize transition-all ${type === t ? 'border-[#6366f1]/40 bg-[#6366f1]/15 text-[#818cf8]' : ''}`}
                      style={{ borderColor: type === t ? undefined : tokens.border, color: type === t ? undefined : tokens.textSecondary }}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Date *</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none focus:border-[#6366f1] [color-scheme:dark]"
                  style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Note</label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Family event" className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none focus:border-[#6366f1]"
                  style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!date} className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', border: 'none', cursor: date ? 'pointer' : 'not-allowed' }}>Submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function EmployeeDashboard({ onLogout, onNav }) {
  const tokens = useTokens();
  const { user } = useAuth();
  const { myPendingReports, notifs, unreadCount } = useData();

  const [time, setTime] = useState(new Date());
  const [workStatus, setWorkStatus] = useState('idle'); // idle | active | break
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [history, setHistory] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [todayData, setTodayData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const workRef = useRef(null);
  const breakRef = useRef(null);

  // Clock
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  // Fetch today's attendance from API on mount
  useEffect(() => {
    attendanceApi.getToday().then(data => {
      if (data.checked_in) {
        setTodayData(data);
        if (data.check_in && !data.check_out) {
          setWorkStatus('active');
          const checkInTime = new Date(data.check_in).getTime();
          const elapsed = Math.floor((Date.now() - checkInTime) / 1000);
          setWorkSeconds(elapsed);
          setHistory([{ type: 'in', label: 'Checked in', time: data.check_in, color: '#34d399' }]);
          // Check for open break
          const openBreak = data.breaks?.find(b => !b.end_time);
          if (openBreak) {
            setWorkStatus('break');
            const breakElapsed = Math.floor((Date.now() - new Date(openBreak.start_time).getTime()) / 1000);
            setBreakSeconds(breakElapsed);
          }
        } else if (data.check_out) {
          setWorkStatus('idle');
          setHistory([
            { type: 'in', label: 'Checked in', time: data.check_in, color: '#34d399' },
            { type: 'out', label: 'Checked out', time: data.check_out, color: '#f87171' },
          ]);
        }
      }
    }).catch(() => {});

    // Fetch attendance history (last 14 days)
    attendanceApi.getHistory({ }).then(data => {
      if (Array.isArray(data)) setAttendanceHistory(data);
    }).catch(() => {});
  }, []);

  // Work timer
  useEffect(() => {
    if (workStatus === 'active') { workRef.current = setInterval(() => setWorkSeconds(s => s + 1), 1000); }
    else if (workStatus === 'break') { /* keep counting work */ workRef.current = setInterval(() => setWorkSeconds(s => s + 1), 1000); }
    else { clearInterval(workRef.current); }
    return () => clearInterval(workRef.current);
  }, [workStatus]);

  // Break timer
  useEffect(() => {
    if (workStatus === 'break') { breakRef.current = setInterval(() => setBreakSeconds(s => s + 1), 1000); }
    else { clearInterval(breakRef.current); }
    return () => clearInterval(breakRef.current);
  }, [workStatus]);

  const hours = time.getHours();
  const mins = time.getMinutes().toString().padStart(2, '0');
  const secs = time.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const display = (hours % 12 || 12).toString().padStart(2, '0');
  const greeting = hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening';
  const firstName = user?.name?.split(' ')[0] || 'Employee';

  const handleCheckIn = async (location = 'office') => {
    try {
      const data = await attendanceApi.checkIn(location);
      setWorkStatus('active');
      setShowCheckInModal(false);
      setHistory(h => [...h, { type: 'in', label: `Checked in · ${location.charAt(0).toUpperCase() + location.slice(1)}`, time: new Date(), color: '#34d399' }]);
    } catch (err) { console.error(err); }
  };
  const handleStartBreak = async () => {
    try {
      await attendanceApi.startBreak();
      setWorkStatus('break');
      setHistory(h => [...h, { type: 'break', label: 'Break started', time: new Date(), color: '#f59e0b' }]);
    } catch (err) { console.error(err); }
  };
  const handleEndBreak = async () => {
    try {
      await attendanceApi.endBreak();
      setWorkStatus('active');
      setHistory(h => [...h, { type: 'resume', label: 'Resumed work', time: new Date(), color: '#818cf8' }]);
    } catch (err) { console.error(err); }
  };
  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      setHistory(h => [...h, { type: 'out', label: 'Checked out', time: new Date(), color: '#f87171' }]);
      setWorkStatus('idle');
      setWorkSeconds(0);
      setBreakSeconds(0);
    } catch (err) { console.error(err); }
  };

  const targetSeconds = 8 * 3600;
  const workProgress = Math.min((workSeconds / targetSeconds) * 100, 100);
  const dotColor = workStatus === 'active' ? '#22c55e' : workStatus === 'break' ? '#f59e0b' : '#6366f1';
  const statusLabel = workStatus === 'active' ? 'Working' : workStatus === 'break' ? 'On break' : 'Not clocked in';
  const clockBorderColor = workStatus === 'active' ? 'rgba(34,197,94,0.15)' : workStatus === 'break' ? 'rgba(245,158,11,0.15)' : tokens.border;
  const glowColor = workStatus === 'active' ? 'rgba(34,197,94,0.07)' : workStatus === 'break' ? 'rgba(245,158,11,0.07)' : 'rgba(99,102,241,0.07)';

  const mappedNotifs = notifs.map(n => ({ ...n, read: n.is_read, desc: n.description }));
  const empTypeColors = { success: '#34d399', info: '#818cf8', alert: '#f59e0b', error: '#f87171' };

  const reportStatusStyles = {
    pending:  { bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20', text: 'text-[#f59e0b]' },
    approved: { bg: 'bg-[#34d399]/10', border: 'border-[#34d399]/20', text: 'text-[#34d399]' },
    rejected: { bg: 'bg-[#f87171]/10', border: 'border-[#f87171]/20', text: 'text-[#f87171]' },
    resolved: { bg: 'bg-[#818cf8]/10', border: 'border-[#818cf8]/20', text: 'text-[#818cf8]' },
  };

  // Shift info from user profile
  const fmtShift = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };
  const shiftStartStr = fmtShift(user?.shift_start);
  const shiftEndStr = fmtShift(user?.shift_end);
  const shiftTotalHours = user?.shift_start && user?.shift_end
    ? ((parseInt(user.shift_end) - parseInt(user.shift_start)) || 8)
    : 8;

  return (
    <AppLayout role="employee" activePage="home" onNav={onNav} onLogout={onLogout}>
      <style>{`@keyframes cardIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } } .anim-card { animation: cardIn 0.4s ease both; } .anim-fadeup { animation: fadeUp 0.3s ease both; } .anim-slidein { animation: slideIn 0.25s ease both; } .anim-pulse { animation: pulse 2s infinite; }`}</style>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="anim-card relative z-20 mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[18px] font-semibold tracking-[-0.02em] sm:text-[22px]" style={{ color: tokens.textPrimary }}>Good {greeting}, {firstName}</h1>
            <p className="mt-1 text-[13px] sm:text-[14px]" style={{ color: tokens.textSecondary }}>{time.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTimeOff(true)} className="flex items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[12px] font-semibold transition-all hover:border-[#818cf8] hover:text-[#818cf8]"
              style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent' }}><Umbrella size={14} /> <span className="hidden sm:inline">Time Off</span></button>
            <div className="relative z-[60]">
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border transition-all"
                style={{ borderColor: showNotifs ? '#818cf8' : tokens.border, background: showNotifs ? 'rgba(99,102,241,0.1)' : tokens.bgCard }} aria-label="Notifications">
                <Bell size={15} style={{ color: showNotifs ? '#818cf8' : tokens.textSecondary }} />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f87171] px-1 text-[9px] font-bold text-white">{unreadCount}</span>}
              </button>
              {showNotifs && <NotificationsDropdown tokens={tokens} onClose={() => setShowNotifs(false)} notifications={mappedNotifs} typeColors={empTypeColors} />}
            </div>
          </div>
        </div>

        {/* Day Summary Strip */}
        <div className="anim-card mb-4 grid grid-cols-2 gap-2.5 sm:mb-5 sm:grid-cols-4 sm:gap-3">
          {[
            { label: 'Shift Today', value: `${shiftStartStr} – ${shiftEndStr}`, icon: Briefcase, color: '#818cf8' },
            { label: 'Expected Start', value: shiftStartStr, icon: LogIn, color: '#34d399' },
            { label: 'Status', value: statusLabel, icon: workStatus === 'break' ? Coffee : workStatus === 'active' ? Play : Clock, color: dotColor },
            { label: 'Location', value: user?.location === 'home' ? 'Home' : user?.location === 'remote' ? 'Remote' : 'Office', icon: MapPin, color: '#22d3ee' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 rounded-[14px] border px-4 py-3 transition-colors" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `${color}12` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold leading-none" style={{ color }}>{value}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.04em]" style={{ color: tokens.textSecondary }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Clock Card */}
        <div className="anim-card relative mb-6 overflow-hidden rounded-[20px] border transition-all duration-700 sm:mb-8 sm:rounded-[28px]"
          style={{ background: tokens.bgCard, borderColor: clockBorderColor }}>
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full transition-all duration-1000" style={{ background: `radial-gradient(circle,${glowColor} 0%,transparent 60%)` }} />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full transition-all duration-1000" style={{ background: `radial-gradient(circle,${glowColor} 0%,transparent 60%)`, opacity: 0.5 }} />

          <div className="relative flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-14 lg:py-12">
            {/* Left: Clock + progress */}
            <div className="flex-1">
              {/* Time display */}
              <div className="mb-5 flex items-end gap-2 sm:mb-7 sm:gap-3">
                <div className="flex items-baseline">
                  <span className="font-[DM_Mono,monospace] text-[64px] font-semibold leading-[0.85] tracking-[-0.04em] sm:text-[88px] lg:text-[100px]" style={{ color: tokens.textPrimary }}>{display}</span>
                  <span className="font-[DM_Mono,monospace] text-[64px] font-light leading-[0.85] tracking-[-0.04em] sm:text-[88px] lg:text-[100px]" style={{ color: tokens.textSecondary, opacity: 0.4 }}>:</span>
                  <span className="font-[DM_Mono,monospace] text-[64px] font-semibold leading-[0.85] tracking-[-0.04em] sm:text-[88px] lg:text-[100px]" style={{ color: tokens.textPrimary }}>{mins}</span>
                </div>
                <div className="mb-1 flex flex-col items-start gap-1 sm:mb-2">
                  <span className="font-[DM_Mono,monospace] text-[20px] font-medium sm:text-[28px]" style={{ color: tokens.textMuted }}>{secs}</span>
                  <span className="rounded-[6px] px-2 py-0.5 text-[11px] font-bold sm:px-2.5 sm:text-[13px]"
                    style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>{ampm}</span>
                </div>
              </div>

              {/* Progress area */}
              {workStatus !== 'idle' ? (
                <div>
                  {/* Progress bar */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-2 max-w-[420px] flex-1 overflow-hidden rounded-full" style={{ background: tokens.bgInput }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${workProgress}%`,
                          background: workProgress >= 100 ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#6366f1,#818cf8,#a78bfa)',
                          boxShadow: workProgress >= 100 ? '0 0 12px rgba(52,211,153,0.4)' : '0 0 12px rgba(99,102,241,0.3)',
                        }} />
                    </div>
                    <span className="shrink-0 text-[12px] font-bold sm:text-[13px]" style={{ color: workProgress >= 100 ? '#34d399' : '#818cf8' }}>
                      {workProgress.toFixed(0)}% of {shiftTotalHours}h
                    </span>
                  </div>

                  {/* Timers */}
                  <div className="flex flex-wrap items-center gap-5 sm:gap-8">
                    <div className="flex items-center gap-2.5">
                      <span className="anim-pulse h-2.5 w-2.5 rounded-full" style={{ background: dotColor, boxShadow: `0 0 12px ${dotColor}` }} />
                      <span className="font-[DM_Mono,monospace] text-[24px] font-semibold tracking-tight sm:text-[34px]" style={{ color: tokens.textPrimary }}>{formatDuration(workSeconds)}</span>
                      <span className="text-[12px] font-medium sm:text-[14px]" style={{ color: tokens.textSecondary }}>worked</span>
                    </div>
                    {breakSeconds > 0 && (
                      <div className="flex items-center gap-2 rounded-[8px] px-3 py-1.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <Coffee size={14} style={{ color: '#f59e0b' }} />
                        <span className="font-[DM_Mono,monospace] text-[16px] font-semibold text-[#f59e0b] sm:text-[20px]">{formatDuration(breakSeconds)}</span>
                        <span className="text-[11px] sm:text-[12px]" style={{ color: tokens.textSecondary }}>break</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ background: tokens.textMuted, opacity: 0.4 }} />
                  <p className="text-[15px] font-medium sm:text-[18px]" style={{ color: tokens.textMuted }}>You haven't checked in yet today.</p>
                </div>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex shrink-0 flex-col gap-3 sm:gap-3.5">
              {workStatus === 'idle' && (
                <button onClick={() => setShowCheckInModal(true)}
                  className="group flex h-[64px] w-full items-center justify-center gap-3 rounded-[16px] text-[18px] font-bold text-white transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(99,102,241,0.35)] sm:h-[76px] sm:w-[260px] sm:rounded-[18px] sm:text-[20px]"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}>
                  <CheckCircle2 size={22} className="transition-transform group-hover:scale-110" /> Check In
                </button>
              )}
              {workStatus !== 'idle' && (
                <>
                  {workStatus === 'active' ? (
                    <button onClick={handleStartBreak}
                      className="flex h-[56px] w-full items-center justify-center gap-3 rounded-[14px] text-[16px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,158,11,0.3)] sm:h-[64px] sm:w-[260px] sm:text-[17px]"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', cursor: 'pointer' }}>
                      <Coffee size={18} /> Start Break
                    </button>
                  ) : (
                    <button onClick={handleEndBreak}
                      className="flex h-[56px] w-full items-center justify-center gap-3 rounded-[14px] text-[16px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(22,163,74,0.3)] sm:h-[64px] sm:w-[260px] sm:text-[17px]"
                      style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', cursor: 'pointer' }}>
                      <Play size={18} /> End Break
                    </button>
                  )}
                  <button onClick={handleCheckOut} disabled={workStatus === 'break'}
                    className="flex h-[56px] w-full items-center justify-center gap-3 rounded-[14px] text-[16px] font-bold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 sm:h-[64px] sm:w-[260px] sm:text-[17px]"
                    style={{ background: workStatus !== 'break' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : tokens.bgInput, boxShadow: workStatus !== 'break' ? '0 8px 24px rgba(239,68,68,0.2)' : 'none', border: 'none', cursor: workStatus === 'break' ? 'not-allowed' : 'pointer' }}>
                    <Square size={16} className="fill-current opacity-80" /> Check Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-5">
            {/* Stat chips */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                { label: 'Time Worked', value: formatDuration(workSeconds), Icon: Clock, valueColor: '#818cf8', iconBg: 'rgba(129,140,248,0.1)', iconColor: '#818cf8' },
                { label: 'Break Time', value: formatDuration(breakSeconds), Icon: Coffee, valueColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.1)', iconColor: '#f59e0b' },
                { label: 'Progress', value: `${workProgress.toFixed(0)}%`, Icon: TrendingUp, valueColor: '#34d399', iconBg: 'rgba(52,211,153,0.1)', iconColor: '#34d399' },
              ].map(({ label, value, Icon, valueColor, iconBg, iconColor }) => (
                <div key={label} className="rounded-[16px] border px-5 py-5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: tokens.textSecondary }}>{label}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: iconBg }}><Icon size={14} style={{ color: iconColor }} /></div>
                  </div>
                  <p className="text-[24px] font-bold leading-none tracking-[-0.02em] sm:text-[28px]" style={{ color: valueColor }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Attendance History */}
            <div className="rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={15} style={{ color: '#818cf8' }} />
                  <p className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>Attendance History</p>
                </div>
                <span className="text-[11px]" style={{ color: tokens.textMuted }}>{attendanceHistory.length} records</span>
              </div>
              {attendanceHistory.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6" style={{ color: tokens.textMuted }}>
                  <Calendar size={24} className="opacity-40" />
                  <p className="text-[12px]">No attendance records yet</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Header */}
                  <div className="mb-2 hidden grid-cols-[1fr_90px_90px_80px_80px] gap-3 sm:grid">
                    {['Date', 'Check In', 'Check Out', 'Worked', 'Status'].map(h => (
                      <span key={h} className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.textMuted }}>{h}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  {attendanceHistory.map((record, idx) => {
                    const statusMap = {
                      on_time: { color: '#34d399', label: 'On Time' },
                      late: { color: '#f59e0b', label: 'Late' },
                      absent: { color: '#f87171', label: 'Absent' },
                      on_leave: { color: '#818cf8', label: 'On Leave' },
                    };
                    const st = statusMap[record.status] || statusMap.absent;
                    const dateStr = new Date(record.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                    const checkInStr = record.check_in ? new Date(record.check_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
                    const checkOutStr = record.check_out ? new Date(record.check_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
                    const workedH = Math.floor((record.worked_minutes || 0) / 60);
                    const workedM = (record.worked_minutes || 0) % 60;
                    const workedStr = record.worked_minutes ? `${workedH}h ${workedM}m` : '—';

                    return (
                      <div key={record.id || idx}
                        className={`grid grid-cols-2 gap-2 py-2.5 sm:grid-cols-[1fr_90px_90px_80px_80px] sm:gap-3 ${idx < attendanceHistory.length - 1 ? 'border-b' : ''}`}
                        style={{ borderColor: tokens.borderSide }}>
                        <div>
                          <p className="text-[12px] font-semibold sm:text-[13px]" style={{ color: tokens.textPrimary }}>{dateStr}</p>
                          <p className="text-[10px] sm:hidden" style={{ color: tokens.textMuted }}>{checkInStr} → {checkOutStr}</p>
                        </div>
                        <span className="hidden text-[12px] font-medium sm:block" style={{ color: '#34d399' }}>{checkInStr}</span>
                        <span className="hidden text-[12px] font-medium sm:block" style={{ color: record.check_out ? '#f87171' : tokens.textMuted }}>{checkOutStr}</span>
                        <span className="hidden text-[12px] font-semibold sm:block" style={{ color: tokens.textPrimary }}>{workedStr}</span>
                        <span className="text-right text-[10px] font-bold sm:text-left sm:text-[11px]" style={{ color: st.color }}>{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Pending Requests */}
            <div className="rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>My Requests</p>
                  {myPendingReports.length > 0 && <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f59e0b]/15 px-1 text-[9px] font-bold text-[#f59e0b]">{myPendingReports.length}</span>}
                </div>
                <button onClick={() => onNav?.('reports')} className="text-[11px] font-medium text-[#818cf8]">View all</button>
              </div>
              {myPendingReports.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4" style={{ color: tokens.textMuted }}><CheckCircle2 size={20} className="opacity-40" /><p className="text-[11px]">No pending requests</p></div>
              ) : (
                <div className="flex flex-col gap-2">
                  {myPendingReports.map(r => {
                    const ss = reportStatusStyles[r.status] || reportStatusStyles.pending;
                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-[10px] border px-3 py-2.5" style={{ borderColor: tokens.border }}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold" style={{ color: tokens.textPrimary }}>{r.type}: {r.description}</p>
                          <p className="mt-0.5 text-[10px]" style={{ color: tokens.textMuted }}>{new Date(r.date).toLocaleDateString('en-GB')}</p>
                        </div>
                        <span className={`rounded-full border px-2 py-[2px] text-[9px] font-bold capitalize ${ss.bg} ${ss.border} ${ss.text}`}>{r.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Today's Log */}
            <div className="flex min-h-[140px] flex-1 flex-col rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>Today's Log</p>
                {workStatus !== 'idle' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: dotColor }}>
                    <span className="anim-pulse h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />{statusLabel}
                  </div>
                )}
              </div>
              {history.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2"><Clock size={26} style={{ color: tokens.textMuted }} /><p className="text-[13px]" style={{ color: tokens.textMuted }}>No activity yet today</p></div>
              ) : (
                <div className="relative flex flex-col">
                  <div className="absolute bottom-3.5 left-3 top-3.5 w-px" style={{ background: tokens.border }} />
                  {history.map((entry, idx) => {
                    const iconMap = { in: LogIn, out: LogOutIcon, break: Coffee, resume: Play };
                    const I = iconMap[entry.type] || Clock;
                    return (
                      <div key={idx} className={`flex items-start gap-3 ${idx < history.length - 1 ? 'pb-3.5' : ''}`}>
                        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: `${entry.color}18`, border: `1.5px solid ${entry.color}50` }}>
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
          </div>
        </div>
      </div>

      {showTimeOff && <RequestTimeOffModal onClose={() => setShowTimeOff(false)} tokens={tokens} />}

      {/* Check-In Location Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-[380px] rounded-[20px] border p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
                  <MapPin size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>Where are you working?</p>
                  <p className="text-[12px]" style={{ color: tokens.textSecondary }}>Select your location to check in</p>
                </div>
              </div>
              <button onClick={() => setShowCheckInModal(false)} className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/10" style={{ color: tokens.textSecondary }}>
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { key: 'office', label: 'Office', desc: 'Working from the office', icon: Building2, color: '#818cf8' },
                { key: 'home', label: 'Home', desc: 'Working from home', icon: Home, color: '#34d399' },
                { key: 'remote', label: 'Remote', desc: 'Other remote location', icon: MapPin, color: '#f59e0b' },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                <button key={opt.key} onClick={() => handleCheckIn(opt.key)}
                  className="group flex items-center gap-4 rounded-[14px] border px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ borderColor: tokens.border, background: tokens.bgInput }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${opt.color}50`; e.currentTarget.style.background = `${opt.color}08`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.background = tokens.bgInput; }}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] transition-colors" style={{ background: `${opt.color}12`, border: `1px solid ${opt.color}20` }}>
                    <Icon size={20} style={{ color: opt.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>{opt.label}</p>
                    <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>{opt.desc}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100" style={{ background: `${opt.color}15` }}>
                    <CheckCircle2 size={16} style={{ color: opt.color }} />
                  </div>
                </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-[11px]" style={{ color: tokens.textMuted }}>
              {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · Your shift starts at {shiftStartStr}
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}