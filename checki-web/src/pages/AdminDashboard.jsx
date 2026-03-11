import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2, Clock, MapPin, Bell, ChevronRight, Check,
  X, Calendar, Building2, UserCheck, Users, AlertCircle,
  XCircle as XCircleIcon,
} from 'lucide-react';
import { useTokens, useTheme } from '../contexts/Themecontext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import AppLayout from '../components/AppLayout';
import NotificationsDropdown from '../components/NotificationsDropdown';
import useCountUp from '../hooks/useCountUp';
import { avatarGradients, getInitials, eventTypeConfig } from '../data/mockData';
import { employees as employeesApi, attendance as attendanceApi } from '../services/api';

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
        <p className="text-[18px] font-bold leading-none sm:text-[20px]" style={{ color: tokens.textPrimary }}>{present}</p>
        <p className="mt-1 text-[10px] font-medium" style={{ color: tokens.textSecondary }}>/ {total}</p>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================
function StatCard({ label, value, sub, trend, Icon, valueColor, iconBg, iconColor, cardBorder, glowBg, tokens, animStart, delay }) {
  const animated = useCountUp(parseInt(value, 10) || 0, 1200, animStart);
  return (
    <div className="anim-card relative overflow-hidden rounded-[16px] border p-4 transition-all hover:-translate-y-0.5 sm:p-6"
      style={{ background: tokens.bgCard, borderColor: cardBorder, animationDelay: `${delay}ms` }}>
      <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full" style={{ background: glowBg }} />
      <div className="mb-3 flex items-start justify-between sm:mb-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] sm:text-[11px]" style={{ color: tokens.textSecondary }}>{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-[8px] sm:h-8 sm:w-8" style={{ background: iconBg }}>
          <Icon size={14} color={iconColor} />
        </div>
      </div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="tabular-nums text-[28px] font-bold leading-none tracking-[-0.03em] sm:text-[36px]" style={{ color: valueColor }}>{animated}</span>
        <span className="text-[11px] sm:text-[13px]" style={{ color: tokens.textSecondary }}>{sub}</span>
      </div>
      <p className="mt-2 text-[10px] sm:text-[11px]" style={{ color: tokens.textSecondary }}>{trend}</p>
    </div>
  );
}

// ============================================================================
// WEEKLY CHART — from API
// ============================================================================
function WeeklyChart({ tokens }) {
  const [hovered, setHovered] = useState(null);
  const [weekData, setWeekData] = useState([]);
  const total = 200;

  useEffect(() => {
    attendanceApi.weeklyStats().then(data => {
      if (data && data.length > 0) setWeekData(data);
    }).catch(() => {
      // Fallback si no hay datos
      setWeekData([
        { day_name: 'Monday', present: 182, late: 10, absent: 8 },
        { day_name: 'Tuesday', present: 178, late: 14, absent: 8 },
        { day_name: 'Wednesday', present: 190, late: 6, absent: 4 },
        { day_name: 'Thursday', present: 185, late: 8, absent: 7 },
        { day_name: 'Friday', present: 170, late: 12, absent: 18 },
      ]);
    });
  }, []);

  const dayLabels = weekData.map(d => (d.day_name || '').slice(0, 3));

  return (
    <div className="anim-card rounded-[16px] border p-4 sm:p-6" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '350ms' }}>
      <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[14px] font-semibold tracking-[-0.01em] sm:text-[15px]" style={{ color: tokens.textPrimary }}>Weekly Attendance</p>
          <p className="mt-0.5 text-[11px] sm:text-[12px]" style={{ color: tokens.textSecondary }}>Out of {total} employees · This week</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {[{ label: 'Present', color: '#34d399' }, { label: 'Late', color: '#f59e0b' }, { label: 'Absent', color: '#f87171' }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-[3px]" style={{ background: l.color }} />
              <span className="text-[10px] sm:text-[11px]" style={{ color: tokens.textSecondary }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3" style={{ height: 180 }}>
        <div className="flex w-6 shrink-0 flex-col justify-between pb-7">
          {[200, 150, 100, 50, 0].map(v => <span key={v} className="text-right text-[9px]" style={{ color: tokens.textMuted }}>{v}</span>)}
        </div>
        <div className="flex flex-1 items-end gap-2 sm:gap-3">
          {weekData.map((d, idx) => {
            const h = hovered === idx;
            const pH = (d.present / total) * 100;
            const lH = (d.late / total) * 100;
            const aH = (d.absent / total) * 100;
            return (
              <div key={idx} className="relative flex flex-1 cursor-pointer flex-col items-center"
                onMouseEnter={() => setHovered(idx)} onMouseLeave={() => setHovered(null)}>
                {h && (
                  <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 min-w-[140px] -translate-x-1/2 rounded-[10px] border px-3.5 py-2.5 shadow-lg"
                    style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                    <p className="mb-1.5 text-[12px] font-bold" style={{ color: tokens.textPrimary }}>{dayLabels[idx]}</p>
                    {[{ label: 'Present', color: '#34d399', val: d.present },{ label: 'Late', color: '#f59e0b', val: d.late },{ label: 'Absent', color: '#f87171', val: d.absent }].map(item => (
                      <div key={item.label} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-[2px]" style={{ background: item.color }} /><span className="text-[11px]" style={{ color: tokens.textSecondary }}>{item.label}</span></div>
                        <span className="text-[11px] font-bold" style={{ color: item.color }}>{item.val}</span>
                      </div>
                    ))}
                    <div className="absolute bottom-[-5px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r" style={{ background: tokens.bgCard, borderColor: tokens.border }} />
                  </div>
                )}
                <div className="mb-2 flex w-full flex-1 items-end justify-center gap-[2px] sm:gap-[3px]">
                  <div className="flex-1 rounded-t-[4px] transition-all duration-500" style={{ height: `${pH}%`, minHeight: 4, background: h ? 'linear-gradient(180deg,#6ee7b7,#34d399)' : 'linear-gradient(180deg,#34d399,#16a34a)' }} />
                  <div className="flex-1 rounded-t-[4px] transition-all duration-500" style={{ height: `${lH}%`, minHeight: 4, background: h ? 'linear-gradient(180deg,#fbbf24,#f59e0b)' : 'linear-gradient(180deg,#f59e0b,#d97706)' }} />
                  <div className="flex-1 rounded-t-[4px] transition-all duration-500" style={{ height: `${aH}%`, minHeight: 4, background: h ? 'linear-gradient(180deg,#fca5a5,#f87171)' : 'linear-gradient(180deg,#f87171,#dc2626)' }} />
                </div>
                <span className="text-[10px] font-semibold sm:text-[11px]" style={{ color: h ? '#818cf8' : tokens.textMuted }}>{dayLabels[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QUICK ACTIONS — from DataContext (API)
// ============================================================================
function QuickActions({ tokens, onNavigateReports }) {
  const { pendingAdminReports, updateReportStatus } = useData();
  const handleAction = (id, action) => {
    updateReportStatus(id, action === 'approve' ? 'approved' : 'rejected');
  };
  return (
    <div className="anim-card rounded-[16px] border p-4 sm:p-5" style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: '400ms' }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold sm:text-[14px]" style={{ color: tokens.textPrimary }}>Pending Requests</p>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f59e0b]/15 px-1.5 text-[10px] font-bold text-[#f59e0b]">{pendingAdminReports.length}</span>
        </div>
        <button onClick={onNavigateReports} className="text-[11px] font-medium text-[#818cf8]">View all</button>
      </div>
      {pendingAdminReports.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6" style={{ color: tokens.textMuted }}>
          <CheckCircle2 size={24} className="opacity-40" /><p className="text-[12px]">All caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pendingAdminReports.slice(0, 4).map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-[10px] border px-3 py-2.5 transition-all"
              style={{ borderColor: tokens.border }}
              onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold" style={{ color: tokens.textPrimary }}>{r.employee_name}</p>
                <p className="mt-0.5 truncate text-[10px]" style={{ color: tokens.textMuted }}>{r.type}: {r.description}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => handleAction(r.id, 'approve')} className="flex h-7 w-7 items-center justify-center rounded-[6px] border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)', color: '#34d399' }} aria-label="Approve"><Check size={13} /></button>
                <button onClick={() => handleAction(r.id, 'reject')} className="flex h-7 w-7 items-center justify-center rounded-[6px] border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }} aria-label="Reject"><XCircleIcon size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function AdminDashboard({ onLogout, onNav }) {
  const tokens = useTokens();
  const { user } = useAuth();
  const { notifs, unreadCount } = useData();

  const [animStart, setAnimStart] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimStart(true), 120); return () => clearTimeout(t); }, []);

  const [showNotifs, setShowNotifs] = useState(false);
  const [deptStats, setDeptStats] = useState([]);
  const [employeeKpis, setEmployeeKpis] = useState({ total: 0, onTime: 0, late: 0, onLeave: 0 });
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch department stats + employees from API
  useEffect(() => {
    employeesApi.departmentStats().then(setDeptStats).catch(() => {});
    employeesApi.getAll({ limit: 5 }).then(data => {
      const emps = data.employees || [];
      setRecentActivity(emps.slice(0, 5));
      // KPIs from all employees
      employeesApi.getAll({ limit: 200 }).then(all => {
        const allEmps = all.employees || [];
        setEmployeeKpis({
          total: all.total || allEmps.length,
          onTime: allEmps.filter(e => e.attendance_status === 'on_time').length,
          late: allEmps.filter(e => e.attendance_status === 'late').length,
          onLeave: allEmps.filter(e => e.attendance_status === 'on_leave').length,
        });
      });
    }).catch(() => {});
  }, []);

  const deptNames = ['All', ...deptStats.map(d => d.name)];
  const [activeDept, setActiveDept] = useState('All');
  const visibleDepts = activeDept === 'All' ? deptStats : deptStats.filter(d => d.name === activeDept);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  const kpis = [
    { label: 'Present Today', value: String(employeeKpis.onTime), sub: `/ ${employeeKpis.total} employees`, trend: 'Today', Icon: CheckCircle2, valueColor: '#34d399', iconBg: 'rgba(52,211,153,0.08)', iconColor: '#34d399', cardBorder: 'rgba(52,211,153,0.15)', glowBg: 'rgba(52,211,153,0.08)' },
    { label: 'Late Arrivals', value: String(employeeKpis.late), sub: 'Today', trend: 'This session', Icon: Clock, valueColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.08)', iconColor: '#f59e0b', cardBorder: 'rgba(245,158,11,0.15)', glowBg: 'rgba(245,158,11,0.08)' },
    { label: 'On Leave', value: String(employeeKpis.onLeave), sub: 'Approved absences', trend: 'Active', Icon: MapPin, valueColor: '#818cf8', iconBg: 'rgba(129,140,248,0.08)', iconColor: '#818cf8', cardBorder: 'rgba(129,140,248,0.15)', glowBg: 'rgba(129,140,248,0.08)' },
  ];

  const adminTypeColors = { request: '#f59e0b', alert: '#f87171', incident: '#818cf8', info: '#34d399', success: '#34d399', error: '#f87171' };

  // Map API notifs to component format
  const mappedNotifs = notifs.map(n => ({ ...n, read: n.is_read, desc: n.description }));

  const deptColors = { IT: '#818cf8', Sales: '#f59e0b', HR: '#34d399', Marketing: '#22d3ee' };

  return (
    <AppLayout role="admin" activePage="dashboard" onNav={onNav} onLogout={onLogout}>
      <style>{`@keyframes cardIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } } .anim-card { animation: cardIn 0.4s ease both; }`}</style>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="anim-card relative z-20 mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[18px] font-semibold tracking-[-0.02em] sm:text-[22px]" style={{ color: tokens.textPrimary }}>Good {greeting}, {firstName}</h1>
            <p className="mt-1 text-[13px] sm:text-[14px]" style={{ color: tokens.textSecondary }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative z-[60]">
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border transition-all"
                style={{ borderColor: showNotifs ? '#818cf8' : tokens.border, background: showNotifs ? 'rgba(99,102,241,0.1)' : tokens.bgCard }} aria-label="Notifications">
                <Bell size={15} style={{ color: showNotifs ? '#818cf8' : tokens.textSecondary }} />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#f87171] px-1 text-[9px] font-bold text-white">{unreadCount}</span>}
              </button>
              {showNotifs && <NotificationsDropdown tokens={tokens} onClose={() => setShowNotifs(false)} notifications={mappedNotifs} typeColors={adminTypeColors} />}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
          {kpis.map((card, i) => <StatCard key={card.label} {...card} tokens={tokens} animStart={animStart} delay={80 + i * 80} />)}
        </div>

        {/* Chart + Quick Actions */}
        <div className="mb-5 grid grid-cols-1 gap-5 sm:mb-6 lg:grid-cols-[1fr_320px]">
          <WeeklyChart tokens={tokens} />
          <QuickActions tokens={tokens} onNavigateReports={() => onNav?.('reports')} />
        </div>

        {/* Department + Activity */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="anim-card mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-[14px] font-semibold sm:text-[15px]" style={{ color: tokens.textPrimary }}>Department Overview</h2>
                <div className="flex flex-wrap items-center gap-1" role="tablist">
                  {deptNames.map(dept => (
                    <button key={dept} onClick={() => setActiveDept(dept)} role="tab" aria-selected={activeDept === dept}
                      className={`rounded-[6px] px-2 py-1 text-[11px] font-semibold transition-all ${activeDept === dept ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                      style={{ color: activeDept === dept ? undefined : tokens.textSecondary }}>{dept}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => onNav?.('employees')} className="flex items-center gap-1 rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-all"
                style={{ borderColor: tokens.border, color: tokens.textSecondary }}>All employees <ChevronRight size={12} /></button>
            </div>

            <div className={`grid gap-3 sm:gap-3.5 ${visibleDepts.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {visibleDepts.map((dept, dIdx) => {
                const total = dept.total || 1;
                const pct = Math.round((dept.present / total) * 100);
                const color = deptColors[dept.name] || '#818cf8';
                return (
                  <div key={dept.name} className="anim-card cursor-pointer rounded-[16px] border p-4 transition-all duration-200 hover:-translate-y-1 sm:p-5"
                    style={{ background: tokens.bgCard, borderColor: tokens.border, animationDelay: `${500 + dIdx * 60}ms` }}
                    onClick={() => onNav?.('employees', { dept: dept.name })}>
                    <div className="mb-4 flex items-start justify-between sm:mb-5">
                      <div>
                        <p className="text-[14px] font-semibold sm:text-[15px]" style={{ color: tokens.textPrimary }}>{dept.name}</p>
                        <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>Department</p>
                      </div>
                      <span className="rounded-full border px-2.5 py-0.5 text-[12px] font-semibold" style={{
                        borderColor: pct < 50 ? 'rgba(245,158,11,0.2)' : 'rgba(52,211,153,0.2)',
                        background: pct < 50 ? 'rgba(245,158,11,0.1)' : 'rgba(52,211,153,0.1)',
                        color: pct < 50 ? '#f59e0b' : '#34d399',
                      }}>{pct}%</span>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-5">
                      <CircleProgress present={dept.present} total={total} color={color} tokens={tokens} />
                      <div className="flex-1">
                        <div className="mb-3">
                          <p className="mb-1.5 text-[11px]" style={{ color: tokens.textSecondary }}>Attendance rate</p>
                          <div className="h-[5px] overflow-hidden rounded-full" style={{ background: tokens.bgInput }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div><p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>{dept.present}</p><p className="text-[10px]" style={{ color: tokens.textSecondary }}>Present</p></div>
                          <div><p className="text-[16px] font-semibold" style={{ color: tokens.textSecondary }}>{total - dept.present}</p><p className="text-[10px]" style={{ color: tokens.textSecondary }}>Absent</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="anim-card mb-4 mt-2 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold sm:text-[15px]" style={{ color: tokens.textPrimary }}>Recent Employees</h2>
            </div>
            <div className="anim-card rounded-[16px] border" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8" style={{ color: tokens.textMuted }}><Users size={24} className="opacity-40" /><p className="text-[12px]">No activity yet</p></div>
              ) : recentActivity.map((emp, idx) => (
                <div key={emp.id} className="flex items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-[16px] last:rounded-b-[16px] sm:px-5 sm:py-3.5"
                  style={{ borderBottom: idx < recentActivity.length - 1 ? `1px solid ${tokens.borderSide}` : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <div className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} text-[11px] font-bold text-white`}>
                    {getInitials(emp.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium sm:text-[13px]" style={{ color: tokens.textPrimary }}>{emp.name}</p>
                    <p className="mt-0.5 text-[10px] sm:text-[11px]" style={{ color: tokens.textSecondary }}>{emp.dept_name} · {emp.job_title}</p>
                  </div>
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: emp.attendance_status === 'on_time' ? '#22c55e' : emp.attendance_status === 'late' ? '#f59e0b' : tokens.textSecondary }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}