import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Dropdown de notificaciones reutilizable para Admin y Employee.
 *
 * @param {Object}   tokens          - Design tokens del tema
 * @param {Function} onClose         - Cerrar el dropdown
 * @param {Array}    notifications   - Array de notificaciones [{ id, title, desc, time, read, type }]
 * @param {Object}   typeColors      - Mapa tipo → color hex  e.g. { request: '#f59e0b', ... }
 */
export default function NotificationsDropdown({ tokens, onClose, notifications: initialNotifs, typeColors }) {
  const [notifications, setNotifications] = useState(initialNotifs);
  const unread = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const ref = useRef(null);

  // Sincronizar si cambian las props
  useEffect(() => {
    setNotifications(initialNotifs);
  }, [initialNotifs]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Cerrar con Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 z-[60] w-[320px] rounded-[16px] border shadow-[0_16px_48px_rgba(0,0,0,0.4)] sm:w-[360px]"
      style={{ background: tokens.bgCard, borderColor: tokens.border }}
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: tokens.borderSide }}>
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold" style={{ color: tokens.textPrimary }}>Notifications</p>
          {unread > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f87171] px-1.5 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="text-[11px] font-medium text-[#818cf8]">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="sm:hidden" style={{ color: tokens.textSecondary }} aria-label="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[300px] overflow-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex gap-3 border-b px-5 py-3 transition-colors last:border-none"
            style={{
              borderColor: tokens.borderSide,
              background: n.read ? 'transparent' : 'rgba(99,102,241,0.03)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = tokens.bgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(99,102,241,0.03)'; }}
          >
            <div
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `${typeColors[n.type] || '#818cf8'}15`,
                border: `1.5px solid ${typeColors[n.type] || '#818cf8'}30`,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: typeColors[n.type] || '#818cf8' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold leading-tight" style={{ color: tokens.textPrimary }}>{n.title}</p>
              <p className="mt-0.5 truncate text-[11px]" style={{ color: tokens.textSecondary }}>{n.desc}</p>
              <p className="mt-0.5 text-[10px]" style={{ color: tokens.textMuted }}>{n.time}</p>
            </div>
            {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6366f1]" />}
          </div>
        ))}
      </div>
    </div>
  );
}