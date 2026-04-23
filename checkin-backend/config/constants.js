// ============================================================================
// CheckIn — Mensajes y constantes centralizadas
// ============================================================================

const ERRORS = {
  // Genéricos
  INTERNAL:           'Internal server error.',
  NOT_FOUND:          'Resource not found.',
  NO_FIELDS:          'No fields to update.',
  INVALID_STATUS:     'Invalid status value.',

  // Auth
  CREDENTIALS_REQUIRED: 'Email and password are required.',
  INVALID_CREDENTIALS:  'Invalid credentials.',
  NO_TOKEN:             'Access denied. No token provided.',
  INVALID_TOKEN:        'Invalid or expired token.',
  ADMIN_ONLY:           'Access denied. Admin privileges required.',

  // Usuarios / Empleados
  EMAIL_NAME_REQUIRED:  'Email and name are required.',
  EMAIL_EXISTS:         'Email already registered.',
  EMAIL_IN_USE:         'Email already in use.',
  EMPLOYEE_NOT_FOUND:   'Employee not found.',
  USER_NOT_FOUND:       'User not found.',

  // Asistencia
  ALREADY_CHECKED_IN:   'Already checked in today.',
  NO_ACTIVE_CHECKIN:    'No active check-in found for today.',
  NO_ACTIVE_CHECKIN_SHORT: 'No active check-in found.',
  BREAK_IN_PROGRESS:    'Break already in progress.',
  NO_ACTIVE_BREAK:      'No active break found.',

  // Reportes
  TYPE_DATE_REQUIRED:   'Type and date are required.',
  REPORT_NOT_FOUND:     'Report not found.',
  NOT_AUTHORIZED:       'Not authorized.',
  ONLY_PENDING:         'Only pending requests can be cancelled.',
  INVALID_REPORT_STATUS:'Invalid status. Must be: approved, rejected or resolved.',

  // Eventos
  TITLE_DATE_REQUIRED:  'Title and date are required.',
  EVENT_NOT_FOUND:      'Event not found.',

  // Contraseña
  PASSWORDS_REQUIRED:   'Both current and new password are required.',
  PASSWORD_TOO_SHORT:   `Password must be at least ${process.env.MIN_PASSWORD_LENGTH || 4} characters.`,
  WRONG_PASSWORD:       'Current password is incorrect.',
  NAME_EMAIL_REQUIRED:  'Name, email and password are required.',
};

const SUCCESS = {
  CHECKED_OUT:          'Checked out successfully.',
  BREAK_ENDED:          'Break ended.',
  ALL_NOTIF_READ:       'All notifications marked as read.',
  NOTIF_READ:           'Notification marked as read.',
  EMPLOYEE_DELETED:     'Employee deleted.',
  REPORT_DELETED:       'Report deleted.',
  EVENT_DELETED:        'Event deleted.',
  PASSWORD_UPDATED:     'Password updated successfully.',
};

const REPORT_STATUSES  = ['approved', 'rejected', 'resolved'];
const LOCATION_OPTIONS = ['office', 'home', 'remote'];
const EVENT_TYPES      = ['meeting', 'deadline', 'reminder', 'other'];
const ROLES            = ['admin', 'employee'];

module.exports = { ERRORS, SUCCESS, REPORT_STATUSES, LOCATION_OPTIONS, EVENT_TYPES, ROLES };