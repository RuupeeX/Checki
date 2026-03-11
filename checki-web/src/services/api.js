// ============================================================================
// api.js — Servicio centralizado de conexión con el backend
// Todas las llamadas a la API pasan por aquí.
// ============================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Helpers ──
function getToken() {
  return localStorage.getItem('checkin-token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si el token expiró, limpiar y recargar
  if (res.status === 401 && token) {
    localStorage.removeItem('checkin-token');
    localStorage.removeItem('checkin-user');
    window.location.reload();
    return;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ============================================================================
// AUTH
// ============================================================================
export const auth = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request('/auth/me'),
};

// ============================================================================
// EMPLOYEES
// ============================================================================
export const employees = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/employees${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/employees/${id}`),

  create: (data) =>
    request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    request(`/employees/${id}`, { method: 'DELETE' }),

  departmentStats: () => request('/employees/stats/departments'),
};

// ============================================================================
// ATTENDANCE
// ============================================================================
export const attendance = {
  checkIn: (location = 'office') =>
    request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ location }),
    }),

  checkOut: () =>
    request('/attendance/check-out', { method: 'POST' }),

  startBreak: () =>
    request('/attendance/break/start', { method: 'POST' }),

  endBreak: () =>
    request('/attendance/break/end', { method: 'POST' }),

  getToday: () => request('/attendance/today'),

  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance/history${query ? `?${query}` : ''}`);
  },

  weeklyStats: () => request('/attendance/weekly-stats'),
};

// ============================================================================
// REPORTS
// ============================================================================
export const reports = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports${query ? `?${query}` : ''}`);
  },

  stats: () => request('/reports/stats'),

  create: (data) =>
    request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id, status) =>
    request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  remove: (id) =>
    request(`/reports/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// EVENTS
// ============================================================================
export const events = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/events${query ? `?${query}` : ''}`);
  },

  create: (data) =>
    request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    request(`/events/${id}`, { method: 'DELETE' }),
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export const notifications = {
  getAll: () => request('/notifications'),

  markAllRead: () =>
    request('/notifications/read-all', { method: 'PATCH' }),

  markRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),
};

// ============================================================================
// SETTINGS
// ============================================================================
export const settings = {
  get: () => request('/settings'),

  update: (data) =>
    request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateProfile: (data) =>
    request('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePassword: (data) =>
    request('/settings/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// HEALTH
// ============================================================================
export const health = () => request('/health');

// Export por defecto agrupado
export default { auth, employees, attendance, reports, events, notifications, settings, health };