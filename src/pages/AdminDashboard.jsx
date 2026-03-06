import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CheckCircle2, Clock, MapPin, Bell, ChevronRight, Check,
  X, Calendar, Building2, UserCheck, Users, AlertCircle,
  XCircle as XCircleIcon, FileText,
} from 'lucide-react';
import { useTokens, useTheme } from '../contexts/Themecontext';
import AppLayout from '../components/AppLayout';
import {
  departmentData, recentEvents, avatarGradients,
  eventTypeConfig, getInitials, employeesData,
  weeklyAttendanceData, notificationsData, userProfiles,
} from '../data/mockData';
import initialReportsData from '../data/reportsData';

// ============================================================================
// HOOK: COUNT-UP
// ============================================================================
function useCountUp(target, duration = 1200, start = true) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);
  return value;
}

// ============================================================================
// CIRCLE PROGRESS
// ============================================================================
function CircleProgress({ present, total, color, tokens }) {
  const r = 42, c = 2 * Math.PI * r, off = c - (present / total) * c;
  return (
    <div className="relative flex h-[110px] w-[110px] shrink-0 items-center justify-center">
      <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90 absolute inset-0" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="transparent" stroke={tokens.border} strokeWidth="7" />
        <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="7"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div className="relative z-10 text-center">
        <p className="text-[20px] font-bold leading-none" style={{ color: tokens.textPrimary }}>{present}</p>
        <p className="mt-1 text-[10px] font-medium" style={{ color: tokens.textSecondary }}>/ {total}</p>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD (count-up)
// ============================================================================
function StatCard({ label, value, sub, trend, Icon, valueColor, iconBg, iconColor, cardBorder, glowBg, tokens, animStart, delay }) {
  const animated = useCountUp(parseInt(value, 10) || 0, 1200, animStart);
  return (
    <div className="anim-card relative overflow-hidden rounded-[16px] border p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
      style={{ background: tokens.bgCard, borderColor: cardBorder, animationDelay: `${delay}ms` }}>
      <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full" style={{ background: glowBg }} />
      <div className="mb-4 flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: tokens.textSecondary }}>{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: iconBg }}>
          <Icon size={14} color={iconColor} />
        </div>
      </div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="tabular-nums text-[36px] font-bold leading-none tracking-[-0.03em]" style={{ color: valueColor }}>{animated}</span>
        <span className="text-[13px]" style={{ color: tokens.textSecondary }}>{sub}</span>
      </div>
      <p className="mt-2 text-[11px]" style={{ color: tokens.textSecondary }}>{trend}</p>
    </div>
  );
}

// ============================================================================
// NOTIFICATIONS DROPDOWN
// ============================================================================
function NotificationsDropdown({ tokens, onClose }) {
  const [notifications, setNotifications] = useState(notificationsData);
  const unread = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const typeColors = { request: '#f59e0b', alert: '#f87171', incident: '#818cf8', info: '#34d399' };

  return (
    <div ref={ref} className="absolute right-0 top-12 z-50 w-[360px] rounded-[16px] border shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
      style={{ background: tokens.bgCard, borderColor: tokens.border }}>
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: tokens.borderSide }}>
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>Notifications</p>
          {unread > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f87171] px-1.5 text-[10px] font-bold text-white">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-[11px] font-medium text-[#818cf8] transition-colors hover:text-[#a5b4fc]">Mark all read</button>
        )}
      </div>
      <div className="max-h-[320px] overflow-auto">
        {notifications.map((n) => (
          <div key={n.id}
            className="flex gap-3 border-b px-5 py-3.5 transition-colors last:border-none"
            style={{ borderColor: tokens.borderSide, background: n.read ? 'transparent' : (tokens.isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)') }}
            onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? 'transparent' : (tokens.isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)'); }}
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ background: `${typeColors[n.type]}15`, border: `1.5px solid ${typeColors[n.type]}30` }}>
              <span className="h-2 w-2 rounded-full" style={{ background: typeColors[n.type] }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold leading-tight" style={{ color: tokens.textPrimary }}>{n.title}</p>
              <p className="mt-0.5 truncate text-[11px]" style={{ color: tokens.textSecondary }}>{n.desc}</p>
              <p className="mt-1 text-[10px]" style={{ color: tokens.textMuted }}>{n.time}</p>
            </div>
            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6366f1]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// WEEKLY ATTENDANCE CHART — Grouped bars with proper scale
// ============================================================================
function WeeklyChart({ tokens }) {
  const [hovered, setHovered] = useState(null);
  const total = 200; // total employees

  return (
    <div className="anim-card rounded-[16px] border p-6" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '350ms' }}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>Weekly Attendance</p>
          <p className="mt-0.5 text-[12px]" style={{ color: tokens.textSecondary }}>Out of {total} employees · This week</p>
        </div>
        <div className="flex items-center gap-4">
          {[{ label: 'Present', color: '#34d399' }, { label: 'Late', color: '#f59e0b' }, { label: 'Absent', color: '#f87171' }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-[3px]" style={{ background: l.color }} />
              <span className="text-[11px]" style={{ color: tokens.textSecondary }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart area with Y axis */}
      <div className="flex gap-3" style={{ height: 180 }}>
        {/* Y axis labels */}
        <div className="flex w-6 shrink-0 flex-col justify-between pb-7">
          {[200, 150, 100, 50, 0].map(v => (
            <span key={v} className="text-right text-[9px]" style={{ color: tokens.textMuted }}>{v}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex flex-1 items-end gap-3">
          {weeklyAttendanceData.map((d, idx) => {
            const h = hovered === idx;
            // Each category gets its own bar, scaled to total
            const pH = (d.present / total) * 100;
            const lH = (d.late / total) * 100;
            const aH = (d.absent / total) * 100;

            return (
              <div key={d.day} className="relative flex flex-1 cursor-pointer flex-col items-center"
                onMouseEnter={() => setHovered(idx)} onMouseLeave={() => setHovered(null)}>

                {/* Tooltip */}
                {h && (
                  <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 min-w-[140px] -translate-x-1/2 rounded-[10px] border px-3.5 py-2.5 shadow-lg"
                    style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                    <p className="mb-1.5 text-[12px] font-bold" style={{ color: tokens.textPrimary }}>{d.day}</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-[2px] bg-[#34d399]" />
                          <span className="text-[11px]" style={{ color: tokens.textSecondary }}>Present</span>
                        </div>
                        <span className="text-[11px] font-bold" style={{ color: '#34d399' }}>{d.present}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-[2px] bg-[#f59e0b]" />
                          <span className="text-[11px]" style={{ color: tokens.textSecondary }}>Late</span>
                        </div>
                        <span className="text-[11px] font-bold" style={{ color: '#f59e0b' }}>{d.late}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-[2px] bg-[#f87171]" />
                          <span className="text-[11px]" style={{ color: tokens.textSecondary }}>Absent</span>
                        </div>
                        <span className="text-[11px] font-bold" style={{ color: '#f87171' }}>{d.absent}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-[-5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r" style={{ background: tokens.bgCard, borderColor: tokens.border }} />
                  </div>
                )}

                {/* 3 grouped bars per day */}
                <div className="mb-2 flex w-full flex-1 items-end justify-center gap-[3px]">
                  {/* Present bar */}
                  <div className="flex-1 rounded-t-[4px] transition-all duration-500"
                    style={{
                      height: `${pH}%`, minHeight: 4,
                      background: h ? 'linear-gradient(180deg,#6ee7b7,#34d399)' : 'linear-gradient(180deg,#34d399,#16a34a)',
                      boxShadow: h ? '0 0 12px rgba(52,211,153,0.3)' : 'none',
                    }} />
                  {/* Late bar */}
                  <div className="flex-1 rounded-t-[4px] transition-all duration-500"
                    style={{
                      height: `${lH}%`, minHeight: 4,
                      background: h ? 'linear-gradient(180deg,#fbbf24,#f59e0b)' : 'linear-gradient(180deg,#f59e0b,#d97706)',
                      boxShadow: h ? '0 0 12px rgba(245,158,11,0.3)' : 'none',
                    }} />
                  {/* Absent bar */}
                  <div className="flex-1 rounded-t-[4px] transition-all duration-500"
                    style={{
                      height: `${aH}%`, minHeight: 4,
                      background: h ? 'linear-gradient(180deg,#fca5a5,#f87171)' : 'linear-gradient(180deg,#f87171,#dc2626)',
                      boxShadow: h ? '0 0 12px rgba(248,113,113,0.3)' : 'none',
                    }} />
                </div>

                <span className={`text-[11px] font-semibold transition-colors`}
                  style={{ color: h ? '#818cf8' : tokens.textMuted }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary row */}
      <div className="mt-4 flex justify-between border-t pt-4" style={{ borderColor: tokens.borderSide }}>
        {[
          { label: 'Avg. present', value: `${Math.round(weeklyAttendanceData.reduce((a, d) => a + d.present, 0) / 5)}`, color: '#34d399' },
          { label: 'Avg. late', value: `${Math.round(weeklyAttendanceData.reduce((a, d) => a + d.late, 0) / 5)}`, color: '#f59e0b' },
          { label: 'Avg. absent', value: `${Math.round(weeklyAttendanceData.reduce((a, d) => a + d.absent, 0) / 5)}`, color: '#f87171' },
          { label: 'Best day', value: 'Wed', color: '#818cf8' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className="text-[15px] font-bold" style={{ color }}>{value}</p>
            <p className="mt-0.5 text-[10px]" style={{ color: tokens.textMuted }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// QUICK ACTIONS — Pending requests from dashboard
// ============================================================================
function QuickActions({ tokens, onNavigateReports }) {
  const [pending, setPending] = useState(() => initialReportsData.filter(r => r.status === 'Pending'));
  const handleAction = (id, action) => {
    setPending(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="anim-card rounded-[16px] border p-5" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '400ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>Pending Requests</p>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f59e0b]/15 px-1.5 text-[10px] font-bold text-[#f59e0b]">{pending.length}</span>
        </div>
        <button onClick={onNavigateReports} className="text-[11px] font-medium text-[#818cf8] transition-colors hover:text-[#a5b4fc]">View all</button>
      </div>
      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6" style={{ color: tokens.textMuted }}>
          <CheckCircle2 size={24} className="opacity-40" />
          <p className="text-[12px]">All caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pending.slice(0, 4).map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-[10px] border px-3.5 py-2.5 transition-all"
              style={{ borderColor: tokens.border }}
              onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold" style={{ color: tokens.textPrimary }}>{r.employee}</p>
                <p className="mt-0.5 truncate text-[10px]" style={{ color: tokens.textMuted }}>{r.type}: {r.desc}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => handleAction(r.id, 'approve')}
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)', color: '#34d399' }}
                  aria-label="Approve"><Check size={13} /></button>
                <button onClick={() => handleAction(r.id, 'reject')}
                  className="flex h-7 w-7 items-center justify-center rounded-[6px] border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}
                  aria-label="Reject"><XCircleIcon size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACTIVITY MODAL
// ============================================================================
function ActivityModal({ event, onClose, tokens }) {
  const cfg = eventTypeConfig[event.type];
  const gradIdx = recentEvents.findIndex(e => e.name === event.name) % avatarGradients.length;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-[400px] overflow-hidden rounded-[20px] border shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="relative px-6 pb-6 pt-7" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.03))' }}>
          <button onClick={onClose} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition-colors" style={{ background: tokens.bgInput, color: tokens.textSecondary }} aria-label="Close">
            <X size={14} />
          </button>
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${avatarGradients[gradIdx]} text-[18px] font-bold text-white`}>{getInitials(event.name)}</div>
            <div>
              <p className="text-[18px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>{event.name}</p>
              <p className="mt-0.5 text-[13px]" style={{ color: tokens.textSecondary }}>{event.role}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-[3px] text-[11px] font-bold ${cfg.textColor} ${cfg.bg} ${cfg.border}`}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.dot }} />{cfg.fullLabel}
            </span>
            <span className="text-[12px]" style={{ color: tokens.textMuted }}>{event.time}</span>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: tokens.textMuted }}>Details</p>
          <div className="flex flex-col gap-3">
            {[
              { Icon: Building2, label: 'Department', value: event.dept },
              { Icon: Calendar, label: 'Date', value: today },
              { Icon: UserCheck, label: 'Email', value: event.email },
              { Icon: Clock, label: 'Time', value: event.time },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]" style={{ background: tokens.bgInput }}>
                  <Icon size={13} style={{ color: tokens.textSecondary }} />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em]" style={{ color: tokens.textMuted }}>{label}</p>
                  <p className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2.5 border-t px-6 py-4" style={{ borderColor: tokens.border }}>
          <button onClick={onClose} className="flex-1 rounded-[10px] border py-2 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Close</button>
          <button className="flex-1 rounded-[10px] py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', border: 'none', cursor: 'pointer' }}>View Profile</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function AdminDashboard({ onLogout, onNav }) {
  const tokens = useTokens();
  const { isDark } = useTheme();

  const [animStart, setAnimStart] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimStart(true), 120); return () => clearTimeout(t); }, []);

  const deptNames = ['All', ...departmentData.map(d => d.name)];
  const [activeDept, setActiveDept] = useState('All');
  const visibleDepts = activeDept === 'All' ? departmentData : departmentData.filter(d => d.name === activeDept);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);

  // ── Greeting dinámico ──
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  // ── KPIs dinámicos desde employeesData ──
  const kpis = useMemo(() => {
    const total = employeesData.length;
    const onTime = employeesData.filter(e => e.status === 'On Time').length;
    const late = employeesData.filter(e => e.status === 'Late').length;
    const onLeave = employeesData.filter(e => e.status === 'On Leave').length;
    return [
      { label: 'Present Today', value: String(onTime), sub: `/ ${total} employees`, trend: '+4 vs yesterday', Icon: CheckCircle2, valueColor: '#34d399', iconBg: 'rgba(52,211,153,0.08)', iconColor: '#34d399', cardBorder: 'rgba(52,211,153,0.15)', glowBg: 'rgba(52,211,153,0.08)' },
      { label: 'Late Arrivals', value: String(late), sub: 'Today', trend: '-2 vs yesterday', Icon: Clock, valueColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.08)', iconColor: '#f59e0b', cardBorder: 'rgba(245,158,11,0.15)', glowBg: 'rgba(245,158,11,0.08)' },
      { label: 'On Leave', value: String(onLeave), sub: 'Approved absences', trend: '3 pending approval', Icon: MapPin, valueColor: '#818cf8', iconBg: 'rgba(129,140,248,0.08)', iconColor: '#818cf8', cardBorder: 'rgba(129,140,248,0.15)', glowBg: 'rgba(129,140,248,0.08)' },
    ];
  }, []);

  // Unread count for bell badge
  const unreadCount = notificationsData.filter(n => !n.read).length;

  return (
    <AppLayout role="admin" activePage="dashboard" onNav={onNav} onLogout={onLogout}>
      {/* Animaciones */}
      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .anim-card { animation: cardIn 0.4s ease both; }
      `}</style>

      <div className="p-8">
        {/* Header con saludo */}
        <div className="anim-card relative z-20 mb-8 flex items-start justify-between" style={{ animationDelay: '0ms' }}>
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>
              Good {greeting}, {userProfiles.admin.name.split(' ')[0]}
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: tokens.textSecondary }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Campana con dropdown */}
            <div className="relative z-[60]">
              <button onClick={() => setShowNotifs(!showNotifs)}
                className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border transition-all"
                style={{ borderColor: showNotifs ? '#818cf8' : tokens.border, background: showNotifs ? 'rgba(99,102,241,0.1)' : tokens.bgCard }}
                aria-label="Notifications">
                <Bell size={15} style={{ color: showNotifs ? '#818cf8' : tokens.textSecondary }} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f87171] px-1 text-[9px] font-bold text-white">{unreadCount}</span>
                )}
              </button>
              {showNotifs && <NotificationsDropdown tokens={tokens} onClose={() => setShowNotifs(false)} />}
            </div>
            <div className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium" style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
              Week 9 / 2026
            </div>
          </div>
        </div>

        {/* KPI Cards — dinámicos */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {kpis.map((card, i) => (
            <StatCard key={card.label} {...card} tokens={tokens} animStart={animStart} delay={80 + i * 80} />
          ))}
        </div>

        {/* Chart + Quick Actions row */}
        <div className="mb-6 grid grid-cols-[1fr_320px] gap-5">
          <WeeklyChart tokens={tokens} />
          <QuickActions tokens={tokens} onNavigateReports={() => onNav?.('reports')} />
        </div>

        {/* Department + Live Activity */}
        <div className="grid grid-cols-[1fr_320px] gap-5">

          {/* Departments — clickable to navigate */}
          <div>
            <div className="anim-card mb-4 flex flex-wrap items-center justify-between gap-2" style={{ animationDelay: '450ms' }}>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>Department Overview</h2>
                <div className="flex items-center gap-1" role="tablist">
                  {deptNames.map(dept => (
                    <button key={dept} onClick={() => setActiveDept(dept)} role="tab" aria-selected={activeDept === dept}
                      className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold transition-all ${activeDept === dept ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                      style={{ color: activeDept === dept ? undefined : tokens.textSecondary }}>{dept}</button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onNav?.('employees')}
                className="flex items-center gap-1 rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-all"
                style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary; e.currentTarget.style.background = 'transparent'; }}>
                All employees <ChevronRight size={12} />
              </button>
            </div>

            <div className={`grid gap-3.5 ${visibleDepts.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {visibleDepts.map((dept, dIdx) => {
                const pct = Math.round((dept.present / dept.total) * 100);
                const isWarning = dept.status === 'warning';
                return (
                  <div key={dept.name}
                    className="anim-card cursor-pointer rounded-[16px] border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
                    style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: `${500 + dIdx * 60}ms` }}
                    onClick={() => onNav?.('employees', { dept: dept.name })}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = dept.color + '50'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; }}>
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <p className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>{dept.name}</p>
                        <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>Department</p>
                      </div>
                      <span className="rounded-full border px-2.5 py-0.5 text-[12px] font-semibold" style={{
                        borderColor: isWarning ? 'rgba(245,158,11,0.2)' : 'rgba(52,211,153,0.2)',
                        background: isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(52,211,153,0.1)',
                        color: isWarning ? '#f59e0b' : '#34d399',
                      }}>{pct}%</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <CircleProgress present={dept.present} total={dept.total} color={dept.color} tokens={tokens} />
                      <div className="flex-1">
                        <div className="mb-3">
                          <p className="mb-1.5 text-[11px]" style={{ color: tokens.textSecondary }}>Attendance rate</p>
                          <div className="h-[5px] overflow-hidden rounded-full" style={{ background: tokens.bgInput }}>
                            <div className={`h-full rounded-full ${dept.barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
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

          {/* Live Activity */}
          <div>
            <div className="anim-card mb-4 mt-2 flex items-center justify-between" style={{ animationDelay: '500ms' }}>
              <h2 className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>Live Activity</h2>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#34d399]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399] shadow-[0_0_6px_rgba(52,211,94,0.6)]" />Live
              </div>
            </div>

            <div className="anim-card rounded-[16px] border" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '550ms' }}>
              {recentEvents.map((ev, idx) => {
                const cfg = eventTypeConfig[ev.type];
                return (
                  <button key={idx} onClick={() => setSelectedEvent(ev)}
                    className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-all duration-150 first:rounded-t-[16px] last:rounded-b-[16px]"
                    style={{ borderBottom: idx < recentEvents.length - 1 ? `1px solid ${tokens.borderSide}` : 'none', background: 'transparent', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <div className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} text-[11px] font-bold text-white`}>
                      {getInitials(ev.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{ev.name}</p>
                      <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>{ev.dept} · {ev.time}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] ${cfg.textColor} ${cfg.bg} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="anim-card mt-3.5 grid grid-cols-2 gap-2.5" style={{ animationDelay: '600ms' }}>
              {[
                { label: 'Total checked in', value: String(employeesData.filter(e => e.status === 'On Time').length), color: '#34d399' },
                { label: 'Still pending', value: String(employeesData.filter(e => e.status !== 'On Time').length), color: tokens.textSecondary },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-[12px] border p-3.5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                  <p className="text-[20px] font-bold tracking-[-0.02em]" style={{ color }}>{value}</p>
                  <p className="mt-1 text-[10px] font-medium" style={{ color: tokens.textSecondary }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && <ActivityModal event={selectedEvent} onClose={() => setSelectedEvent(null)} tokens={tokens} />}
    </AppLayout>
  );
}