-- ============================================================================
-- CheckIn — Schema unificado Web + Android
-- Compatible con ambas plataformas compartiendo la misma API REST
-- Ejecutar: mysql -u root -p < schema.sql  |  O usar: npm run db:init
-- ============================================================================

CREATE DATABASE IF NOT EXISTS checkin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE checkin_db;

-- ════════════════════════════════════════════════════════════════════════════
-- TABLAS
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. DEPARTAMENTOS ──
CREATE TABLE IF NOT EXISTS departments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. USUARIOS ──
-- Campos compartidos por Web y Android:
--   - email/password/name/role           → Login (ambas plataformas)
--   - job_title/dept_id/phone            → Perfil (Settings + Admin Employees)
--   - shift_start/shift_end              → Horario asignado
--   - location (Android HomeScreen)      → Ubicación de trabajo: 'office' | 'home' | 'remote'
--   - avatar_url                         → Foto de perfil (Settings en ambas)
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(150) NOT NULL,
  role        ENUM('admin', 'employee') DEFAULT 'employee',
  job_title   VARCHAR(100),
  dept_id     INT,
  phone       VARCHAR(30),
  avatar_url  VARCHAR(500),
  location    ENUM('office', 'home', 'remote') DEFAULT 'office',
  shift_start TIME DEFAULT '08:30:00',
  shift_end   TIME DEFAULT '17:30:00',
  join_date   DATE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_users_dept (dept_id),
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
);

-- ── 3. ASISTENCIA (check-in / check-out) ──
-- Campos compartidos:
--   - check_in/check_out                 → HomeScreen (Android) + EmployeeDashboard (Web)
--   - status                             → Estado del día
--   - location (Android)                 → Desde dónde fichó (office/home)
--   - worked_minutes                     → Minutos trabajados (RecordScreen Android los calcula)
CREATE TABLE IF NOT EXISTS attendance (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  date            DATE NOT NULL,
  check_in        DATETIME,
  check_out       DATETIME,
  status          ENUM('on_time', 'late', 'absent', 'on_leave') DEFAULT 'on_time',
  location        ENUM('office', 'home', 'remote') DEFAULT 'office',
  worked_minutes  INT DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (user_id, date),
  INDEX idx_attendance_date (date),
  INDEX idx_attendance_status (status)
);

-- ── 4. BREAKS (pausas dentro de un día) ──
-- HomeScreen (Android): toggleBreak()  |  EmployeeDashboard (Web): Start/End Break
CREATE TABLE IF NOT EXISTS breaks (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  attendance_id   INT NOT NULL,
  start_time      DATETIME NOT NULL,
  end_time        DATETIME,
  duration_minutes INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE,
  INDEX idx_breaks_attendance (attendance_id)
);

-- ── 5. REPORTS / REQUESTS ──
-- Web: vacation, medical, incident, timesheet
-- Android: medical_appointment, cannot_clock_in, system_error, other
-- Unificamos con ENUM amplio + campo 'reason' (Android) + 'description' (Web)
CREATE TABLE IF NOT EXISTS reports (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  type        ENUM('vacation', 'medical', 'incident', 'timesheet', 'clock_issue', 'system_error', 'other') NOT NULL,
  reason      VARCHAR(255),
  description TEXT,
  date        DATE NOT NULL,
  status      ENUM('pending', 'approved', 'rejected', 'resolved') DEFAULT 'pending',
  reviewed_by INT,
  reviewed_at DATETIME,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reports_user (user_id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_date (date)
);

-- ── 6. SCHEDULE / EVENTS ──
-- Web: Schedule page events
-- Android: puede usarse para futuras features de calendario
CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  date        DATE NOT NULL,
  time        TIME,
  type        ENUM('meeting', 'deadline', 'leave', 'other') DEFAULT 'meeting',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_events_user_date (user_id, date)
);

-- ── 7. NOTIFICACIONES ──
-- Compartidas: ambas plataformas reciben notificaciones del servidor
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  type        ENUM('info', 'success', 'alert', 'error', 'request', 'incident') DEFAULT 'info',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifs_user_read (user_id, is_read)
);

-- ── 8. SETTINGS (preferencias por usuario) ──
-- Web: theme, language, timezone, notification prefs, quiet hours
-- Android: notifications, gps, language
-- Unificamos todo en una tabla flexible
CREATE TABLE IF NOT EXISTS user_settings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE,
  -- Apariencia
  theme           ENUM('light', 'dark', 'system') DEFAULT 'dark',
  language        VARCHAR(10) DEFAULT 'en',
  timezone        VARCHAR(50) DEFAULT 'Europe/Madrid',
  date_format     VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  time_format     ENUM('12h', '24h') DEFAULT '24h',
  -- Notificaciones (compartidas Web + Android)
  notif_enabled   BOOLEAN DEFAULT TRUE,
  email_checkin   BOOLEAN DEFAULT TRUE,
  email_late      BOOLEAN DEFAULT TRUE,
  email_reports   BOOLEAN DEFAULT FALSE,
  push_checkin    BOOLEAN DEFAULT TRUE,
  push_late       BOOLEAN DEFAULT FALSE,
  -- Android específico
  gps_enabled     BOOLEAN DEFAULT TRUE,
  -- Quiet hours (Web)
  quiet_hours     BOOLEAN DEFAULT TRUE,
  quiet_from      TIME DEFAULT '22:00:00',
  quiet_to        TIME DEFAULT '08:00:00',
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 9. AUDIT LOG (opcional — registra acciones importantes) ──
-- Útil para ambas plataformas: quién hizo qué y cuándo
CREATE TABLE IF NOT EXISTS audit_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(50),
  entity_id   INT,
  details     JSON,
  ip_address  VARCHAR(45),
  platform    ENUM('web', 'android', 'api') DEFAULT 'api',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_date (created_at)
);


-- ════════════════════════════════════════════════════════════════════════════
-- DATOS DE PRUEBA (SEED)
-- ════════════════════════════════════════════════════════════════════════════

-- Departamentos (ampliados para Android que usa más)
INSERT INTO departments (name) VALUES
  ('IT'), ('Sales'), ('HR'), ('Marketing'), ('Finance'), ('Operations')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Usuarios — password "1234" (el hash real se genera con npm run db:init)
-- Incluye empleados de ambas plataformas
INSERT INTO users (email, password, name, role, job_title, dept_id, phone, location, shift_start, shift_end, join_date) VALUES
  -- Admin
  ('admin@checkin.io',              '$2a$10$placeholder', 'Rosa Muñoz',                'admin',    'Administrator',    3, '+34 612 000 001', 'office', '08:00:00', '17:00:00', '2021-01-15'),
  -- Empleados Web
  ('antonio.perez@checkin.io',      '$2a$10$placeholder', 'Antonio Pérez',             'employee', 'Web Designer',     1, '+34 612 001 000', 'office', '09:00:00', '18:00:00', '2022-06-01'),
  ('nuria.garcia@checkin.io',       '$2a$10$placeholder', 'Nuria García Martínez',     'employee', 'IT Support',       1, '+34 612 001 001', 'office', '08:30:00', '17:30:00', '2023-03-15'),
  ('antonio.nieves@checkin.io',     '$2a$10$placeholder', 'Antonio Nieves Monge',      'employee', 'System Admin',     1, '+34 612 001 002', 'office', '08:30:00', '17:30:00', '2022-06-02'),
  ('jaime.lopez@checkin.io',        '$2a$10$placeholder', 'Jaime López Ramos',         'employee', 'Network Eng.',     1, '+34 612 001 003', 'remote', '23:30:00', '08:30:00', '2024-01-20'),
  ('alejandro.gp@checkin.io',       '$2a$10$placeholder', 'Alejandro González Prada',  'employee', 'Security Ops',     1, '+34 612 001 004', 'office', '08:30:00', '17:30:00', '2023-09-10'),
  ('lucia.sastre@checkin.io',       '$2a$10$placeholder', 'Lucía Sastre',              'employee', 'Data Analyst',     1, '+34 612 001 005', 'home',   '09:00:00', '18:00:00', '2022-11-08'),
  ('carlos.ruiz@checkin.io',        '$2a$10$placeholder', 'Carlos Ruiz Fernández',     'employee', 'Sales Executive',  2, '+34 612 002 001', 'office', '09:00:00', '18:00:00', '2023-04-12'),
  ('pablo.garcia@checkin.io',       '$2a$10$placeholder', 'Pablo García Navarro',      'employee', 'Account Manager',  2, '+34 612 002 002', 'office', '09:00:00', '18:00:00', '2022-07-05'),
  ('marina.rodriguez@checkin.io',   '$2a$10$placeholder', 'Marina Rodríguez López',    'employee', 'Sales Lead',       2, '+34 612 002 003', 'office', '08:30:00', '17:30:00', '2024-02-18'),
  ('sofia.martin@checkin.io',       '$2a$10$placeholder', 'Sofia Martín Vega',         'employee', 'HR Manager',       3, '+34 612 003 001', 'office', '08:00:00', '17:00:00', '2021-03-01'),
  ('andrea.jimenez@checkin.io',     '$2a$10$placeholder', 'Andrea Jiménez Ruiz',       'employee', 'Recruiter',        3, '+34 612 003 002', 'office', '09:00:00', '18:00:00', '2023-08-22'),
  ('david.moreno@checkin.io',       '$2a$10$placeholder', 'David Moreno Castro',       'employee', 'People Ops',       3, '+34 612 003 003', 'home',   '08:30:00', '17:30:00', '2022-12-14'),
  ('elena.torres@checkin.io',       '$2a$10$placeholder', 'Elena Torres Blanco',       'employee', 'Marketing Lead',   4, '+34 612 004 001', 'office', '09:00:00', '18:00:00', '2022-05-30'),
  ('raul.sanchez@checkin.io',       '$2a$10$placeholder', 'Raúl Sánchez Prieto',       'employee', 'Content Creator',  4, '+34 612 004 002', 'home',   '09:30:00', '18:30:00', '2023-10-11'),
  ('clara.diaz@checkin.io',         '$2a$10$placeholder', 'Clara Díaz Herrero',        'employee', 'Social Media Mgr', 4, '+34 612 004 003', 'office', '09:00:00', '18:00:00', '2024-01-03'),
  -- Empleados Android (nuevos, de AdminEmployeesScreen.kt)
  ('juan.perez@checkin.io',         '$2a$10$placeholder', 'Juan Pérez',                'employee', 'Developer',        1, '+34 612 005 001', 'office', '08:00:00', '17:00:00', '2023-02-01'),
  ('maria.garcia@checkin.io',       '$2a$10$placeholder', 'María García',              'employee', 'HR Manager',       3, '+34 612 005 002', 'home',   '08:15:00', '17:15:00', '2022-09-15'),
  ('luis.martinez@checkin.io',      '$2a$10$placeholder', 'Luis Martínez',             'employee', 'Accountant',       5, '+34 612 005 003', 'office', '08:30:00', '17:30:00', '2023-05-10'),
  ('ana.fernandez@checkin.io',      '$2a$10$placeholder', 'Ana Fernández',             'employee', 'Designer',         4, '+34 612 005 004', 'home',   '09:00:00', '18:00:00', '2023-07-20'),
  ('sara.mendez@checkin.io',        '$2a$10$placeholder', 'Sara Méndez',               'employee', 'Sales Rep',        2, '+34 612 005 005', 'office', '08:45:00', '17:45:00', '2024-01-10'),
  ('david.lopez@checkin.io',        '$2a$10$placeholder', 'David López',               'employee', 'Ops Manager',      6, '+34 612 005 006', 'office', '07:50:00', '16:50:00', '2022-03-01')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Reports de ejemplo (tipos ampliados para Android)
INSERT INTO reports (user_id, type, reason, description, date, status) VALUES
  -- Web reports (Antonio Pérez = user_id 2)
  (2,  'vacation',    'Summer holidays',        'Summer holidays trip',                    '2026-03-15', 'approved'),
  (2,  'medical',     'Medical appointment',    'Dentist appointment (Morning)',            '2026-03-02', 'pending'),
  (2,  'incident',    'Clock issue',            'Forgot to clock out',                     '2026-02-28', 'resolved'),
  (2,  'vacation',    'Personal day',           'Personal day',                            '2026-02-10', 'rejected'),
  (2,  'timesheet',   'Monthly report',         'January Monthly Report',                  '2026-01-31', 'approved'),
  -- Otros empleados
  (3,  'vacation',    'Family trip',            'Family trip to Portugal',                  '2026-03-14', 'pending'),
  (5,  'medical',     'Medical appointment',    'Ophthalmologist checkup',                  '2026-03-12', 'pending'),
  (6,  'incident',    'System error',           'Badge reader failure at entrance',         '2026-03-05', 'pending'),
  (7,  'vacation',    'Moving',                 'Moving to a new apartment',                '2026-03-01', 'approved'),
  (8,  'vacation',    'Wedding',                'Wedding attendance',                       '2026-02-28', 'pending'),
  (11, 'medical',     'Medical appointment',    'Physical therapy session',                 '2026-02-25', 'approved'),
  (14, 'vacation',    'Ski trip',               'Ski trip — 3 days off',                    '2026-02-18', 'rejected'),
  -- Android reports (de AdminReportsScreen.kt)
  (19, 'medical',     'Medical appointment',    'Llegaré 2 horas tarde hoy por el dentista.',              '2026-03-10', 'pending'),
  (18, 'clock_issue', 'Cannot clock in',        'El sistema no me deja registrar la entrada.',              '2026-03-10', 'pending'),
  (22, 'system_error','System error',           'La app se cierra sola al intentar marcar la salida.',      '2026-03-10', 'pending'),
  (20, 'medical',     'Medical appointment',    'Tengo revisión médica esta tarde, saldré a las 15:00.',    '2026-03-09', 'approved'),
  (8,  'other',       'Schedule change',        'Necesito ajustar mi horario esta semana.',                 '2026-03-09', 'pending'),
  (21, 'clock_issue', 'Cannot clock in',        'No puedo fichar desde hace dos días.',                     '2026-03-08', 'rejected');

-- Notificaciones de ejemplo
INSERT INTO notifications (user_id, title, description, type, is_read) VALUES
  -- Admin
  (1, 'New vacation request',    'Nuria García requested 3 days off',       'request',  FALSE),
  (1, 'Late arrival alert',       'Pablo García arrived 47 min late today',  'alert',    FALSE),
  (1, 'Incident reported',        'Badge reader failure at main entrance',   'incident', FALSE),
  (1, 'Monthly report ready',     'February attendance report is available', 'info',     TRUE),
  (1, 'Employee onboarded',       'Clara Díaz has completed onboarding',    'info',     TRUE),
  (1, 'Android: clock issue',     'María García cannot clock in',           'alert',    FALSE),
  -- Antonio Pérez
  (2, 'Vacation approved',        'Your summer holidays request was approved','success', FALSE),
  (2, 'Schedule updated',         'Your shift on Friday has been modified',  'info',     FALSE),
  (2, 'Reminder',                 'Don''t forget to submit your timesheet',  'alert',    TRUE),
  (2, 'Team meeting',             'Standup at 10:00 AM in Room B3',          'info',     TRUE),
  (2, 'Personal day rejected',    'Your request for Feb 10 was declined',    'error',    TRUE);

-- Events de ejemplo
INSERT INTO events (user_id, title, date, time, type) VALUES
  (2, 'Team Meeting',           '2026-03-10', '10:00:00', 'meeting'),
  (2, 'Summer Holiday Request', '2026-03-14', '12:00:00', 'deadline');

-- Attendance de ejemplo (para que los dashboards tengan datos)
INSERT INTO attendance (user_id, date, check_in, check_out, status, location, worked_minutes) VALUES
  (2,  '2026-03-10', '2026-03-10 09:02:00', NULL,                     'on_time', 'office', 0),
  (3,  '2026-03-10', '2026-03-10 08:28:00', NULL,                     'on_time', 'office', 0),
  (4,  '2026-03-10', '2026-03-10 09:15:00', NULL,                     'late',    'office', 0),
  (7,  '2026-03-10', '2026-03-10 08:45:00', NULL,                     'on_time', 'home',   0),
  (8,  '2026-03-10', '2026-03-10 09:00:00', NULL,                     'on_time', 'office', 0),
  (11, '2026-03-10', '2026-03-10 08:00:00', NULL,                     'on_time', 'office', 0),
  (14, '2026-03-10', '2026-03-10 09:05:00', NULL,                     'on_time', 'office', 0),
  (17, '2026-03-10', '2026-03-10 08:00:00', NULL,                     'on_time', 'office', 0),
  (18, '2026-03-10', '2026-03-10 08:20:00', NULL,                     'on_time', 'home',   0),
  (22, '2026-03-10', '2026-03-10 07:55:00', NULL,                     'on_time', 'office', 0),
  -- Día anterior completo
  (2,  '2026-03-09', '2026-03-09 09:00:00', '2026-03-09 18:05:00',   'on_time', 'office', 540),
  (3,  '2026-03-09', '2026-03-09 08:30:00', '2026-03-09 17:35:00',   'on_time', 'office', 540),
  (8,  '2026-03-09', '2026-03-09 09:47:00', '2026-03-09 18:00:00',   'late',    'office', 493),
  (17, '2026-03-09', '2026-03-09 08:02:00', '2026-03-09 17:10:00',   'on_time', 'office', 548);