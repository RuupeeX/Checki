import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Mail, MoreHorizontal, Plus, X, Grid3X3, List,
  Building2, Clock, Phone, User, Trash2, Edit3, Save, Check,
  ChevronLeft, ChevronRight, Users, UserCheck, AlertCircle, Umbrella,
} from 'lucide-react';
import { useTokens } from '../contexts/Themecontext';
import AppLayout from '../components/AppLayout';
import { avatarGradients, getInitials } from '../data/mockData';
import { employees as employeesApi } from '../services/api';

const DEPARTMENTS = ['All', 'IT', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations'];
const PAGE_SIZE = 9;

const statusStyles = {
  on_time:  { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)', label: 'On Time' },
  late:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)', label: 'Late' },
  absent:   { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', label: 'Absent' },
  on_leave: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', label: 'On Leave' },
};

// ============================================================================
// EMPLOYEE MODAL
// ============================================================================
function EmployeeModal({ employee, onClose, onSave, onDelete, tokens }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...employee });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSave = async () => {
    try {
      await onSave(form);
      setEditing(false);
    } catch (err) { console.error(err); }
  };

  const ss = statusStyles[form.attendance_status] || statusStyles.absent;

  const renderField = (label, field, type = 'text') => (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: tokens.textMuted }}>{label}</p>
      {editing ? (
        <input type={type} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full rounded-[8px] border px-3 py-2 text-[13px] outline-none focus:border-[#6366f1]"
          style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
      ) : (
        <p className="text-[13px] font-medium" style={{ color: tokens.textPrimary }}>{form[field] || '—'}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[480px] overflow-hidden rounded-[20px] border shadow-[0_24px_64px_rgba(0,0,0,0.5)]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="relative px-7 pb-6 pt-7" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.03))' }}>
          <button onClick={onClose} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full" style={{ background: tokens.bgInput, color: tokens.textSecondary }}><X size={14} /></button>
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${avatarGradients[(employee.id || 0) % avatarGradients.length]} text-[20px] font-bold text-white shadow-lg`}>{getInitials(form.name)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[18px] font-semibold" style={{ color: tokens.textPrimary }}>{form.name}</p>
              <p className="mt-0.5 text-[13px]" style={{ color: tokens.textSecondary }}>{form.job_title} · {form.dept_name}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-[3px] text-[10px] font-bold" style={{ background: ss.bg, borderColor: ss.border, color: ss.color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ss.color }} />{ss.label}
              </span>
            </div>
          </div>
        </div>
        <div className="px-7 py-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {renderField('Email', 'email', 'email')}
            {renderField('Phone', 'phone')}
            {renderField('Shift Start', 'shift_start')}
            {renderField('Shift End', 'shift_end')}
            {renderField('Department', 'dept_name')}
            {renderField('Join Date', 'join_date')}
          </div>
        </div>
        {confirmDelete && (
          <div className="mx-7 mb-4 flex items-center gap-3 rounded-[10px] border p-3" style={{ background: 'rgba(248,113,113,0.06)', borderColor: 'rgba(248,113,113,0.2)' }}>
            <AlertCircle size={16} className="shrink-0 text-[#f87171]" />
            <p className="flex-1 text-[12px]" style={{ color: tokens.textSecondary }}>Are you sure?</p>
            <button onClick={() => { onDelete(employee.id); onClose(); }} className="rounded-[6px] px-3 py-1 text-[11px] font-bold text-white" style={{ background: '#ef4444' }}>Confirm</button>
            <button onClick={() => setConfirmDelete(false)} className="rounded-[6px] border px-3 py-1 text-[11px] font-medium" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          </div>
        )}
        <div className="flex items-center justify-between border-t px-7 py-4" style={{ borderColor: tokens.border }}>
          <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#f87171]/10" style={{ color: '#f87171' }}><Trash2 size={13} /> Delete</button>
          <div className="flex gap-2.5">
            {editing ? (
              <>
                <button onClick={() => { setForm({ ...employee }); setEditing(false); }} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-1.5 rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', cursor: 'pointer' }}><Check size={14} /> Save</button>
              </>
            ) : (
              <>
                <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Close</button>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', cursor: 'pointer' }}><Edit3 size={14} /> Edit</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD EMPLOYEE MODAL
// ============================================================================
function AddEmployeeModal({ onClose, onAdd, tokens }) {
  const [form, setForm] = useState({ name: '', job_title: '', dept_id: 1, email: '', phone: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const deptMap = { IT: 1, Sales: 2, HR: 3, Marketing: 4, Finance: 5, Operations: 6 };
  
  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (!form.password.trim()) { setError('Password is required.'); return; }
    if (form.password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    try { await onAdd(form); onClose(); } catch (err) { setError(err.data?.error || 'Error creating employee.'); }
  };

  const renderInput = (label, field, placeholder = '', type = 'text') => (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>{label} *</label>
      <input type={type} value={form[field]} onChange={e => { setForm({...form, [field]: e.target.value}); setError(''); }} placeholder={placeholder} 
        className="w-full rounded-[10px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#6366f1]" style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[460px] rounded-[20px] border p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)] sm:p-7" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"><Plus size={15} className="text-white" /></div><p className="text-[16px] font-semibold" style={{ color: tokens.textPrimary }}>Add Employee</p></div>
          <button onClick={onClose} style={{ color: tokens.textSecondary }} className="transition-colors hover:text-[#e2e8f0]"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            {renderInput('Full Name', 'name', 'e.g. Ana López')}
            {renderInput('Role', 'job_title', 'e.g. Designer')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderInput('Email', 'email', 'ana@checkin.io', 'email')}
            {renderInput('Phone', 'phone', '+34 612 ...')}
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Password *</label>
            <div className="relative">
              <input value={form.password} onChange={e => { setForm({...form, password: e.target.value}); setError(''); }}
                type={showPwd ? 'text' : 'password'} placeholder="Min. 4 characters"
                className="w-full rounded-[10px] border px-3.5 py-2.5 pr-10 text-[13px] outline-none transition-colors focus:border-[#6366f1]"
                style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold"
                style={{ color: tokens.textMuted }}>{showPwd ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium" style={{ color: tokens.textSecondary }}>Department</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Object.entries(deptMap).map(([name, id]) => (
                <button key={id} onClick={() => setForm({...form, dept_id: id})}
                  className={`rounded-[8px] border py-1.5 text-[11px] font-semibold transition-all ${form.dept_id === id ? 'border-[#6366f1]/40 bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                  style={{ borderColor: form.dept_id === id ? undefined : tokens.border, color: form.dept_id === id ? undefined : tokens.textSecondary }}>{name}</button>
              ))}
            </div>
          </div>
          {error && <p className="text-[12px] text-[#f87171]">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onClose} className="rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}>Cancel</button>
          <button onClick={handleSubmit} className="rounded-[10px] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>Add employee</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function EmployeesPage({ onLogout, onNav, initialDept }) {
  const tokens = useTokens();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState(initialDept || 'All');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  // Columnas exactas de la tabla (las mismas que en Reports)
  const gridCols = 'minmax(200px, 2fr) minmax(110px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(100px, 1fr) minmax(80px, 1fr)';

  // ── FETCH SEGURO ──
  const fetchEmployees = async (page = currentPage) => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (deptFilter !== 'All') params.dept = deptFilter;
      if (searchTerm.trim()) params.search = searchTerm;
      
      const data = await employeesApi.getAll(params);
      let allEmps = Array.isArray(data) ? data : (data.employees || []);
      let realTotal = data.total !== undefined ? data.total : allEmps.length;

      if (deptFilter !== 'All' && allEmps.some(e => e.dept_name !== deptFilter)) {
        allEmps = allEmps.filter(e => e.dept_name === deptFilter);
        realTotal = allEmps.length;
      }
      if (searchTerm.trim() && allEmps.length > 0) {
        const q = searchTerm.toLowerCase();
        allEmps = allEmps.filter(e => e.name.toLowerCase().includes(q) || (e.job_title || '').toLowerCase().includes(q));
        realTotal = allEmps.length;
      }
      if (allEmps.length > PAGE_SIZE || (allEmps.length > 0 && data.total === undefined)) {
        allEmps = allEmps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      }

      setEmployees(allEmps);
      setTotal(realTotal);

    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(currentPage); }, [currentPage]);
  useEffect(() => { setCurrentPage(1); fetchEmployees(1); }, [deptFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // KPIs
  const [kpis, setKpis] = useState({ total: 0, onTime: 0, late: 0, onLeave: 0 });
  useEffect(() => {
    employeesApi.getAll({ limit: 200 }).then(data => {
      const all = Array.isArray(data) ? data : (data.employees || []);
      setKpis({
        total: data.total || all.length,
        onTime: all.filter(e => e.attendance_status === 'on_time').length,
        late: all.filter(e => e.attendance_status === 'late').length,
        onLeave: all.filter(e => e.attendance_status === 'on_leave').length,
      });
    }).catch(() => {});
  }, [employees]);

  const handleSave = async (updated) => {
    await employeesApi.update(updated.id, updated);
    fetchEmployees();
    setSelectedEmp(null);
  };
  const handleDelete = async (id) => {
    await employeesApi.remove(id);
    fetchEmployees();
  };
  const handleAdd = async (emp) => {
    await employeesApi.create(emp);
    fetchEmployees();
  };

  const kpiItems = [
    { label: 'Total', value: kpis.total, color: '#818cf8', Icon: Users },
    { label: 'Present', value: kpis.onTime, color: '#34d399', Icon: UserCheck },
    { label: 'Late', value: kpis.late, color: '#f59e0b', Icon: AlertCircle },
    { label: 'On Leave', value: kpis.onLeave, color: '#818cf8', Icon: Umbrella },
  ];

  return (
    <AppLayout role="admin" activePage="employees" onNav={onNav} onLogout={onLogout}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[26px]" style={{ color: tokens.textPrimary }}>Employees</h1>
              <p className="mt-1 text-[13px] sm:text-[14px]" style={{ color: tokens.textSecondary }}>Manage team members across all departments.</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-[12px] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}><Plus size={16} strokeWidth={2.5} /> Add Employee</button>
          </div>

          {/* KPIs */}
          <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-3">
            {kpiItems.map(({ label, value, color, Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-[14px] border px-5 py-4 transition-colors hover:border-[#6366f1]/30" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `${color}12` }}><Icon size={18} style={{ color }} /></div>
                <div><p className="text-[22px] font-bold leading-none" style={{ color }}>{value}</p><p className="mt-1 text-[11px] font-medium" style={{ color: tokens.textSecondary }}>{label}</p></div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-[16px] border sm:rounded-[20px]" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 sm:py-4" style={{ borderColor: tokens.borderSide }}>
              <div className="flex flex-wrap items-center gap-2">
                {DEPARTMENTS.map(d => (
                  <button key={d} onClick={() => setDeptFilter(d)}
                    className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition-all ${deptFilter === d ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'hover:bg-white/5'}`}
                    style={{ color: deptFilter === d ? undefined : tokens.textSecondary }}>{d}</button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: tokens.textMuted }} />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-[8px] border py-1.5 pl-8 pr-3 text-[12px] outline-none transition-colors focus:border-[#6366f1] sm:w-[180px]"
                    style={{ background: tokens.bgInput, borderColor: tokens.border, color: tokens.textPrimary }} />
                  {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors hover:text-[#e2e8f0]" style={{ color: tokens.textMuted }}><X size={12} /></button>}
                </div>
                <div className="flex rounded-[8px] border p-0.5" style={{ borderColor: tokens.border }}>
                  <button onClick={() => setViewMode('table')} className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors hover:bg-white/5" style={{ background: viewMode === 'table' ? tokens.accentLight : 'transparent', color: viewMode === 'table' ? '#818cf8' : tokens.textMuted }}><List size={14} /></button>
                  <button onClick={() => setViewMode('cards')} className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors hover:bg-white/5" style={{ background: viewMode === 'cards' ? tokens.accentLight : 'transparent', color: viewMode === 'cards' ? '#818cf8' : tokens.textMuted }}><Grid3X3 size={14} /></button>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6366f1]/30 border-t-[#6366f1]" /></div>
            ) : viewMode === 'table' ? (
              <div className="px-4 py-1 sm:px-6">
                
                {/* HEADER DE LA TABLA */}
                <div className="hidden border-b py-3.5 sm:grid sm:items-center sm:gap-4" style={{ gridTemplateColumns: gridCols, borderColor: tokens.borderSide }}>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Employee</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Dept</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Start</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>End</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Status</span>
                  <span className="text-right text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: tokens.textMuted }}>Actions</span>
                </div>
                
                <div className="flex flex-col">
                  {employees.map((emp, idx) => {
                    const ss = statusStyles[emp.attendance_status] || statusStyles.absent;
                    return (
                      <div key={emp.id} 
                        // ── CLASES DE HOVER PERFECTO AÑADIDAS AQUÍ ──
                        className="group flex flex-col gap-2 border-b py-3 sm:grid sm:items-center sm:gap-4 last:border-none cursor-pointer -mx-3 px-3 rounded-[10px] transition-all duration-150" 
                        style={{ gridTemplateColumns: gridCols, borderColor: tokens.borderSide }}
                        onClick={() => setSelectedEmp(emp)}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.background = tokens.bgHover; 
                          e.currentTarget.style.borderColor = 'transparent'; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.background = 'transparent'; 
                          e.currentTarget.style.borderColor = tokens.borderSide; 
                        }}>
                        
                        {/* Profile */}
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} text-[11px] font-bold text-white shadow-sm`}>{getInitials(emp.name)}</div>
                          <div className="min-w-0"><p className="truncate text-[13px] font-semibold leading-tight" style={{ color: tokens.textPrimary }}>{emp.name}</p><p className="mt-0.5 truncate text-[11px] leading-tight" style={{ color: tokens.textMuted }}>{emp.job_title}</p></div>
                        </div>
                        
                        {/* Dept & Time */}
                        <span className="hidden text-[12px] font-medium sm:block" style={{ color: tokens.textSecondary }}>{emp.dept_name}</span>
                        <span className="hidden text-[12px] font-semibold sm:block" style={{ color: tokens.textPrimary }}>{emp.shift_start?.slice(0,5) || '—'}</span>
                        <span className="hidden text-[12px] font-semibold sm:block" style={{ color: tokens.textPrimary }}>{emp.shift_end?.slice(0,5) || '—'}</span>
                        
                        {/* Status */}
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[2px] text-[10px] font-bold" style={{ background: ss.bg, borderColor: ss.border, color: ss.color }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ss.color }} />{ss.label}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="hidden justify-end gap-2 sm:flex" onClick={e => e.stopPropagation()}>
                          <button className="flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[11px] font-medium transition-all" style={{ borderColor: tokens.border, color: tokens.textPrimary, background: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor='#818cf8'; e.currentTarget.style.color='#818cf8'; e.currentTarget.style.background='rgba(99,102,241,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor=tokens.border; e.currentTarget.style.color=tokens.textPrimary; e.currentTarget.style.background='transparent'; }}>
                            <Mail size={13} /> Message
                          </button>
                          <button onClick={() => setSelectedEmp(emp)} className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border transition-all" style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor='#818cf8'; e.currentTarget.style.color='#818cf8'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor=tokens.border; e.currentTarget.style.color=tokens.textSecondary; }}>
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {employees.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-14" style={{ color: tokens.textMuted }}><Search size={28} className="opacity-40" /><p className="text-[14px] font-medium">No employees found.</p></div>
                  )}
                </div>
              </div>
            ) : (
              /* Cards view */
              <div className="p-4 sm:p-6">
                {employees.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                    {employees.map((emp, idx) => {
                      const ss = statusStyles[emp.attendance_status] || statusStyles.absent;
                      return (
                        <div key={emp.id} onClick={() => setSelectedEmp(emp)} className="cursor-pointer rounded-[16px] border p-5 transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)]" 
                          style={{ background: tokens.bgCard, borderColor: tokens.border }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = isDark ? '#3a4155' : '#cbd5e1'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = tokens.border}
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} text-[13px] font-bold text-white shadow-sm`}>{getInitials(emp.name)}</div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[2px] text-[10px] font-bold" style={{ background: ss.bg, borderColor: ss.border, color: ss.color }}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ss.color }} />{ss.label}
                            </span>
                          </div>
                          <p className="truncate text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>{emp.name}</p>
                          <p className="mt-0.5 truncate text-[12px]" style={{ color: tokens.textSecondary }}>{emp.job_title}</p>
                          <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: tokens.textMuted }}><Building2 size={11} /><span>{emp.dept_name}</span><span className="mx-1">·</span><Clock size={11} /><span>{emp.shift_start?.slice(0,5)} – {emp.shift_end?.slice(0,5)}</span></div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-14" style={{ color: tokens.textMuted }}><Search size={28} className="opacity-40" /><p className="text-[14px] font-medium">No employees found.</p></div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6" style={{ borderColor: tokens.borderSide }}>
              <p className="text-[11px] sm:text-[12px]" style={{ color: tokens.textMuted }}>
                Showing {employees.length} {total > 0 ? `of ${total}` : ''} employee{employees.length !== 1 ? 's' : ''}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex h-7 w-7 items-center justify-center rounded-[6px] border transition-colors disabled:opacity-30 hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}><ChevronLeft size={14} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-all"
                      style={{ background: p === currentPage ? tokens.accentLight : 'transparent', color: p === currentPage ? '#818cf8' : tokens.textMuted }}>{p}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex h-7 w-7 items-center justify-center rounded-[6px] border transition-colors disabled:opacity-30 hover:bg-white/5" style={{ borderColor: tokens.border, color: tokens.textSecondary }}><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedEmp && <EmployeeModal employee={selectedEmp} onClose={() => setSelectedEmp(null)} onSave={handleSave} onDelete={handleDelete} tokens={tokens} />}
      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} onAdd={handleAdd} tokens={tokens} />}
    </AppLayout>
  );
}