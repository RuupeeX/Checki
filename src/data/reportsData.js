import {
  CheckCircle2, Clock, CheckCircle, XCircle,
  Umbrella, Stethoscope, AlertCircle, FileText,
} from 'lucide-react';

// ============================================================================
// DATOS DE REPORTS — Ahora con empleado y departamento
// ============================================================================
const initialReports = [
  // ── Peticiones de Antonio Pérez (empleado logueado en demo) ──
  { id: 'REQ-001', date: '15 Mar 2026', dateRaw: new Date('2026-03-15'), type: 'Vacation',  desc: 'Summer holidays trip',           status: 'Approved', icon: Umbrella,    employee: 'Antonio Pérez',            dept: 'IT' },
  { id: 'REQ-002', date: '02 Mar 2026', dateRaw: new Date('2026-03-02'), type: 'Medical',   desc: 'Dentist appointment (Morning)',   status: 'Pending',  icon: Stethoscope, employee: 'Antonio Pérez',            dept: 'IT' },
  { id: 'INC-045', date: '28 Feb 2026', dateRaw: new Date('2026-02-28'), type: 'Incident',  desc: 'Forgot to clock out',            status: 'Resolved', icon: AlertCircle, employee: 'Antonio Pérez',            dept: 'IT' },
  { id: 'REQ-003', date: '10 Feb 2026', dateRaw: new Date('2026-02-10'), type: 'Vacation',  desc: 'Personal day',                   status: 'Rejected', icon: Umbrella,    employee: 'Antonio Pérez',            dept: 'IT' },
  { id: 'REP-102', date: '31 Jan 2026', dateRaw: new Date('2026-01-31'), type: 'Timesheet', desc: 'January Monthly Report',         status: 'Approved', icon: FileText,    employee: 'Antonio Pérez',            dept: 'IT' },

  // ── Peticiones de otros empleados (visibles solo para admin) ──
  { id: 'REQ-004', date: '14 Mar 2026', dateRaw: new Date('2026-03-14'), type: 'Vacation',  desc: 'Family trip to Portugal',          status: 'Pending',  icon: Umbrella,    employee: 'Nuria García Martínez',    dept: 'IT' },
  { id: 'REQ-005', date: '12 Mar 2026', dateRaw: new Date('2026-03-12'), type: 'Medical',   desc: 'Ophthalmologist checkup',          status: 'Pending',  icon: Stethoscope, employee: 'Jaime López Ramos',        dept: 'IT' },
  { id: 'INC-046', date: '05 Mar 2026', dateRaw: new Date('2026-03-05'), type: 'Incident',  desc: 'Badge reader failure at entrance', status: 'Pending',  icon: AlertCircle, employee: 'Alejandro González Prada', dept: 'IT' },
  { id: 'REQ-006', date: '01 Mar 2026', dateRaw: new Date('2026-03-01'), type: 'Vacation',  desc: 'Moving to a new apartment',        status: 'Approved', icon: Umbrella,    employee: 'Lucía Sastre',             dept: 'IT' },
  { id: 'REQ-007', date: '28 Feb 2026', dateRaw: new Date('2026-02-28'), type: 'Vacation',  desc: 'Wedding attendance',               status: 'Pending',  icon: Umbrella,    employee: 'Carlos Ruiz',              dept: 'Sales' },
  { id: 'REQ-008', date: '25 Feb 2026', dateRaw: new Date('2026-02-25'), type: 'Medical',   desc: 'Physical therapy session',         status: 'Approved', icon: Stethoscope, employee: 'Sofia Martín',             dept: 'HR' },
  { id: 'INC-047', date: '20 Feb 2026', dateRaw: new Date('2026-02-20'), type: 'Incident',  desc: 'Late due to transport strike',     status: 'Resolved', icon: AlertCircle, employee: 'Pablo García',             dept: 'Sales' },
  { id: 'REQ-009', date: '18 Feb 2026', dateRaw: new Date('2026-02-18'), type: 'Vacation',  desc: 'Ski trip — 3 days off',            status: 'Rejected', icon: Umbrella,    employee: 'Elena Torres',             dept: 'Marketing' },
];
export default initialReports;

// ── Empleado logueado (para filtrar en vista Employee) ──
export const CURRENT_EMPLOYEE = 'Antonio Pérez';

// ── Departamentos disponibles para filtro admin ──
export const departments = ['All', 'IT', 'Sales', 'HR', 'Marketing'];

// ── Estilos de estado ──
export const reportStatusStyles = {
  Approved: { color: '#34d399', bg: 'bg-[#34d399]/10', border: 'border-[#34d399]/20', text: 'text-[#34d399]', icon: CheckCircle  },
  Pending:  { color: '#f59e0b', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20', text: 'text-[#f59e0b]', icon: Clock        },
  Resolved: { color: '#818cf8', bg: 'bg-[#818cf8]/10', border: 'border-[#818cf8]/20', text: 'text-[#818cf8]', icon: CheckCircle2 },
  Rejected: { color: '#f87171', bg: 'bg-[#f87171]/10', border: 'border-[#f87171]/20', text: 'text-[#f87171]', icon: XCircle      },
};

// ── Config de tipos ──
export const reportTypeConfig = {
  Vacation:  { icon: Umbrella,    label: 'Vacation'  },
  Medical:   { icon: Stethoscope, label: 'Medical'   },
  Incident:  { icon: AlertCircle, label: 'Incident'  },
  Timesheet: { icon: FileText,    label: 'Timesheet' },
};