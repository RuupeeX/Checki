// ============================================================================
// DATOS SIMULADOS CENTRALIZADOS
// Todos los datos de demostración de la app viven aquí.
// En producción se reemplazaría por llamadas a una API real.
// ============================================================================

// ── Gradientes reutilizables para avatares ──
export const avatarGradients = [
  'from-[#6366f1] to-[#8b5cf6]',
  'from-[#f093fb] to-[#f5576c]',
  'from-[#4facfe] to-[#00f2fe]',
  'from-[#43e97b] to-[#38f9d7]',
  'from-[#fa709a] to-[#fee140]',
];

// Variante como string CSS (para inline styles)
export const avatarGradientsCSS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
];

// ── Utilidad: Iniciales de un nombre ──
export const getInitials = (name) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

// ── Perfiles de usuario según rol ──
export const userProfiles = {
  admin: {
    name: 'Rosa Muñoz',
    initials: 'RM',
    role: 'Administrator',
    gradientClass: 'from-[#f093fb] to-[#f5576c]',
  },
  employee: {
    name: 'Antonio Pérez',
    initials: 'AP',
    role: 'Web Designer',
    gradientClass: 'from-[#6366f1] to-[#8b5cf6]',
  },
};

// ── Admin Dashboard: Departamentos ──
export const departmentData = [
  { name: 'IT',        present: 25, total: 50, status: 'good',    color: '#818cf8', barColor: 'bg-[#818cf8]' },
  { name: 'Sales',     present: 13, total: 50, status: 'warning', color: '#f59e0b', barColor: 'bg-[#f59e0b]' },
  { name: 'HR',        present: 28, total: 50, status: 'good',    color: '#34d399', barColor: 'bg-[#34d399]' },
  { name: 'Marketing', present: 30, total: 50, status: 'good',    color: '#22d3ee', barColor: 'bg-[#22d3ee]' },
];

// ── Admin Dashboard: Eventos recientes ──
export const recentEvents = [
  { name: 'Carlos Ruiz',  dept: 'IT',        time: '9:02 AM', type: 'in',    role: 'Backend Developer', email: 'carlos.ruiz@checkin.io'   },
  { name: 'Sofia Martín', dept: 'HR',        time: '9:15 AM', type: 'in',    role: 'HR Manager',        email: 'sofia.martin@checkin.io'  },
  { name: 'Pablo García', dept: 'Sales',     time: '9:47 AM', type: 'late',  role: 'Sales Executive',   email: 'pablo.garcia@checkin.io'  },
  { name: 'Elena Torres', dept: 'Marketing', time: 'All day', type: 'leave', role: 'Marketing Lead',    email: 'elena.torres@checkin.io'  },
  { name: 'Javier López', dept: 'IT',        time: '1:30 PM', type: 'out',   role: 'DevOps Engineer',   email: 'javier.lopez@checkin.io'  },
];

// ── Admin Dashboard: Configuración de tipos de evento ──
export const eventTypeConfig = {
  in:    { label: 'In',    textColor: 'text-[#34d399]', bg: 'bg-[#34d399]/10', border: 'border-[#34d399]/20', fullLabel: 'Checked In',   dot: '#34d399' },
  out:   { label: 'Out',   textColor: 'text-[#5a6478]', bg: 'bg-[#5a6478]/10', border: 'border-[#5a6478]/20', fullLabel: 'Checked Out',  dot: '#5a6478' },
  late:  { label: 'Late',  textColor: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/20', fullLabel: 'Late Arrival', dot: '#f59e0b' },
  leave: { label: 'Leave', textColor: 'text-[#818cf8]', bg: 'bg-[#818cf8]/10', border: 'border-[#818cf8]/20', fullLabel: 'On Leave',     dot: '#818cf8' },
};

// ── Admin Dashboard: KPI Cards ──
export const adminStatCards = [
  { label: 'Present Today', value: '96', sub: '/ 200 employees', trend: '+4 vs yesterday',     valueColor: '#34d399', iconBg: 'rgba(52,211,153,0.08)',   iconColor: '#34d399', cardBorder: 'rgba(52,211,153,0.15)',   glowBg: 'rgba(52,211,153,0.08)'   },
  { label: 'Late Arrivals',  value: '12', sub: 'Today',            trend: '-2 vs yesterday',    valueColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.08)',    iconColor: '#f59e0b', cardBorder: 'rgba(245,158,11,0.15)',    glowBg: 'rgba(245,158,11,0.08)'   },
  { label: 'On Leave',       value: '20', sub: 'Approved absences',trend: '3 pending approval', valueColor: '#818cf8', iconBg: 'rgba(129,140,248,0.08)',   iconColor: '#818cf8', cardBorder: 'rgba(129,140,248,0.15)',   glowBg: 'rgba(129,140,248,0.08)'  },
];

// ── Employees Page: Lista de empleados (ampliada con departamentos) ──
export const employeesData = [
  // IT
  { id: 1,  name: 'Nuria García Martínez',    role: 'IT Support',       dept: 'IT',        start: '8:30 AM',  end: '5:30 PM', status: 'On Time',  email: 'nuria.garcia@checkin.io',    phone: '+34 612 001 001', joinDate: '15 Mar 2023' },
  { id: 2,  name: 'Antonio Nieves Monge',     role: 'System Admin',     dept: 'IT',        start: '8:30 AM',  end: '5:30 PM', status: 'Late',     email: 'antonio.nieves@checkin.io',  phone: '+34 612 001 002', joinDate: '02 Jun 2022' },
  { id: 3,  name: 'Jaime López Ramos',        role: 'Network Eng.',     dept: 'IT',        start: '11:30 PM', end: '8:30 AM', status: 'On Leave', email: 'jaime.lopez@checkin.io',     phone: '+34 612 001 003', joinDate: '20 Jan 2024' },
  { id: 4,  name: 'Alejandro González Prada', role: 'Security Ops',     dept: 'IT',        start: '8:30 AM',  end: '5:30 PM', status: 'On Time',  email: 'alejandro.gp@checkin.io',    phone: '+34 612 001 004', joinDate: '10 Sep 2023' },
  { id: 5,  name: 'Lucía Sastre',             role: 'Data Analyst',     dept: 'IT',        start: '9:00 AM',  end: '6:00 PM', status: 'On Time',  email: 'lucia.sastre@checkin.io',    phone: '+34 612 001 005', joinDate: '08 Nov 2022' },
  // Sales
  { id: 6,  name: 'Carlos Ruiz Fernández',    role: 'Sales Executive',  dept: 'Sales',     start: '9:00 AM',  end: '6:00 PM', status: 'On Time',  email: 'carlos.ruiz@checkin.io',     phone: '+34 612 002 001', joinDate: '12 Apr 2023' },
  { id: 7,  name: 'Pablo García Navarro',     role: 'Account Manager',  dept: 'Sales',     start: '9:00 AM',  end: '6:00 PM', status: 'Late',     email: 'pablo.garcia@checkin.io',    phone: '+34 612 002 002', joinDate: '05 Jul 2022' },
  { id: 8,  name: 'Marina Rodríguez López',   role: 'Sales Lead',       dept: 'Sales',     start: '8:30 AM',  end: '5:30 PM', status: 'On Time',  email: 'marina.rodriguez@checkin.io', phone: '+34 612 002 003', joinDate: '18 Feb 2024' },
  // HR
  { id: 9,  name: 'Sofia Martín Vega',        role: 'HR Manager',       dept: 'HR',        start: '8:00 AM',  end: '5:00 PM', status: 'On Time',  email: 'sofia.martin@checkin.io',    phone: '+34 612 003 001', joinDate: '01 Mar 2021' },
  { id: 10, name: 'Andrea Jiménez Ruiz',      role: 'Recruiter',        dept: 'HR',        start: '9:00 AM',  end: '6:00 PM', status: 'On Time',  email: 'andrea.jimenez@checkin.io',  phone: '+34 612 003 002', joinDate: '22 Aug 2023' },
  { id: 11, name: 'David Moreno Castro',      role: 'People Ops',       dept: 'HR',        start: '8:30 AM',  end: '5:30 PM', status: 'On Leave', email: 'david.moreno@checkin.io',    phone: '+34 612 003 003', joinDate: '14 Dec 2022' },
  // Marketing
  { id: 12, name: 'Elena Torres Blanco',      role: 'Marketing Lead',   dept: 'Marketing', start: '9:00 AM',  end: '6:00 PM', status: 'On Time',  email: 'elena.torres@checkin.io',    phone: '+34 612 004 001', joinDate: '30 May 2022' },
  { id: 13, name: 'Raúl Sánchez Prieto',      role: 'Content Creator',  dept: 'Marketing', start: '9:30 AM',  end: '6:30 PM', status: 'Late',     email: 'raul.sanchez@checkin.io',    phone: '+34 612 004 002', joinDate: '11 Oct 2023' },
  { id: 14, name: 'Clara Díaz Herrero',       role: 'Social Media Mgr', dept: 'Marketing', start: '9:00 AM',  end: '6:00 PM', status: 'On Time',  email: 'clara.diaz@checkin.io',      phone: '+34 612 004 003', joinDate: '03 Jan 2024' },
];

// ── Employees Page: Estilos de badges de estado ──
export const employeeStatusStyles = {
  'On Time':  { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)' },
  'Late':     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
  'On Leave': { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
};

// ── Employee Dashboard: Horas semanales ──
export const weekData = [
  { day: 'Mon', hours: 8,   target: 8 },
  { day: 'Tue', hours: 9.5, target: 8 },
  { day: 'Wed', hours: 8.5, target: 8 },
  { day: 'Thu', hours: 10,  target: 8 },
  { day: 'Fri', hours: 7,   target: 8 },
  { day: 'Sat', hours: 0,   target: 0 },
];

// ── Employee Dashboard: Actividad del equipo ──
export const teamActivityData = [
  { name: 'Alejandro Nicolás', time: '04:30 PM', status: 'checked-in' },
  { name: 'Nuria García',      time: '04:30 PM', status: 'checked-in' },
  { name: 'Miguel Hernández',  time: '04:30 PM', status: 'checked-out' },
  { name: 'Diego Martín',      time: '04:30 PM', status: 'checked-in' },
  { name: 'Lucia Sastre',      time: '04:30 PM', status: 'checked-out' },
];

// ── Reports: Datos iniciales ──
export { default as initialReports } from './reportsData.js';

// ── Reports: Tarjetas KPI ──
export const reportsSummaryCards = [
  { title: 'Total Hours',       value: '156h',    sub: 'This month',     color: '#818cf8' },
  { title: 'Vacation Days',     value: '12 / 22', sub: 'Days remaining', color: '#34d399' },
  { title: 'Pending Requests',  value: '2',       sub: 'Needs approval', color: '#f59e0b' },
  { title: 'Incidents',         value: '1',       sub: 'Resolved',       color: '#f87171' },
];

// ── Reports: Estilos de estado ──
export { reportStatusStyles, reportTypeConfig } from './reportsData.js';

// ── Schedule: Config de tipos de evento ──
export const scheduleEventTypeConfig = {
  meeting:  { label: 'Meeting',  color: '#818cf8', bgClass: 'bg-[#818cf8]/12', borderClass: 'border-[#818cf8]/25', textClass: 'text-[#818cf8]' },
  deadline: { label: 'Deadline', color: '#f59e0b', bgClass: 'bg-[#f59e0b]/12', borderClass: 'border-[#f59e0b]/25', textClass: 'text-[#f59e0b]' },
  leave:    { label: 'Leave',    color: '#34d399', bgClass: 'bg-[#34d399]/12', borderClass: 'border-[#34d399]/25', textClass: 'text-[#34d399]' },
  other:    { label: 'Other',    color: '#22d3ee', bgClass: 'bg-[#22d3ee]/12', borderClass: 'border-[#22d3ee]/25', textClass: 'text-[#22d3ee]' },
};

// ── Admin Dashboard: Asistencia semanal (gráfico) ──
export const weeklyAttendanceData = [
  { day: 'Mon', present: 182, late: 10, absent: 8 },
  { day: 'Tue', present: 178, late: 14, absent: 8 },
  { day: 'Wed', present: 190, late: 6,  absent: 4 },
  { day: 'Thu', present: 185, late: 8,  absent: 7 },
  { day: 'Fri', present: 170, late: 12, absent: 18 },
];

// ── Admin Dashboard: Notificaciones ──
export const notificationsData = [
  { id: 1, title: 'New vacation request',       desc: 'Nuria García requested 3 days off',        time: '5 min ago',  read: false, type: 'request' },
  { id: 2, title: 'Late arrival alert',          desc: 'Pablo García arrived 47 min late today',   time: '23 min ago', read: false, type: 'alert' },
  { id: 3, title: 'Incident reported',           desc: 'Badge reader failure at main entrance',    time: '1h ago',     read: false, type: 'incident' },
  { id: 4, title: 'Monthly report ready',        desc: 'February attendance report is available',  time: '3h ago',     read: true,  type: 'info' },
  { id: 5, title: 'Employee onboarded',          desc: 'Clara Díaz has completed onboarding',      time: 'Yesterday',  read: true,  type: 'info' },
];

// ── Employee Dashboard: Notificaciones del empleado ──
export const employeeNotificationsData = [
  { id: 1, title: 'Vacation approved',         desc: 'Your summer holidays request was approved',  time: '2h ago',     read: false, type: 'success' },
  { id: 2, title: 'Schedule updated',          desc: 'Your shift on Friday has been modified',     time: '5h ago',     read: false, type: 'info' },
  { id: 3, title: 'Reminder',                  desc: 'Don\'t forget to submit your timesheet',     time: 'Yesterday',  read: true,  type: 'alert' },
  { id: 4, title: 'Team meeting',              desc: 'Standup at 10:00 AM in Room B3',             time: 'Yesterday',  read: true,  type: 'info' },
  { id: 5, title: 'Personal day rejected',     desc: 'Your request for Feb 10 was declined',       time: '3 days ago', read: true,  type: 'error' },
];