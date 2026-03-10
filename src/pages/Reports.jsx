import React, { useState, useMemo } from 'react';
import {
  Download, Search, Filter, Plus, X, Check, XCircle as XCircleIcon,
  ChevronUp, ChevronDown, ChevronsUpDown, Users, User,
  FileText,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import { useData } from '../contexts/DataContext';
import AppLayout from '../components/AppLayout';
import {
  reportStatusStyles, reportTypeConfig,
  CURRENT_EMPLOYEE, departments,
} from '../data/reportsData';
import { getInitials, avatarGradients } from '../data/mockData';

// ============================================================================
// MODAL: NEW REQUEST (Solo para empleados)
// ============================================================================
function NewRequestModal({ onClose, tokens }) {
  const { addReport } = useData();
  const [type, setType]   = useState('Vacation');
  const [desc, setDesc]   = useState('');
  const [date, setDate]   = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!desc.trim()) { setError('Please enter a description.'); return; }
    if (!date)        { setError('Please select a date.'); return; }
    const d       = new Date(date);
    const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const pad     = (n) => n.toString().padStart(2, '0');
    const dateStr = `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
    const nextId  = `REQ-${String(Math.floor(Math.random() * 900) + 100)}`;
    addReport({
      id: nextId, date: dateStr, dateRaw: d, type, desc: desc.trim(),
      status: 'Pending',
      icon: reportTypeConfig[type]?.icon || FileText,
      employee: CURRENT_EMPLOYEE, dept: 'IT',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="New Request">
      <div className="w-full max-w-[460px] rounded-[20px] border p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              <Plus size={15} className="text-white" />
            </div>
            <p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>New Request</p>
          </div>
          <button onClick={onClose} style={{ color: tokens.textSecondary }} className="transition-colors hover:text-[#e2e8f0]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(reportTypeConfig).map(([key, cfg]) => {
                const I = cfg.icon;
                return (
                  <button key={key} onClick={() => setType(key)}
                    className={`flex flex-col items-center gap-1.5 rounded-[10px] border py-2.5 text-[11px] font-semibold transition-all
                      ${type === key ? 'border-[#6366f1]/40 bg-[#6366f1]/15 text-[#818cf8]' : 'hover:border-[#2a2f3a]'}`}
                    style={{ borderColor: type === key ? undefined : tokens.border, color: type === key ? undefined : tokens.textSecondary }}>
                    <I size={16} />{cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Date *</label>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); setError(''); }}
              className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark]"
              style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Description *</label>
            <input type="text" value={desc} onChange={e => { setDesc(e.target.value); setError(''); }}
              placeholder="Brief description..."
              className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1]"
              style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
          </div>
          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          <button onClick={handleSubmit}
            className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', border: 'none', cursor: 'pointer' }}>
            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL: CONFIRMAR ACCIÓN DEL ADMIN
// ============================================================================
function ConfirmModal({ action, request, onConfirm, onClose, tokens }) {
  const isApprove = action === 'approve';
  const color     = isApprove ? '#34d399' : '#f87171';
  const bgGrad    = isApprove ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#ef4444,#dc2626)';
  const shadow    = isApprove ? '0 4px 16px rgba(22,163,74,0.3)' : '0 4px 16px rgba(239,68,68,0.3)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[400px] rounded-[20px] border p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}>
            {isApprove ? <Check size={18} style={{ color }} /> : <XCircleIcon size={18} style={{ color }} />}
          </div>
          <div>
            <p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>
              {isApprove ? 'Approve Request' : 'Reject Request'}
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: tokens.textSecondary }}>This action will notify the employee.</p>
          </div>
        </div>

        <div className="mb-6 rounded-[12px] border p-4" style={{ background: tokens.bgInput, borderColor: tokens.border }}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{request.id}</p>
            <span className="text-[11px] font-medium" style={{ color: tokens.textSecondary }}>{request.date}</span>
          </div>
          <p className="mt-1 text-[12px]" style={{ color: tokens.textSecondary }}>{request.employee} · {request.dept}</p>
          <p className="mt-1 text-[12px]" style={{ color: tokens.textSecondary }}>{request.type}: {request.desc}</p>
        </div>

        <div className="flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          <button onClick={onConfirm}
            className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: bgGrad, boxShadow: shadow, border: 'none', cursor: 'pointer' }}>
            {isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SORT ICON
// ============================================================================
function SortIcon({ col, sortCol, sortDir, tokens }) {
  if (sortCol !== col) return <ChevronsUpDown size={12} style={{ color: tokens.textMuted }} />;
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="text-[#818cf8]" />
    : <ChevronDown size={12} className="text-[#818cf8]" />;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function ReportsPage({ role = 'employee', onLogout, onNav }) {
  const tokens  = useTokens();
  const isAdmin = role === 'admin';
  const { reports, addReport, updateReportStatus, deleteReport } = useData();

  const [activeTab,    setActiveTab]    = useState('All');
  const [search,       setSearch]       = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [sortCol,      setSortCol]      = useState('dateRaw');
  const [sortDir,      setSortDir]      = useState('desc');
  const [deptFilter,   setDeptFilter]   = useState('All');
  const [confirmAction, setConfirmAction] = useState(null);

  const tabs = ['All', 'Vacations', 'Medical', 'Incidents', 'Timesheet'];

  const handleSort = (col) => {
    if (sortCol === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortCol(col); setSortDir('asc'); }
  };

  // ── KPI dinámicos ──
  const kpiCards = useMemo(() => {
    const visibleReports = isAdmin ? reports : reports.filter(r => r.employee === CURRENT_EMPLOYEE);
    const pending  = visibleReports.filter(r => r.status === 'Pending').length;
    const approved = visibleReports.filter(r => r.status === 'Approved').length;
    const rejected = visibleReports.filter(r => r.status === 'Rejected').length;
    const total    = visibleReports.length;

    if (isAdmin) {
      return [
        { title: 'Total Requests',    value: String(total),    sub: 'All employees', color: '#818cf8' },
        { title: 'Pending Review',    value: String(pending),  sub: 'Needs your action', color: '#f59e0b' },
        { title: 'Approved',          value: String(approved), sub: 'This period',   color: '#34d399' },
        { title: 'Rejected',          value: String(rejected), sub: 'This period',   color: '#f87171' },
      ];
    }
    return [
      { title: 'My Requests',        value: String(total),    sub: 'Total submitted', color: '#818cf8' },
      { title: 'Pending',            value: String(pending),  sub: 'Awaiting review', color: '#f59e0b' },
      { title: 'Approved',           value: String(approved), sub: 'Accepted',        color: '#34d399' },
      { title: 'Rejected',           value: String(rejected), sub: 'Declined',        color: '#f87171' },
    ];
  }, [reports, isAdmin]);

  // ── Filtrado + Búsqueda + Ordenación ──
  const filtered = useMemo(() => {
    let rows = [...reports];
    if (!isAdmin) rows = rows.filter(r => r.employee === CURRENT_EMPLOYEE);
    if (isAdmin && deptFilter !== 'All') rows = rows.filter(r => r.dept === deptFilter);
    if (activeTab !== 'All') {
      const map = { Vacations: 'Vacation', Medical: 'Medical', Incidents: 'Incident', Timesheet: 'Timesheet' };
      rows = rows.filter(r => r.type === map[activeTab]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.id.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) || r.status.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q) || r.employee.toLowerCase().includes(q) ||
        r.dept.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      let va = a[sortCol]; let vb = b[sortCol];
      if (sortCol === 'dateRaw') { va = va.getTime(); vb = vb.getTime(); }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [reports, activeTab, search, sortCol, sortDir, isAdmin, deptFilter]);

  const handleStatusChange = (id, newStatus) => {
    updateReportStatus(id, newStatus);
    setConfirmAction(null);
  };

  const handleCancel = (id) => deleteReport(id);

  const ColHeader = ({ col, label }) => (
    <button onClick={() => handleSort(col)}
      className="flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-[0.05em] transition-colors hover:text-[#818cf8]"
      style={{ color: tokens.textMuted }}>
      {label}
      <SortIcon col={col} sortCol={sortCol} sortDir={sortDir} tokens={tokens} />
    </button>
  );

  // Grid responsive: en mobile mostramos como cards en vez de tabla
  const gridCols = isAdmin
    ? 'grid-cols-[minmax(200px,2.2fr)_minmax(100px,1.2fr)_minmax(160px,2.5fr)_minmax(100px,1fr)_minmax(180px,1.5fr)]'
    : 'grid-cols-[minmax(120px,1.2fr)_minmax(120px,1.5fr)_minmax(200px,3fr)_minmax(100px,1.2fr)_minmax(80px,0.8fr)]';

  return (
    <AppLayout role={role} activePage="reports" onNav={onNav} onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1200px]">

          {/* ── HEADER — responsive ── */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]" style={{ color: tokens.textPrimary }}>
                  {isAdmin ? 'Team Reports' : 'My Reports'}
                </h1>
                {isAdmin && (
                  <span className="flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-[11px] font-bold" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                    <Users size={12} /> Admin View
                  </span>
                )}
                {!isAdmin && (
                  <span className="flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-[11px] font-bold" style={{ borderColor: 'rgba(129,140,248,0.2)', background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>
                    <User size={12} /> {CURRENT_EMPLOYEE}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] sm:text-[14px]" style={{ color: tokens.textSecondary }}>
                {isAdmin ? 'Review and manage all employee requests and incidents.' : 'Track your requests, absences, and logged incidents.'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {isAdmin && (
                <button className="flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-all hover:bg-white/5"
                  style={{ borderColor: tokens.border, background: tokens.bgCard, color: tokens.textPrimary }}>
                  <Download size={15} /> Export
                </button>
              )}
              {!isAdmin && (
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}>
                  <Plus size={15} strokeWidth={2.5} /> New Request
                </button>
              )}
            </div>
          </div>

          {/* ── KPI CARDS — responsive grid ── */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-4 sm:gap-4">
            {kpiCards.map((card, i) => (
              <div key={i} className="rounded-[16px] border p-4 sm:p-5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.06em] sm:mb-3 sm:text-[11px]" style={{ color: tokens.textSecondary }}>{card.title}</p>
                <p className="text-[24px] font-bold leading-none tracking-[-0.02em] sm:text-[30px]" style={{ color: card.color }}>{card.value}</p>
                <p className="mt-1.5 text-[10px] sm:mt-2 sm:text-[11px]" style={{ color: tokens.textMuted }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── TABLE CARD ── */}
          <div className="overflow-hidden rounded-[16px] border sm:rounded-[20px]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>

            {/* Toolbar — responsive wrapping */}
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:py-4" style={{ borderColor: tokens.borderSide }}>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by type">
                  {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} role="tab" aria-selected={activeTab === tab}
                      className={`rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold transition-all sm:px-3 sm:text-[12px]
                        ${activeTab === tab ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                      style={{ color: activeTab === tab ? undefined : tokens.textSecondary }}>
                      {tab}
                    </button>
                  ))}
                </div>

                {isAdmin && (
                  <>
                    <div className="hidden h-4 w-px sm:block" style={{ background: tokens.border }} />
                    <div className="flex flex-wrap gap-0.5">
                      {departments.map(d => (
                        <button key={d} onClick={() => setDeptFilter(d)}
                          className={`rounded-[6px] px-2 py-1 text-[11px] font-semibold transition-all
                            ${deptFilter === d ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                          style={{ color: deptFilter === d ? undefined : tokens.textMuted }}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} aria-hidden="true" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={isAdmin ? 'Search by name, dept...' : 'Search reports...'}
                  aria-label="Search reports"
                  className="w-full rounded-[8px] border py-1.5 pl-8 pr-3 text-[12px] outline-none transition-colors focus:border-[#6366f1] sm:w-[200px]"
                  style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors hover:text-[#e2e8f0]" style={{ color: tokens.textMuted }} aria-label="Clear search">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Table — hidden on mobile, show cards instead */}
            <div className="hidden px-6 py-1 sm:block">
              {/* Column headers */}
              {isAdmin ? (
                <div className={`grid ${gridCols} items-center gap-5 py-3.5`}>
                  <ColHeader col="employee" label="Employee" />
                  <ColHeader col="type"     label="Type" />
                  <ColHeader col="desc"     label="Description" />
                  <ColHeader col="status"   label="Status" />
                  <span className="text-right text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Actions</span>
                </div>
              ) : (
                <div className={`grid ${gridCols} items-center gap-5 py-3.5`}>
                  <ColHeader col="id"     label="ID / Date" />
                  <ColHeader col="type"   label="Type" />
                  <ColHeader col="desc"   label="Description" />
                  <ColHeader col="status" label="Status" />
                  <span className="text-right text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Actions</span>
                </div>
              )}

              {/* Rows */}
              <div className="flex flex-col">
                {filtered.map((row) => {
                  const ss = reportStatusStyles[row.status];
                  const SI = ss.icon;
                  const RI = row.icon;
                  const isPending = row.status === 'Pending';

                  if (isAdmin) {
                    const empIdx = reports.findIndex(r => r.employee === row.employee);
                    return (
                      <div key={row.id}
                        className={`group grid ${gridCols} items-center gap-5 border-b py-3.5 last:border-none rounded-[10px] -mx-3 px-3 transition-all duration-150`}
                        style={{ borderColor: tokens.borderSide }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.borderColor = 'transparent'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = tokens.borderSide; }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${avatarGradients[Math.abs(empIdx) % avatarGradients.length]} text-[11px] font-bold text-white shadow-sm`} aria-hidden="true">
                            {getInitials(row.employee)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold leading-tight" style={{ color: tokens.textPrimary }}>{row.employee}</p>
                            <p className="mt-0.5 text-[11px] leading-tight" style={{ color: tokens.textMuted }}>{row.dept} · {row.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]" style={{ background: tokens.bgInput }}>
                            <RI size={13} style={{ color: tokens.textSecondary }} />
                          </div>
                          <span className="text-[12px] font-medium" style={{ color: tokens.textPrimary }}>{row.type}</span>
                        </div>
                        <p className="truncate text-[12px] leading-relaxed" style={{ color: tokens.textSecondary }}>{row.desc}</p>
                        <div>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-[3px] ${ss.bg} ${ss.border} ${ss.text}`}>
                            <SI size={11} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold tracking-wide">{row.status}</span>
                          </span>
                        </div>
                        <div className="flex justify-end gap-2">
                          {isPending ? (
                            <>
                              <button onClick={() => setConfirmAction({ action: 'approve', request: row })}
                                className="flex h-[30px] items-center gap-1.5 rounded-[8px] border px-3 text-[11px] font-semibold transition-all hover:shadow-[0_4px_12px_rgba(52,211,153,0.2)] hover:-translate-y-0.5 active:translate-y-0"
                                style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)', color: '#34d399' }}
                                aria-label={`Approve request ${row.id}`}>
                                <Check size={12} /> Approve
                              </button>
                              <button onClick={() => setConfirmAction({ action: 'reject', request: row })}
                                className="flex h-[30px] items-center gap-1.5 rounded-[8px] border px-3 text-[11px] font-semibold transition-all hover:shadow-[0_4px_12px_rgba(248,113,113,0.2)] hover:-translate-y-0.5 active:translate-y-0"
                                style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}
                                aria-label={`Reject request ${row.id}`}>
                                <XCircleIcon size={12} /> Reject
                              </button>
                            </>
                          ) : (
                            <span className="pr-2 text-[11px]" style={{ color: tokens.textMuted }}>—</span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={row.id}
                      className={`group grid ${gridCols} items-center gap-5 border-b py-3.5 last:border-none rounded-[10px] -mx-3 px-3 transition-all duration-150`}
                      style={{ borderColor: tokens.borderSide }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.borderColor = 'transparent'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = tokens.borderSide; }}>
                      <div>
                        <p className="text-[13px] font-semibold leading-tight" style={{ color: tokens.textPrimary }}>{row.id}</p>
                        <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>{row.date}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]" style={{ background: tokens.bgInput }}>
                          <RI size={14} style={{ color: tokens.textSecondary }} />
                        </div>
                        <span className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{row.type}</span>
                      </div>
                      <p className="truncate text-[13px]" style={{ color: tokens.textSecondary }}>{row.desc}</p>
                      <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-[3px] ${ss.bg} ${ss.border} ${ss.text}`}>
                          <SI size={12} strokeWidth={2.5} />
                          <span className="text-[11px] font-bold tracking-wide">{row.status}</span>
                        </span>
                      </div>
                      <div className="flex justify-end">
                        {isPending ? (
                          <button onClick={() => handleCancel(row.id)}
                            className="flex h-[28px] items-center gap-1.5 rounded-[8px] border px-3 text-[11px] font-semibold transition-all hover:shadow-[0_4px_12px_rgba(248,113,113,0.2)] hover:-translate-y-0.5 active:translate-y-0"
                            style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}
                            aria-label={`Cancel request ${row.id}`}>
                            <X size={11} /> Cancel
                          </button>
                        ) : (
                          <span className="pr-2 text-[11px]" style={{ color: tokens.textMuted }}>—</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-14" style={{ color: tokens.textMuted }}>
                    <Search size={28} className="opacity-40" />
                    <p className="text-[14px] font-medium">
                      {search ? `No results for "${search}"` : 'No records found.'}
                    </p>
                    {search && (
                      <button onClick={() => setSearch('')} className="mt-1 text-[12px] text-[#818cf8] underline underline-offset-2">Clear search</button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile card view */}
            <div className="flex flex-col gap-3 p-4 sm:hidden">
              {filtered.map((row) => {
                const ss = reportStatusStyles[row.status];
                const SI = ss.icon;
                const isPending = row.status === 'Pending';
                return (
                  <div key={row.id} className="rounded-[12px] border p-4" style={{ background: tokens.bgInput, borderColor: tokens.border }}>
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{row.id}</p>
                        {isAdmin && <p className="mt-0.5 text-[11px]" style={{ color: tokens.textSecondary }}>{row.employee} · {row.dept}</p>}
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-[2px] ${ss.bg} ${ss.border} ${ss.text}`}>
                        <SI size={10} strokeWidth={2.5} />
                        <span className="text-[9px] font-bold">{row.status}</span>
                      </span>
                    </div>
                    <p className="text-[12px] font-medium" style={{ color: tokens.textPrimary }}>{row.type}: {row.desc}</p>
                    <p className="mt-1 text-[11px]" style={{ color: tokens.textMuted }}>{row.date}</p>
                    {isPending && (
                      <div className="mt-3 flex gap-2">
                        {isAdmin ? (
                          <>
                            <button onClick={() => setConfirmAction({ action: 'approve', request: row })}
                              className="flex-1 rounded-[8px] border py-1.5 text-[11px] font-semibold"
                              style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)', color: '#34d399' }}>
                              Approve
                            </button>
                            <button onClick={() => setConfirmAction({ action: 'reject', request: row })}
                              className="flex-1 rounded-[8px] border py-1.5 text-[11px] font-semibold"
                              style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
                              Reject
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleCancel(row.id)}
                            className="rounded-[8px] border px-3 py-1.5 text-[11px] font-semibold"
                            style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-10" style={{ color: tokens.textMuted }}>
                  <Search size={24} className="opacity-40" />
                  <p className="text-[13px] font-medium">{search ? `No results for "${search}"` : 'No records found.'}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6" style={{ borderColor: tokens.borderSide }}>
              <p className="text-[11px] sm:text-[12px]" style={{ color: tokens.textMuted }}>
                {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
                {search && ` matching "${search}"`}
                {isAdmin && deptFilter !== 'All' && ` in ${deptFilter}`}
              </p>
              <p className="text-[11px] sm:text-[12px]" style={{ color: tokens.textMuted }}>
                {isAdmin ? `${reports.length} total` : `${reports.filter(r => r.employee === CURRENT_EMPLOYEE).length} total`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && <NewRequestModal onClose={() => setShowModal(false)} tokens={tokens} />}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction.action}
          request={confirmAction.request}
          onConfirm={() => handleStatusChange(confirmAction.request.id, confirmAction.action === 'approve' ? 'Approved' : 'Rejected')}
          onClose={() => setConfirmAction(null)}
          tokens={tokens}
        />
      )}
    </AppLayout>
  );
}