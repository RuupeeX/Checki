# CheckIn — Backend API

Workforce Management API built with **Node.js**, **Express**, **MySQL** and **JWT**.

## Requisitos

- Node.js 18+
- MySQL 8.0+

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu usuario/password de MySQL

# 3. Crear base de datos + datos de prueba
npm run db:init

# 4. Arrancar servidor
npm run dev
```

El servidor arranca en `http://localhost:3001`.

## Credenciales de prueba

| Rol      | Email                    | Password |
|----------|--------------------------|----------|
| Admin    | admin@checkin.io         | 1234     |
| Employee | antonio.perez@checkin.io | 1234     |

## Endpoints

### Auth
- `POST /api/auth/login` — Login (devuelve JWT)
- `POST /api/auth/register` — Registro
- `GET /api/auth/me` — Usuario actual (requiere token)

### Employees (Admin)
- `GET /api/employees` — Listar (con filtros: `?dept=IT&search=nuria&page=1`)
- `GET /api/employees/stats/departments` — Estadísticas por departamento
- `GET /api/employees/:id` — Detalle
- `POST /api/employees` — Crear
- `PUT /api/employees/:id` — Editar
- `DELETE /api/employees/:id` — Desactivar (soft delete)

### Attendance
- `POST /api/attendance/check-in` — Fichar entrada
- `POST /api/attendance/check-out` — Fichar salida
- `POST /api/attendance/break/start` — Iniciar pausa
- `POST /api/attendance/break/end` — Terminar pausa
- `GET /api/attendance/today` — Estado de hoy
- `GET /api/attendance/history` — Historial (`?from=&to=&user_id=`)
- `GET /api/attendance/weekly-stats` — Gráfico semanal (admin)

### Reports / Requests
- `GET /api/reports` — Listar (filtros: `?type=vacation&status=pending&dept=IT`)
- `GET /api/reports/stats` — Contadores por estado
- `POST /api/reports` — Crear solicitud
- `PATCH /api/reports/:id/status` — Aprobar/Rechazar (admin)
- `DELETE /api/reports/:id` — Cancelar (empleado, solo pending)

### Events / Schedule
- `GET /api/events` — Listar (`?from=&to=`)
- `POST /api/events` — Crear
- `PUT /api/events/:id` — Editar
- `DELETE /api/events/:id` — Eliminar

### Notifications
- `GET /api/notifications` — Listar (últimas 20)
- `PATCH /api/notifications/read-all` — Marcar todas leídas
- `PATCH /api/notifications/:id/read` — Marcar una leída

### Settings
- `GET /api/settings` — Obtener preferencias
- `PUT /api/settings` — Actualizar preferencias
- `PUT /api/settings/profile` — Actualizar perfil (nombre, email, etc.)
- `PUT /api/settings/password` — Cambiar contraseña

### Otros
- `GET /api/health` — Health check

## Estructura

```
checkin-backend/
├── config/
│   └── db.js              # Pool MySQL
├── controllers/
│   ├── authController.js
│   ├── attendanceController.js
│   ├── employeeController.js
│   ├── eventController.js
│   ├── notificationController.js
│   ├── reportController.js
│   └── settingsController.js
├── middleware/
│   └── auth.js            # JWT verify + adminOnly
├── routes/
│   ├── auth.js
│   ├── attendance.js
│   ├── employees.js
│   ├── events.js
│   ├── notifications.js
│   ├── reports.js
│   └── settings.js
├── sql/
│   ├── schema.sql         # DDL + seed data
│   └── init-db.js         # Script de inicialización
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```