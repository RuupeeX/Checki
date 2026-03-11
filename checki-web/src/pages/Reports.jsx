import React, { useState, useMemo } from 'react';
import {
  Download, Search, Plus, X, Check, XCircle as XCircleIcon,
  ChevronUp, ChevronDown, ChevronsUpDown, Users, User, FileText,
  Umbrella, Stethoscope, AlertCircle, ChevronLeft, ChevronRight,
  Calendar, Clock, Building2, Eye,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import AppLayout from '../components/AppLayout';
import { getInitials, avatarGradients } from '../data/mockData';

const DEPARTMENTS = ['All', 'IT', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations'];
const PAGE_SIZE = 8;
const TYPE_CONFIG = {
  vacation:     { icon: Umbrella,    label: 'Vacation' },
  medical:      { icon: Stethoscope, label: 'Medical' },
  incident:     { icon: AlertCircle, label: 'Incident' },
  timesheet:    { icon: FileText,    label: 'Timesheet' },
  clock_issue:  { icon: AlertCircle, label: 'Clock Issue' },
  system_error: { icon: AlertCircle, label: 'System Error' },
  other:        { icon: FileText,    label: 'Other' },
};
const STATUS_STYLES = {
  pending:  { color: '#f59e0b', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20', text: 'text-[#f59e0b]' },
  approved: { color: '#34d399', bg: 'bg-[#34d399]/10', border: 'border-[#34d399]/20', text: 'text-[#34d399]' },
  rejected: { color: '#f87171', bg: 'bg-[#f87171]/10', border: 'border-[#f87171]/20', text: 'text-[#f87171]' },
  resolved: { color: '#818cf8', bg: 'bg-[#818cf8]/10', border: 'border-[#818cf8]/20', text: 'text-[#818cf8]' },
};

// ── CSV Export ──
function exportToCSV(reports, filename = 'reports.csv') {
  const headers = ['ID', 'Employee', 'Department', 'Type', 'Reason', 'Description', 'Date', 'Status', 'Created'];
  const rows = reports.map(r => [
    r.id, r.employee_name || '', r.dept_name || '', r.type, r.reason || '', 
    `"${(r.description || '').replace(/"/g, '""')}"`,
    r.date ? new Date(r.date).toLocaleDateString('en-GB') : '',
    r.status,
    r.created_at ? new Date(r.created_at).toLocaleString('en-GB') : '',
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Detail Modal ──
function DetailModal({ report, onClose, tokens }) {
  const ss = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
  const TypeIcon = TYPE_CONFIG[report.type]?.icon || FileText;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[480px] rounded-[20px] border shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        {/* Header */}
        <div className="relative px-7 pb-5 pt-7" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.03))' }}>
          <button onClick={onClose} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full" style={{ background: tokens.bgInput, color: tokens.textSecondary }}><X size={14} /></button>
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${avatarGradients[(report.id || 0) % avatarGradients.length]} text-[18px] font-bold text-white`}>
              {getInitials(report.employee_name || 'U')}
            </div>
            <div>
              <p className="text-[18px] font-semibold" style={{ color: tokens.textPrimary }}>{report.employee_name || 'Unknown'}</p>
              <p className="mt-0.5 text-[13px]" style={{ color: tokens.textSecondary }}>{report.dept_name || 'N/A'}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-[3px] text-[11px] font-bold capitalize ${ss.bg} ${ss.border} ${ss.text}`}>{report.status}</span>
            <span className="flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-[10px] font-semibold capitalize" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>
              <TypeIcon size={11} /> {TYPE_CONFIG[report.type]?.label || report.type}
            </span>
          </div>
        </div>
        {/* Details */}
        <div className="px-7 py-5">
          <div className="flex flex-col gap-4">
            {report.reason && (
              <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.textMuted }}>Reason</p><p className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{report.reason}</p></div>
            )}
            <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.textMuted }}>Description</p><p className="text-[13px] leading-relaxed" style={{ color: tokens.textSecondary }}>{report.description || 'No description provided.'}</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: tokens.bgInput }}><Calendar size={13} style={{ color: tokens.textSecondary }} /></div>
                <div><p className="text-[10px] uppercase" style={{ color: tokens.textMuted }}>Date</p><p className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{report.date ? new Date(report.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p></div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: tokens.bgInput }}><Clock size={13} style={{ color: tokens.textSecondary }} /></div>
                <div><p className="text-[10px] uppercase" style={{ color: tokens.textMuted }}>Created</p><p className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{report.created_at ? new Date(report.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</p></div>
              </div>
            </div>
            {report.reviewed_at && (
              <div className="rounded-[10px] border p-3" style={{ background: tokens.bgInput, borderColor: tokens.border }}>
                <p className="text-[10px] font-semibold uppercase" style={{ color: tokens.textMuted }}>Reviewed</p>
                <p className="mt-1 text-[12px]" style={{ color: tokens.textSecondary }}>
                  {new Date(report.reviewed_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex border-t px-7 py-4" style={{ borderColor: tokens.border }}>
          <button onClick={onClose} className="flex-1 rounded-[10px] border py-2 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── New Request Modal ──
function NewRequestModal({ onClose, tokens }) {
  const { addReport } = useData();
  const [type, setType] = useState('vacation');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!desc.trim()) { setError('Please enter a description.'); return; }
    if (!date) { setError('Please select a date.'); return; }
    try { await addReport({ type, reason: reason.trim() || undefined, description: desc.trim(), date }); onClose(); }
    catch (err) { setError(err.data?.error || 'Error submitting request.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[460px] rounded-[20px] border p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"><Plus size={15} className="text-white" /></div><p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>New Request</p></div>
          <button onClick={onClose} style={{ color: tokens.textSecondary }} className="transition-colors hover:text-[#e2e8f0]"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(TYPE_CONFIG).slice(0, 4).map(([key, cfg]) => {
                const I = cfg.icon;
                return (<button key={key} onClick={() => setType(key)} className={`flex flex-col items-center gap-1.5 rounded-[10px] border py-2.5 text-[11px] font-semibold transition-all ${type === key ? 'border-[#6366f1]/40 bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`} style={{ borderColor: type === key ? undefined : tokens.border, color: type === key ? undefined : tokens.textSecondary }}><I size={16} />{cfg.label}</button>);
              })}
            </div>
          </div>
          <div><label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Date *</label><input type="date" value={date} onChange={e => { setDate(e.target.value); setError(''); }} className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark]" style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} /></div>
          <div><label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Reason (optional)</label><input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Family event" className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1]" style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} /></div>
          <div><label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Description *</label><input type="text" value={desc} onChange={e => { setDesc(e.target.value); setError(''); }} placeholder="Brief description..." className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1]" style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} /></div>
          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          <button onClick={handleSubmit} className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>Submit</button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Modal ──
function ConfirmModal({ action, request, onConfirm, onClose, tokens }) {
  const isApprove = action === 'approve';
  const color = isApprove ? '#34d399' : '#f87171';
  const bgGrad = isApprove ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#ef4444,#dc2626)';
  const shadow = isApprove ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[400px] rounded-[20px] border p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ background: `${color}15`, border: `1.5px solid ${color}30` }}>
            {isApprove ? <Check size={18} style={{ color }} /> : <XCircleIcon size={18} style={{ color }} />}
          </div>
          <div><p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>{isApprove ? 'Approve' : 'Reject'} Request</p></div>
        </div>
        <div className="mb-6 rounded-[12px] border p-4" style={{ background: tokens.bgInput, borderColor: tokens.border }}>
          <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{request.employee_name}</p>
          <p className="mt-1 text-[12px] capitalize" style={{ color: tokens.textSecondary }}>{request.type}: {request.description}</p>
        </div>
        <div className="flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          <button onClick={onConfirm} className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5" style={{ background: bgGrad, border: 'none', cursor: 'pointer', boxShadow: `0 4px 16px ${shadow}` }}>{isApprove ? 'Approve' : 'Reject'}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function ReportsPage({ role = 'employee', onLogout, onNav }) {
  const tokens = useTokens();
  const { user } = useAuth();
  const isAdmin = role === 'admin';
  const { reports, reportsLoading, updateReportStatus, deleteReport } = useData();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [sortCol, setSortCol] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [deptFilter, setDeptFilter] = useState('All');
  const [confirmAction, setConfirmAction] = useState(null);
  const [detailReport, setDetailReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const tabs = ['all', 'vacation', 'medical', 'incident', 'timesheet'];

  // Definición de columnas exactas usando CSS Grid para que nada se desalinee
  const gridCols = isAdmin 
    ? 'minmax(200px, 2fr) minmax(110px, 1fr) minmax(150px, 2.5fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(160px, 1.2fr)' 
    : 'minmax(120px, 1fr) minmax(200px, 3fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(160px, 1.2fr)';

  // KPIs
  const kpiCards = useMemo(() => {
    const pending = reports.filter(r => r.status === 'pending').length;
    const approved = reports.filter(r => r.status === 'approved').length;
    const rejected = reports.filter(r => r.status === 'rejected').length;
    return [
      { title: isAdmin ? 'Total Requests' : 'My Requests', value: String(reports.length), sub: isAdmin ? 'All employees' : 'Total', color: '#818cf8' },
      { title: 'Pending', value: String(pending), sub: isAdmin ? 'Needs action' : 'Awaiting', color: '#f59e0b' },
      { title: 'Approved', value: String(approved), sub: 'Accepted', color: '#34d399' },
      { title: 'Rejected', value: String(rejected), sub: 'Declined', color: '#f87171' },
    ];
  }, [reports, isAdmin]);

  // Filter + sort + paginate
  const filtered = useMemo(() => {
    let rows = [...reports];
    if (activeTab !== 'all') rows = rows.filter(r => r.type === activeTab);
    if (isAdmin && deptFilter !== 'All') rows = rows.filter(r => r.dept_name === deptFilter);
    if (dateFrom) rows = rows.filter(r => r.date && new Date(r.date) >= new Date(dateFrom));
    if (dateTo) rows = rows.filter(r => r.date && new Date(r.date) <= new Date(dateTo));
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r => (r.employee_name || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q) || (r.reason || '').toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === 'created_at' || sortCol === 'date') { va = new Date(va || 0).getTime(); vb = new Date(vb || 0).getTime(); }
      else { va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase(); }
      return sortDir === 'asc' ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
    return rows;
  }, [reports, activeTab, search, sortCol, sortDir, isAdmin, deptFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useMemo(() => { setCurrentPage(1); }, [activeTab, search, deptFilter, dateFrom, dateTo]);

  const handleStatusChange = async (id, newStatus) => {
    await updateReportStatus(id, newStatus);
    setConfirmAction(null);
  };

  const clearDateFilter = () => { setDateFrom(''); setDateTo(''); };

  return (
    <AppLayout role={role} activePage="reports" onNav={onNav} onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1200px]">
          
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]" style={{ color: tokens.textPrimary }}>{isAdmin ? 'Team Reports' : 'My Reports'}</h1>
                <span className="flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-[11px] font-bold" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                  {isAdmin ? <><Users size={12} /> Admin</> : <><User size={12} /> {user?.name}</>}
                </span>
              </div>
              <p className="mt-1 text-[13px] sm:text-[14px]" style={{ color: tokens.textSecondary }}>{isAdmin ? 'Review and manage all employee requests.' : 'Track your requests and absences.'}</p>
            </div>
            <div className="flex items-center gap-2.5">
              {isAdmin && (
                <button onClick={() => exportToCSV(filtered)} className="flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-[13px] font-semibold transition-all hover:bg-white/5"
                  style={{ borderColor: tokens.border, background: tokens.bgCard, color: tokens.textPrimary }}><Download size={15} /> Export CSV</button>
              )}
              {!isAdmin && (
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}><Plus size={15} /> New Request</button>
              )}
            </div>
          </div>

          {/* KPIs */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-4 sm:gap-4">
            {kpiCards.map((card, i) => (
              <div key={i} className="rounded-[16px] border p-4 sm:p-5 transition-colors hover:border-[#6366f1]/30" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.06em] sm:text-[11px]" style={{ color: tokens.textSecondary }}>{card.title}</p>
                <p className="text-[24px] font-bold leading-none sm:text-[30px]" style={{ color: card.color }}>{card.value}</p>
                <p className="mt-1.5 text-[10px] sm:text-[11px]" style={{ color: tokens.textMuted }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Table Component */}
          <div className="overflow-hidden rounded-[16px] border sm:rounded-[20px]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
            
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:px-6 sm:py-4" style={{ borderColor: tokens.borderSide }}>
              <div className="flex flex-wrap items-center gap-2">
                {tabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-[8px] px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-all sm:px-3 sm:text-[12px] ${activeTab === tab ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                    style={{ color: activeTab === tab ? undefined : tokens.textSecondary }}>{tab === 'all' ? 'All' : TYPE_CONFIG[tab]?.label || tab}</button>
                ))}
                {isAdmin && (
                  <>
                    <div className="hidden h-4 w-px sm:block" style={{ background: tokens.border }} />
                    {DEPARTMENTS.map(d => (
                      <button key={d} onClick={() => setDeptFilter(d)} className={`rounded-[6px] px-2 py-1 text-[11px] font-semibold transition-all ${deptFilter === d ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                        style={{ color: deptFilter === d ? undefined : tokens.textMuted }}>{d}</button>
                    ))}
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} style={{ color: tokens.textMuted }} />
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From"
                    className="w-[120px] rounded-[8px] border px-2 py-1.5 text-[11px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark] sm:w-[130px] sm:text-[12px]"
                    style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
                  <span className="text-[11px]" style={{ color: tokens.textMuted }}>→</span>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To"
                    className="w-[120px] rounded-[8px] border px-2 py-1.5 text-[11px] outline-none transition-colors focus:border-[#6366f1] [color-scheme:dark] sm:w-[130px] sm:text-[12px]"
                    style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
                  {(dateFrom || dateTo) && (
                    <button onClick={clearDateFilter} className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/10" style={{ color: tokens.textMuted }}><X size={12} /></button>
                  )}
                </div>
                <div className="relative ml-auto">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                    className="w-full rounded-[8px] border py-1.5 pl-8 pr-3 text-[12px] outline-none transition-colors focus:border-[#6366f1] sm:w-[200px]"
                    style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
                </div>
              </div>
            </div>

            {/* Table Content */}
            {reportsLoading ? (
              <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6366f1]/30 border-t-[#6366f1]" /></div>
            ) : (
              <div className="px-4 py-1 sm:px-6">
                
                {/* ── HEADER DE LA TABLA (Alineado con el Grid dinámico) ── */}
                <div className="hidden border-b py-3.5 sm:grid sm:items-center sm:gap-4" style={{ gridTemplateColumns: gridCols, borderColor: tokens.borderSide }}>
                  {isAdmin && <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Employee</span>}
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Type</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Description</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Date</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Status</span>
                  <span className="text-right text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Actions</span>
                </div>

                {/* ── FILAS DE LA TABLA ── */}
                {paginated.map((row) => {
                  const ss = STATUS_STYLES[row.status] || STATUS_STYLES.pending;
                  const TypeIcon = TYPE_CONFIG[row.type]?.icon || FileText;
                  const isPending = row.status === 'pending';
                  
                  return (
                    <div key={row.id}
                      className="group flex flex-col gap-2 border-b py-3 last:border-none sm:grid sm:items-center sm:gap-4 -mx-3 px-3 rounded-[10px] transition-all duration-150"
                      style={{ gridTemplateColumns: gridCols, borderColor: tokens.borderSide }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.borderColor = 'transparent'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = tokens.borderSide; }}>
                      
                      {/* Employee (admin only) */}
                      {isAdmin && (
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${avatarGradients[(row.id || 0) % avatarGradients.length]} text-[11px] font-bold text-white shadow-sm`}>
                            {getInitials(row.employee_name || '')}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{row.employee_name}</p>
                            <p className="truncate text-[11px]" style={{ color: tokens.textMuted }}>{row.dept_name}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Type */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]" style={{ background: tokens.bgInput }}>
                          <TypeIcon size={13} style={{ color: tokens.textSecondary }} />
                        </div>
                        <span className="truncate text-[12px] font-medium capitalize" style={{ color: tokens.textPrimary }}>
                          {TYPE_CONFIG[row.type]?.label || row.type}
                        </span>
                      </div>
                      
                      {/* Description */}
                      <p className="truncate text-[12px]" style={{ color: tokens.textSecondary }}>{row.description}</p>
                      
                      {/* Date */}
                      <span className="hidden text-[11px] font-medium sm:block" style={{ color: tokens.textSecondary }}>
                        {row.date ? new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                      </span>
                      
                      {/* Status */}
                      <div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[2px] text-[10px] font-bold capitalize ${ss.bg} ${ss.border} ${ss.text}`}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: ss.color }} />{row.status}
                        </span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setDetailReport(row)} className="flex h-[30px] items-center gap-1 rounded-[8px] border px-2.5 text-[11px] font-medium transition-all"
                          style={{ borderColor: tokens.border, color: tokens.textSecondary }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='#818cf8'; e.currentTarget.style.color='#818cf8'; e.currentTarget.style.background='rgba(99,102,241,0.05)'}}
                          onMouseLeave={e => { e.currentTarget.style.borderColor=tokens.border; e.currentTarget.style.color=tokens.textSecondary; e.currentTarget.style.background='transparent'}}>
                          <Eye size={12} /> View
                        </button>
                        
                        {isPending && isAdmin && (
                          <>
                            <button onClick={() => setConfirmAction({ action: 'approve', request: row })} className="flex h-[30px] items-center gap-1 rounded-[8px] border px-2.5 text-[11px] font-semibold transition-all hover:brightness-110"
                              style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)', color: '#34d399' }}><Check size={12} /></button>
                            <button onClick={() => setConfirmAction({ action: 'reject', request: row })} className="flex h-[30px] items-center gap-1 rounded-[8px] border px-2.5 text-[11px] font-semibold transition-all hover:brightness-110"
                              style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}><XCircleIcon size={12} /></button>
                          </>
                        )}
                        
                        {isPending && !isAdmin && (
                          <button onClick={() => deleteReport(row.id)} className="flex h-[30px] items-center gap-1.5 rounded-[8px] border px-2.5 text-[11px] font-semibold transition-all hover:brightness-110"
                            style={{ borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}><X size={11} /> Cancel</button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-14" style={{ color: tokens.textMuted }}><Search size={28} className="opacity-40" /><p className="text-[14px] font-medium">{search ? `No results for "${search}"` : 'No records found.'}</p></div>
                )}
              </div>
            )}

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6" style={{ borderColor: tokens.borderSide }}>
              <p className="text-[11px] sm:text-[12px]" style={{ color: tokens.textMuted }}>
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                {(dateFrom || dateTo) && ' (date filtered)'}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] border disabled:opacity-30 transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}><ChevronLeft size={14} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-all"
                      style={{ background: p === currentPage ? tokens.accentLight : 'transparent', color: p === currentPage ? '#818cf8' : tokens.textMuted }}>{p}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] border disabled:opacity-30 transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* Modals Overlay */}
      {showModal && <NewRequestModal onClose={() => setShowModal(false)} tokens={tokens} />}
      {confirmAction && <ConfirmModal action={confirmAction.action} request={confirmAction.request}
        onConfirm={() => handleStatusChange(confirmAction.request.id, confirmAction.action === 'approve' ? 'approved' : 'rejected')} onClose={() => setConfirmAction(null)} tokens={tokens} />}
      {detailReport && <DetailModal report={detailReport} onClose={() => setDetailReport(null)} tokens={tokens} />}
    </AppLayout>
  );
}