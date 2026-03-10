import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, Mail, MoreHorizontal, Plus, X, Grid3X3, List,
  Building2, Clock, Calendar, Phone, User, Trash2, Edit3, Save, Check,
  ChevronLeft, ChevronRight, Users, UserCheck, AlertCircle, Umbrella,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import AppLayout from '../components/AppLayout';
import { employeesData as initialEmployees, avatarGradients, employeeStatusStyles, getInitials } from '../data/mockData';

// ============================================================================
// CONSTANTES
// ============================================================================
const DEPARTMENTS = ['All', 'IT', 'Sales', 'HR', 'Marketing'];
const STATUSES    = ['All', 'On Time', 'Late', 'On Leave'];
const PAGE_SIZE   = 6;

// ============================================================================
// MODAL: DETALLE / EDITAR EMPLEADO
// ============================================================================
function EmployeeModal({ employee, onClose, onSave, onDelete, tokens }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ ...employee });
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Cerrar con Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSave = () => {
    onSave(form);
    setEditing(false);
  };

  const gradIdx = initialEmployees.findIndex(e => e.id === employee.id);
  const ss = employeeStatusStyles[form.status] || employeeStatusStyles['On Time'];

  // CORRECCIÓN: Renderizamos como función en lugar de sub-componente para evitar perder el foco al escribir
  const renderField = (label, field, type = 'text') => (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.textMuted }}>{label}</p>
      {editing ? (
        <input
          type={type} value={form[field] || ''}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full rounded-[8px] border px-3 py-2 text-[13px] outline-none transition-colors focus:border-[#6366f1]"
          style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }}
        />
      ) : (
        <p className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{form[field] || '—'}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Details for ${employee.name}`}>
      <div className="w-full max-w-[480px] overflow-hidden rounded-[20px] border shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>

        {/* Header */}
        <div className="relative px-7 pb-6 pt-7" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.03))' }}>
          <button onClick={onClose}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition-colors"
            style={{ background: tokens.bgInput, color: tokens.textSecondary }}
            aria-label="Close dialog">
            <X size={14} />
          </button>

          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${avatarGradients[Math.abs(gradIdx) % avatarGradients.length]} text-[20px] font-bold text-white shadow-lg`}>
              {getInitials(form.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[18px] font-semibold tracking-[-0.01em]" style={{ color: tokens.textPrimary }}>{form.name}</p>
              <p className="mt-0.5 text-[13px]" style={{ color: tokens.textSecondary }}>{form.role} · {form.dept}</p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-[3px] text-[10px] font-bold"
                  style={{ background: ss.bg, borderColor: ss.border, color: ss.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ss.color }} />
                  {form.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-7 py-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {renderField('Email', 'email', 'email')}
            {renderField('Phone', 'phone')}
            {renderField('Shift Start', 'start')}
            {renderField('Shift End', 'end')}
            {renderField('Department', 'dept')}
            {renderField('Join Date', 'joinDate')}
          </div>

          {/* Status selector (solo en modo edición) */}
          {editing && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.textMuted }}>Status</p>
              <div className="flex gap-2">
                {['On Time', 'Late', 'On Leave'].map(s => {
                  const st = employeeStatusStyles[s];
                  const active = form.status === s;
                  return (
                    <button key={s} onClick={() => setForm({ ...form, status: s })}
                      className="flex-1 rounded-[8px] border py-1.5 text-[11px] font-semibold transition-all"
                      style={{
                        background: active ? st.bg : 'transparent',
                        borderColor: active ? st.border : tokens.border,
                        color: active ? st.color : tokens.textSecondary,
                      }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Confirm delete */}
        {confirmDelete && (
          <div className="mx-7 mb-4 flex items-center gap-3 rounded-[10px] border p-3" style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <AlertCircle size={16} className="shrink-0 text-[#f87171]" />
            <p className="flex-1 text-[12px]" style={{ color: tokens.textSecondary }}>Are you sure? This can't be undone.</p>
            <button onClick={() => { onDelete(employee.id); onClose(); }}
              className="rounded-[6px] px-3 py-1 text-[11px] font-bold text-white"
              style={{ background: '#ef4444' }}>
              Confirm
            </button>
            <button onClick={() => setConfirmDelete(false)}
              className="rounded-[6px] border px-3 py-1 text-[11px] font-medium"
              style={{ borderColor: tokens.border, color: tokens.textSecondary }}>
              Cancel
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-7 py-4" style={{ borderColor: tokens.border }}>
          <button onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all hover:bg-[#f87171]/10"
            style={{ color: '#f87171' }}
            aria-label="Delete employee">
            <Trash2 size={13} /> Delete
          </button>
          <div className="flex gap-2.5">
            {editing ? (
              <>
                <button onClick={() => { setForm({ ...employee }); setEditing(false); }}
                  className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors"
                  style={{ borderColor: tokens.border, color: tokens.textSecondary }}>
                  Cancel
                </button>
                <button onClick={handleSave}
                  className="flex items-center gap-1.5 rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.3)', border: 'none', cursor: 'pointer' }}>
                  <Check size={14} /> Save
                </button>
              </>
            ) : (
              <>
                <button onClick={onClose}
                  className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors"
                  style={{ borderColor: tokens.border, color: tokens.textSecondary }}>
                  Close
                </button>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', border: 'none', cursor: 'pointer' }}>
                  <Edit3 size={14} /> Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL: AÑADIR EMPLEADO
// ============================================================================
function AddEmployeeModal({ onClose, onAdd, tokens }) {
  const [form, setForm] = useState({
    name: '', role: '', dept: 'IT', email: '', phone: '',
    start: '8:30 AM', end: '5:30 PM', status: 'On Time', joinDate: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.role.trim()) { setError('Role is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    onAdd({
      ...form,
      id: Date.now(),
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      joinDate: form.joinDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
    onClose();
  };

  // CORRECCIÓN: Renderizamos como función en lugar de sub-componente
  const renderInput = (label, field, placeholder = '', type = 'text') => (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>{label} *</label>
      <input 
        type={type} 
        value={form[field]} 
        onChange={e => { setForm({ ...form, [field]: e.target.value }); setError(''); }}
        placeholder={placeholder}
        className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1]"
        style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} 
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[460px] rounded-[20px] border p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)] sm:p-7" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]">
              <Plus size={15} className="text-white" />
            </div>
            <p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>Add Employee</p>
          </div>
          <button onClick={onClose} style={{ color: tokens.textSecondary }} className="transition-colors hover:text-[#e2e8f0]" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            {renderInput('Full Name', 'name', 'e.g. Ana López')}
            {renderInput('Role', 'role', 'e.g. Designer')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderInput('Email', 'email', 'ana@checkin.io', 'email')}
            {renderInput('Phone', 'phone', '+34 612 ...')}
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Department</label>
            <div className="grid grid-cols-4 gap-2">
              {['IT', 'Sales', 'HR', 'Marketing'].map(d => (
                <button key={d} onClick={() => setForm({ ...form, dept: d })}
                  className={`rounded-[8px] border py-1.5 text-[11px] font-semibold transition-all
                    ${form.dept === d ? 'border-[#6366f1]/40 bg-[#6366f1]/15 text-[#818cf8]' : ''}`}
                  style={{ borderColor: form.dept === d ? undefined : tokens.border, color: form.dept === d ? undefined : tokens.textSecondary }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          <button onClick={handleSubmit}
            className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', border: 'none', cursor: 'pointer' }}>
            Add employee
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD VIEW — Un empleado en formato tarjeta
// ============================================================================
function EmployeeCard({ emp, index, tokens, onClick }) {
  const ss = employeeStatusStyles[emp.status];
  return (
    <div
      onClick={() => onClick(emp)}
      className="group cursor-pointer rounded-[16px] border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)]"
      style={{ background: tokens.bgCard, borderColor: tokens.border }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = tokens.isDark ? '#3a4155' : '#cbd5e1'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} text-[13px] font-bold text-white shadow-sm`}>
          {getInitials(emp.name)}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[2px] text-[10px] font-bold"
          style={{ background: ss.bg, borderColor: ss.border, color: ss.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: ss.color }} />
          {emp.status}
        </span>
      </div>
      <p className="truncate text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>{emp.name}</p>
      <p className="mt-0.5 truncate text-[12px]" style={{ color: tokens.textSecondary }}>{emp.role}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: tokens.textMuted }}>
        <Building2 size={11} />
        <span>{emp.dept}</span>
        <span className="mx-1">·</span>
        <Clock size={11} />
        <span>{emp.start} – {emp.end}</span>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function EmployeesPage({ onLogout, onNav, initialDept }) {
  const tokens = useTokens();

  const [employees, setEmployees]     = useState(initialEmployees);
  const [searchTerm, setSearchTerm]   = useState('');
  const [deptFilter, setDeptFilter]   = useState(initialDept || 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode]       = useState('table'); // 'table' | 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showAdd, setShowAdd]         = useState(false);

  // ── Filtrado ──
  const filtered = useMemo(() => {
    let rows = [...employees];
    if (deptFilter !== 'All') rows = rows.filter(e => e.dept === deptFilter);
    if (statusFilter !== 'All') rows = rows.filter(e => e.status === statusFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(e =>
        e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) ||
        e.dept.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [employees, deptFilter, statusFilter, searchTerm]);

  // ── Paginación ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [deptFilter, statusFilter, searchTerm]);

  // ── KPIs ──
  const kpis = useMemo(() => {
    const total   = employees.length;
    const onTime  = employees.filter(e => e.status === 'On Time').length;
    const late    = employees.filter(e => e.status === 'Late').length;
    const onLeave = employees.filter(e => e.status === 'On Leave').length;
    return [
      { label: 'Total',   value: total,   color: '#818cf8', Icon: Users },
      { label: 'Present', value: onTime,  color: '#34d399', Icon: UserCheck },
      { label: 'Late',    value: late,    color: '#f59e0b', Icon: AlertCircle },
      { label: 'On Leave', value: onLeave, color: '#818cf8', Icon: Umbrella },
    ];
  }, [employees]);

  // ── CRUD ──
  const handleSave   = (updated) => setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
  const handleDelete = (id) => setEmployees(prev => prev.filter(e => e.id !== id));
  const handleAdd    = (emp) => setEmployees(prev => [emp, ...prev]);

  // ── Grid cols ──
  const gridCols = 'grid-cols-[minmax(200px,2.5fr)_minmax(90px,1fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)_minmax(90px,1fr)_minmax(120px,1.2fr)]';

  return (
    <AppLayout role="admin" activePage="employees" onNav={onNav} onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1200px]">

          {/* Header — responsive */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>Employees</h1>
              <p className="mt-1 text-[14px]" style={{ color: tokens.textSecondary }}>
                Manage team members across all departments.
              </p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-[12px] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}>
              <Plus size={16} strokeWidth={2.5} /> Add Employee
            </button>
          </div>

          {/* KPI strip */}
          <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-3">
            {kpis.map(({ label, value, color, Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-[14px] border px-5 py-4" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `${color}12` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p className="text-[22px] font-bold leading-none tracking-[-0.02em]" style={{ color }}>{value}</p>
                  <p className="mt-1 text-[11px] font-medium" style={{ color: tokens.textSecondary }}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-[16px] border sm:rounded-[20px]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:py-4" style={{ borderColor: tokens.borderSide }}>
              <div className="flex flex-wrap items-center gap-3">
                {/* Dept filter */}
                <div className="flex gap-0.5" role="tablist" aria-label="Filter by department">
                  {DEPARTMENTS.map(d => (
                    <button key={d} onClick={() => setDeptFilter(d)} role="tab" aria-selected={deptFilter === d}
                      className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition-all
                        ${deptFilter === d ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                      style={{ color: deptFilter === d ? undefined : tokens.textSecondary }}>
                      {d}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px" style={{ background: tokens.border }} />
                {/* Status filter */}
                <div className="flex gap-0.5">
                  {STATUSES.map(s => {
                    const isActive = statusFilter === s;
                    const sColor = s === 'On Time' ? '#34d399' : s === 'Late' ? '#f59e0b' : s === 'On Leave' ? '#818cf8' : undefined;
                    return (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold transition-all
                          ${isActive ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                        style={{ color: isActive ? sColor || '#818cf8' : tokens.textMuted }}>
                        {s === 'All' ? 'Any status' : s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input type="text" placeholder="Search..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search employees"
                    className="w-[180px] rounded-[8px] border py-1.5 pl-8 pr-3 text-[12px] outline-none transition-colors focus:border-[#6366f1]"
                    style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} aria-label="Clear">
                      <X size={12} />
                    </button>
                  )}
                </div>
                {/* View toggle */}
                <div className="flex rounded-[8px] border p-0.5" style={{ borderColor: tokens.border }}>
                  <button onClick={() => setViewMode('table')} aria-label="Table view"
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-all"
                    style={{ background: viewMode === 'table' ? tokens.accentLight : 'transparent', color: viewMode === 'table' ? '#818cf8' : tokens.textMuted }}>
                    <List size={14} />
                  </button>
                  <button onClick={() => setViewMode('cards')} aria-label="Card view"
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-all"
                    style={{ background: viewMode === 'cards' ? tokens.accentLight : 'transparent', color: viewMode === 'cards' ? '#818cf8' : tokens.textMuted }}>
                    <Grid3X3 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {viewMode === 'table' ? (
              <div className="px-6 py-1">
                {/* Header */}
                <div className={`grid ${gridCols} items-center gap-5 py-3.5`}>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Employee</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Dept</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Start</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>End</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Status</span>
                  <span className="text-right text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Actions</span>
                </div>

                {/* Rows */}
                <div className="flex flex-col">
                  {paginated.map((emp) => {
                    const i = initialEmployees.findIndex(e => e.id === emp.id);
                    const ss = employeeStatusStyles[emp.status];
                    return (
                      <div key={emp.id}
                        className={`group grid ${gridCols} items-center gap-5 border-b py-3 last:border-none rounded-[10px] -mx-3 px-3 cursor-pointer transition-all duration-150`}
                        style={{ borderColor: tokens.borderSide }}
                        onClick={() => setSelectedEmp(emp)}
                        onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.borderColor = 'transparent'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = tokens.borderSide; }}
                      >
                        {/* Profile */}
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${avatarGradients[Math.abs(i) % avatarGradients.length]} text-[11px] font-bold text-white shadow-sm`}>
                            {getInitials(emp.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold leading-tight" style={{ color: tokens.textPrimary }}>{emp.name}</p>
                            <p className="mt-0.5 truncate text-[11px] leading-tight" style={{ color: tokens.textMuted }}>{emp.role}</p>
                          </div>
                        </div>
                        {/* Dept */}
                        <span className="text-[12px] font-medium" style={{ color: tokens.textSecondary }}>{emp.dept}</span>
                        {/* Shift */}
                        <span className="text-[12px] font-semibold" style={{ color: tokens.textPrimary }}>{emp.start}</span>
                        <span className="text-[12px] font-semibold" style={{ color: tokens.textPrimary }}>{emp.end}</span>
                        {/* Status */}
                        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[2px] text-[10px] font-bold"
                          style={{ background: ss.bg, borderColor: ss.border, color: ss.color }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: ss.color }} />
                          {emp.status}
                        </span>
                        {/* Actions */}
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[11px] font-medium transition-all"
                            style={{ borderColor: tokens.border, color: tokens.textPrimary, background: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textPrimary; e.currentTarget.style.background = 'transparent'; }}
                            aria-label={`Message ${emp.name}`}>
                            <Mail size={13} /> Message
                          </button>
                          <button
                            onClick={() => setSelectedEmp(emp)}
                            className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border transition-all"
                            style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary; }}
                            aria-label={`View ${emp.name}`}>
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {paginated.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 py-14" style={{ color: tokens.textMuted }}>
                      <Search size={28} className="opacity-40" />
                      <p className="text-[14px] font-medium">No employees found.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Cards view */
              <div className="p-6">
                {paginated.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                    {paginated.map((emp) => {
                      const i = initialEmployees.findIndex(e => e.id === emp.id);
                      return <EmployeeCard key={emp.id} emp={emp} index={Math.abs(i)} tokens={tokens} onClick={setSelectedEmp} />;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-14" style={{ color: tokens.textMuted }}>
                    <Search size={28} className="opacity-40" />
                    <p className="text-[14px] font-medium">No employees found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6" style={{ borderColor: tokens.borderSide }}>
              <p className="text-[12px]" style={{ color: tokens.textMuted }}>
                Showing {paginated.length} of {filtered.length} employee{filtered.length !== 1 ? 's' : ''}
                {deptFilter !== 'All' && ` in ${deptFilter}`}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] border transition-all disabled:opacity-30"
                    style={{ borderColor: tokens.border, color: tokens.textSecondary }}
                    aria-label="Previous page">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-all"
                      style={{
                        background: p === currentPage ? tokens.accentLight : 'transparent',
                        color: p === currentPage ? '#818cf8' : tokens.textMuted,
                      }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] border transition-all disabled:opacity-30"
                    style={{ borderColor: tokens.border, color: tokens.textSecondary }}
                    aria-label="Next page">
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedEmp && (
        <EmployeeModal
          employee={selectedEmp}
          onClose={() => setSelectedEmp(null)}
          onSave={(updated) => { handleSave(updated); setSelectedEmp(updated); }}
          onDelete={(id) => { handleDelete(id); setSelectedEmp(null); }}
          tokens={tokens}
        />
      )}
      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onAdd={handleAdd} tokens={tokens} />}
    </AppLayout>
  );
}