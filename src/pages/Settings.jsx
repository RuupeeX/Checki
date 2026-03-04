import React, { useState } from 'react';
import {
  Home, Calendar, BarChart2, Settings as SettingsIcon, LogOut,
  CheckCircle2, Sun, Moon, Monitor, Check,
  Bell, Shield, Globe, User, Users, Camera, Save,
  RotateCcw, Eye, EyeOff, AlertTriangle,
  Clock, Mail, Smartphone, ChevronRight, Palette,
} from 'lucide-react';
// Importamos el contexto del tema para aplicar los colores correctos dinámicamente
import { useTheme, useTokens } from '../contexts/Themecontext';

// ============================================================================
// 1. COMPONENTES PRIMITIVOS REUTILIZABLES (UI KIT)
// Estos pequeños componentes evitan repetir código en los formularios de ajustes.
// ============================================================================

// Interruptor (Switch) personalizado tipo iOS
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative', height: 22, width: 40, borderRadius: 11,
        border: 'none', cursor: 'pointer', flexShrink: 0,
        background: checked ? '#6366f1' : '#2a2f3a', transition: 'background 0.3s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, height: 16, width: 16, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        left: checked ? 'calc(100% - 19px)' : 3, transition: 'left 0.3s',
      }} />
    </button>
  );
}

// Campo de texto genérico (Soporta tipo 'text', 'email' o 'password' con botón de ver/ocultar)
function FieldInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  const tokens = useTokens();
  const [show, setShow] = useState(false); // Estado para mostrar/ocultar contraseña
  const isPassword = type === 'password';
  return (
    <div>
      {/* Etiqueta del campo (opcional) */}
      {label && (
        <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: tokens.textSecondary }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          // Si es un password y le damos al ojito, cambiamos temporalmente el tipo a texto
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 13,
            background: tokens.bgInput, border: `1px solid ${tokens.border}`,
            color: tokens.textPrimary, outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
          onBlur={(e)  => (e.target.style.borderColor = tokens.border)}
        />
        {/* Renderiza el botón del ojo solo si el campo es de tipo password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: tokens.textSecondary }}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

// Campo desplegable (Select) personalizado
function FieldSelect({ label, value, onChange, options }) {
  const tokens = useTokens();
  return (
    <div>
      {label && (
        <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: tokens.textSecondary }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 13,
          background: tokens.bgInput, border: `1px solid ${tokens.border}`,
          color: tokens.textPrimary, outline: 'none', cursor: 'pointer', appearance: 'none',
        }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// Tarjeta base para envolver cada sección de los ajustes
function Card({ children }) {
  const tokens = useTokens();
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${tokens.border}`, padding: 24, background: tokens.bgCard }}>
      {children}
    </div>
  );
}

// Título estandarizado para cada sección con su icono
function SectionTitle({ icon: Icon, title, description }) {
  const tokens = useTokens();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Icon size={16} color="#fff" />
      </div>
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: tokens.textPrimary, margin: 0 }}>{title}</p>
        {description && <p style={{ fontSize: 12, color: tokens.textSecondary, margin: '3px 0 0' }}>{description}</p>}
      </div>
    </div>
  );
}

// Línea horizontal divisoria
function Divider() {
  const tokens = useTokens();
  return <div style={{ height: 1, background: tokens.border, margin: '20px 0' }} />;
}

// ============================================================================
// 2. COMPONENTES DE SECCIÓN (Cada página dentro de Configuración)
// ============================================================================

// 2.1 Sección de Apariencia (Modo Claro/Oscuro)
function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const tokens = useTokens();
  const [accent, setAccent] = useState('indigo');
  const [density, setDensity] = useState('comfortable');

  const themes = [
    { id: 'light',  label: 'Light',  Icon: Sun },
    { id: 'dark',   label: 'Dark',   Icon: Moon },
    { id: 'system', label: 'System', Icon: Monitor },
  ];
  // Colores de acento (Aun no conectados globalmente, solo UI ilustrativa)
  const accents = [
    { id: 'indigo',   color: '#6366f1' },
    { id: 'violet',   color: '#8b5cf6' },
    { id: 'sky',      color: '#0ea5e9' },
    { id: 'emerald',  color: '#10b981' },
    { id: 'rose',     color: '#f43f5e' },
    { id: 'amber',    color: '#f59e0b' },
  ];

  return (
    <Card>
      <SectionTitle icon={Palette} title="Appearance" description="Customize how CheckIn looks and feels" />

      {/* Selector de Modo Claro / Oscuro / Sistema */}
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: tokens.textMuted, marginBottom: 12 }}>Color Theme</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {themes.map(({ id, label, Icon: I }) => {
          const active = theme === id;
          return (
            <button
              key={id}
              onClick={() => setTheme(id)} // Llama al contexto real para cambiar el tema
              style={{
                position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                borderRadius: 14, border: `2px solid ${active ? '#6366f1' : tokens.border}`,
                padding: 16, cursor: 'pointer', transition: 'all 0.2s',
                background: active ? (tokens.isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)') : tokens.bgInput,
              }}
            >
              <div style={{ width: '100%', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <I size={24} color={active ? '#818cf8' : tokens.textSecondary} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: active ? '#818cf8' : tokens.textSecondary }}>{label}</span>
              {/* Check azul en la esquina si está activo */}
              {active && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={10} color="#fff" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Divider />

      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: tokens.textMuted, marginBottom: 12 }}>Accent Color</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {accents.map(({ id, color }) => (
          <button
            key={id}
            onClick={() => setAccent(id)}
            style={{
              width: 32, height: 32, borderRadius: '50%', background: color, border: 'none', cursor: 'pointer',
              boxShadow: accent === id ? `0 0 0 2px ${tokens.bgCard}, 0 0 0 4px ${color}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.15s',
            }}
          >
            {accent === id && <Check size={12} color="#fff" />}
          </button>
        ))}
      </div>

      <Divider />

      <FieldSelect
        label="Interface Density"
        value={density}
        onChange={setDensity}
        options={[
          { value: 'compact',      label: 'Compact' },
          { value: 'comfortable',  label: 'Comfortable (default)' },
          { value: 'spacious',     label: 'Spacious' },
        ]}
      />
    </Card>
  );
}

// 2.2 Sección de Perfil (Datos del Usuario)
function ProfileSection({ role }) {
  const tokens = useTokens();
  const isAdmin = role === 'admin';
  
  // Establecemos datos por defecto dependiendo de si somos Admin o Empleado
  const [name,     setName]     = useState(isAdmin ? 'Rosa Muñoz' : 'Antonio Pérez');
  const [email,    setEmail]    = useState(isAdmin ? 'rosa@co.com' : 'antonio@co.com');
  const [jobTitle, setJobTitle] = useState(isAdmin ? 'Administrator' : 'Web Designer');
  const [dept,     setDept]     = useState(isAdmin ? 'Management' : 'IT');
  const [phone,    setPhone]    = useState('+34 612 345 678');
  // Estado para animar el botón de guardado ("Save changes" -> "Saved!")
  const [saved,    setSaved]    = useState(false);
  
  // Generador dinámico de iniciales y colores de fondo para el Avatar
  const ini = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const gradientBG = isAdmin ? 'linear-gradient(135deg,#f093fb,#f5576c)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)';

  return (
    <Card>
      <SectionTitle icon={User} title="Profile" description="Your personal information and account details" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        {/* Componente del Avatar (Foto de perfil circular) */}
        <div style={{ position: 'relative' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: gradientBG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>
            {ini}
          </div>
          {/* Botoncito para subir foto nueva */}
          <button style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: '#6366f1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={11} color="#fff" />
          </button>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: tokens.textPrimary, margin: 0 }}>{name}</p>
          <p style={{ fontSize: 12, color: tokens.textSecondary, margin: '2px 0 4px' }}>{jobTitle} · {dept}</p>
          <button style={{ fontSize: 11, fontWeight: 500, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Change photo</button>
        </div>
      </div>
      {/* Formulario usando el Grid para acomodar los inputs a 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FieldInput label="Full Name"   value={name}     onChange={setName}     placeholder="Your name" />
        <FieldInput label="Email"       value={email}    onChange={setEmail}    type="email" />
        <FieldInput label="Job Title"   value={jobTitle} onChange={setJobTitle} />
        <FieldSelect label="Department" value={dept}     onChange={setDept}
          options={['IT', 'Sales', 'HR', 'Marketing', 'Management'].map(v => ({ value: v, label: v }))}
        />
        <FieldInput label="Phone" value={phone} onChange={setPhone} />
      </div>
      {/* Botones de Guardado y Reseteo */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, border: `1px solid ${tokens.border}`, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: tokens.textSecondary, background: 'none', cursor: 'pointer' }}>
          <RotateCcw size={12} /> Reset
        </button>
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} // Simula guardado durante 2 segundos
          style={{
            display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, border: 'none',
            padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'all 0.3s',
            // Cambia el color a Verde (#16a34a) si 'saved' es true
            background: saved ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            boxShadow: saved ? '0 4px 16px rgba(22,163,74,0.3)' : '0 4px 16px rgba(99,102,241,0.25)',
          }}
        >
          {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save changes</>}
        </button>
      </div>
    </Card>
  );
}

// 2.3 Sección de Notificaciones
function NotificationsSection() {
  const tokens = useTokens();
  // Estado que agrupa todos los booleanos de los interruptores (Toggles)
  const [settings, setSettings] = useState({
    emailCheckIn: true, emailLate: true, emailReports: false,
    pushCheckIn: true, pushLate: false,
    slackDaily: true, slackAlerts: true,
    quietEnabled: true, quietFrom: '22:00', quietTo: '08:00',
  });
  
  // Función para invertir el valor de un Toggle específico
  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

  // Estructura de los bloques (Email, Push, Slack) para iterarlos dinámicamente y no repetir código
  const channels = [
    { Icon: Mail, label: 'Email', rows: [
      { label: 'Check-in & check-out alerts', desc: 'Email when employees log in or out', key: 'emailCheckIn' },
      { label: 'Late arrival alerts',         desc: 'Notified when someone arrives late', key: 'emailLate' },
      { label: 'Weekly reports',              desc: 'Summary report every Monday',        key: 'emailReports' },
    ]},
    { Icon: Smartphone, label: 'Push', rows: [
      { label: 'Check-in reminders', desc: 'Remind me to clock in at my usual time', key: 'pushCheckIn' },
      { label: 'Absence alerts',     desc: 'Alert when a team member is absent',    key: 'pushLate' },
    ]},
    { Icon: Bell, label: 'Slack', rows: [
      { label: 'Daily digest', desc: 'Post daily attendance summary to Slack', key: 'slackDaily' },
      { label: 'Live alerts',  desc: 'Post late arrival alerts in real time',  key: 'slackAlerts' },
    ]},
  ];

  return (
    <Card>
      <SectionTitle icon={Bell} title="Notifications" description="Control when and how you receive alerts" />
      {/* Mapeo de Canales (Email, Push...) */}
      {channels.map(({ Icon: I, label, rows }) => (
        <div key={label} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <I size={12} color={tokens.textMuted} />
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: tokens.textMuted, margin: 0 }}>{label}</p>
          </div>
          <div style={{ borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
            {/* Mapeo de filas dentro de cada Canal */}
            {rows.map((row, i) => (
              <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < rows.length - 1 ? `1px solid ${tokens.border}` : 'none' }}>
                <div style={{ flex: 1, paddingRight: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: tokens.textPrimary, margin: 0 }}>{row.label}</p>
                  <p style={{ fontSize: 11, color: tokens.textSecondary, margin: '2px 0 0' }}>{row.desc}</p>
                </div>
                <Toggle checked={settings[row.key]} onChange={() => toggle(row.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Divider />
      {/* Sección "Quiet hours" (No molestar) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={14} color={tokens.textSecondary} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: tokens.textPrimary, margin: 0 }}>Quiet hours</p>
            <p style={{ fontSize: 11, color: tokens.textSecondary, margin: '2px 0 0' }}>
              No notifications between{' '}
              <span style={{ fontWeight: 600, color: '#818cf8' }}>{settings.quietFrom}</span>{' '}and{' '}
              <span style={{ fontWeight: 600, color: '#818cf8' }}>{settings.quietTo}</span>
            </p>
          </div>
        </div>
        <Toggle checked={settings.quietEnabled} onChange={() => toggle('quietEnabled')} />
      </div>
      {/* Si las 'Quiet hours' están activadas, muestra los inputs de horario */}
      {settings.quietEnabled && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <FieldInput label="From" value={settings.quietFrom} onChange={v => setSettings({ ...settings, quietFrom: v })} type="time" />
          <FieldInput label="To"   value={settings.quietTo}   onChange={v => setSettings({ ...settings, quietTo: v })}   type="time" />
        </div>
      )}
    </Card>
  );
}

// 2.4 Sección de Seguridad (Cambio de contraseña, 2FA, Zona de peligro)
function SecuritySection() {
  const tokens = useTokens();
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [twoFA,    setTwoFA]    = useState(false);
  const [sessions, setSessions] = useState(true);
  const [loginAl,  setLoginAl]  = useState(true);

  // Lógica simple para calcular la fuerza de la contraseña
  const strength = password.new.length === 0 ? null
    : password.new.length < 6  ? 'weak'
    : password.new.length < 10 ? 'medium'
    : 'strong';
    
  // Estilos visuales según la fuerza de la contraseña
  const strengthMap = {
    weak:   { label: 'Weak',   color: '#f87171', bars: 1 }, // Rojo
    medium: { label: 'Fair',   color: '#f59e0b', bars: 2 }, // Naranja
    strong: { label: 'Strong', color: '#34d399', bars: 3 }, // Verde
  };

  return (
    <Card>
      <SectionTitle icon={Shield} title="Security" description="Manage your password and account security" />
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: tokens.textMuted, marginBottom: 12 }}>Change Password</p>
      
      {/* Formulario de contraseña */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        <FieldInput label="Current password" value={password.current} onChange={v => setPassword({ ...password, current: v })} type="password" placeholder="••••••••" />
        <FieldInput label="New password"     value={password.new}     onChange={v => setPassword({ ...password, new: v })}     type="password" placeholder="Min. 8 characters" />
        
        {/* Renderiza el indicador de fuerza si se empezó a escribir */}
        {strength && (
          <div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= strengthMap[strength].bars ? strengthMap[strength].color : tokens.border, transition: 'all 0.3s' }} />
              ))}
            </div>
            <p style={{ fontSize: 11, fontWeight: 500, color: strengthMap[strength].color, margin: '4px 0 0' }}>{strengthMap[strength].label} password</p>
          </div>
        )}
        <FieldInput label="Confirm password" value={password.confirm} onChange={v => setPassword({ ...password, confirm: v })} type="password" placeholder="Repeat password" />
      </div>
      
      {/* Alerta de error si las contraseñas no coinciden (aparece solo si la confirmó y es distinta) */}
      {password.confirm && password.new !== password.confirm && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.08)', padding: '8px 12px', marginBottom: 12 }}>
          <AlertTriangle size={12} color="#f87171" />
          <p style={{ fontSize: 11, fontWeight: 500, color: '#f87171', margin: 0 }}>Passwords do not match</p>
        </div>
      )}
      <button style={{ borderRadius: 10, border: 'none', padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
        Update password
      </button>

      <Divider />

      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: tokens.textMuted, marginBottom: 12 }}>Advanced Security</p>
      <div style={{ borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
        {[
          { label: 'Two-factor authentication', desc: 'Extra layer via TOTP or SMS',        value: twoFA,    set: setTwoFA },
          { label: 'Active session alerts',     desc: 'Email me when a new device signs in', value: loginAl, set: setLoginAl },
          { label: 'Auto-lock sessions',        desc: 'Sign out after 30 days of inactivity', value: sessions, set: setSessions },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${tokens.border}` : 'none' }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: tokens.textPrimary, margin: 0 }}>{row.label}</p>
              <p style={{ fontSize: 11, color: tokens.textSecondary, margin: '2px 0 0' }}>{row.desc}</p>
            </div>
            <Toggle checked={row.value} onChange={row.set} />
          </div>
        ))}
      </div>

      <Divider />

      {/* Zona de peligro (Borrar cuenta) */}
      <div style={{ borderRadius: 12, padding: 16, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#f87171', marginBottom: 4 }}>Danger Zone</p>
        <p style={{ fontSize: 12, color: tokens.textSecondary, marginBottom: 12 }}>Permanently delete your account. This cannot be undone.</p>
        <button style={{ borderRadius: 8, border: '1px solid rgba(248,113,113,0.3)', padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#f87171', background: 'none', cursor: 'pointer' }}>
          Delete account
        </button>
      </div>
    </Card>
  );
}

// 2.5 Sección de Región (Idioma, Hora, Formatos)
function RegionSection() {
  const [lang, setLang] = useState('en');
  const [tz,   setTz]   = useState('Europe/Madrid');
  const [df,   setDf]   = useState('DD/MM/YYYY');
  const [tf,   setTf]   = useState('24h');
  const [curr, setCurr] = useState('EUR');
  const [fd,   setFd]   = useState('monday');

  return (
    <Card>
      <SectionTitle icon={Globe} title="Language & Region" description="Localization settings for your workspace" />
      {/* Todo agrupado en Grid de 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FieldSelect label="Language" value={lang} onChange={setLang} options={[
          { value: 'en', label: '🇬🇧 English' }, { value: 'es', label: '🇪🇸 Spanish' },
          { value: 'fr', label: '🇫🇷 French' },  { value: 'de', label: '🇩🇪 German' },
        ]} />
        <FieldSelect label="Timezone" value={tz} onChange={setTz} options={[
          { value: 'Europe/Madrid', label: 'Europe/Madrid (CET)' },
          { value: 'Europe/London', label: 'Europe/London (GMT)' },
          { value: 'America/NY',    label: 'America/New York (EST)' },
        ]} />
        <FieldSelect label="Date Format" value={df} onChange={setDf} options={[
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        ]} />
        <FieldSelect label="Time Format" value={tf} onChange={setTf} options={[
          { value: '24h', label: '24-hour (14:30)' },
          { value: '12h', label: '12-hour (2:30 PM)' },
        ]} />
        <FieldSelect label="Currency" value={curr} onChange={setCurr} options={[
          { value: 'EUR', label: '€ Euro' }, { value: 'USD', label: '$ US Dollar' }, { value: 'GBP', label: '£ British Pound' },
        ]} />
        <FieldSelect label="First day of week" value={fd} onChange={setFd} options={[
          { value: 'monday',   label: 'Monday' },
          { value: 'sunday',   label: 'Sunday' },
          { value: 'saturday', label: 'Saturday' },
        ]} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, border: 'none', padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
          <Save size={13} /> Save preferences
        </button>
      </div>
    </Card>
  );
}

// ============================================================================
// 3. COMPONENTE PRINCIPAL (Contenedor que une todo el layout de Settings)
// ============================================================================

// Menú secundario interno de Configuración (Apariencia, Perfil, etc.)
const SETTINGS_NAV = [
  { id: 'appearance',    label: 'Appearance',   Icon: Palette },
  { id: 'profile',       label: 'Profile',       Icon: User },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'security',      label: 'Security',      Icon: Shield },
  { id: 'region',        label: 'Language',      Icon: Globe },
];

export default function SettingsPage({ role = 'employee', onLogout, onNav }) {
  const tokens = useTokens();
  const { isDark } = useTheme();
  // Estado que controla qué pestaña de ajustes está abierta a la derecha
  const [activeSection, setActiveSection] = useState('appearance');
  
  // Variable para simplificar la lógica
  const isAdmin = role === 'admin';

  // LÓGICA DE NAVEGACIÓN (Sidebar Principal 1)
  // Como Settings es una página global, el menú principal debe adaptarse al rol
  // para que si el Admin vuelve atrás, no le cargue las opciones de empleado.
  const mainNavItems = isAdmin
    ? [
        { id: 'home',      label: 'Dashboard', Icon: Home },
        { id: 'employees', label: 'Employees', Icon: Users },
        { id: 'reports',   label: 'Reports',   Icon: BarChart2 },
        { id: 'settings',  label: 'Settings',  Icon: SettingsIcon },
      ]
    : [
        { id: 'home',      label: 'Home',      Icon: Home },
        { id: 'schedule',  label: 'Schedule',  Icon: Calendar },
        { id: 'reports',   label: 'Reports',   Icon: BarChart2 },
        { id: 'settings',  label: 'Settings',  Icon: SettingsIcon },
      ];

  // Datos dinámicos del perfil en la esquina inferior izquierda
  const profileName = isAdmin ? 'Rosa Muñoz' : 'Antonio Pérez';
  const profileRole = isAdmin ? 'Administrator' : 'Web Designer';
  const profileInitials = isAdmin ? 'RM' : 'AP';
  const gradientClass = isAdmin ? 'from-[#f093fb] to-[#f5576c]' : 'from-[#6366f1] to-[#8b5cf6]';
  const menuTitle = isAdmin ? 'Main' : 'Menu';

  // Objeto o "Diccionario" que guarda todos los componentes renderizables de la configuración.
  // Permite cargar uno u otro basándose en 'activeSection' sin usar múltiples "if".
  const content = {
    appearance:    <AppearanceSection />,
    profile:       <ProfileSection role={role} />, // Pasamos el rol para saber qué datos mostrar
    notifications: <NotificationsSection />,
    security:      <SecuritySection />,
    region:        <RegionSection />,
  };

  return (
    // Layout general
    <div
      className="flex h-screen overflow-hidden font-[DM_Sans,system-ui,sans-serif]"
      style={{ background: tokens.bg, color: tokens.textPrimary }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#2a2f3a' : '#d1d5db'}; border-radius: 2px; }
        select option { background: ${isDark ? '#111318' : '#ffffff'}; color: ${isDark ? '#e2e8f0' : '#111827'}; }
      `}</style>

      {/* ==================================================================
          COLUMNA 1: NAVEGACIÓN PRINCIPAL (Sidebar Global)
          Igual a la del resto de la app.
          ================================================================== */}
      <aside
        className="flex w-[220px] shrink-0 flex-col gap-1.5 px-4 py-6"
        style={{ background: tokens.bgSidebar, borderRight: `1px solid ${tokens.borderSide}` }}
      >
        <div className="mb-7 flex items-center gap-2.5 px-2">
          <img 
            src="./Checki_purple.png" 
            alt="Logo CheckIn"
            className="h-10 w-full rounded-[8px] object-contain" 
          />
        </div>

        <p className="mb-1 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: tokens.textMuted }}>
          {menuTitle}
        </p>

        {mainNavItems.map(({ id, label, Icon }) => {
          const isActive = id === 'settings'; // Fuerza "Settings" como activo
          return (
            <button
              key={id}
              // Si no es Settings, avisa a App.jsx para que cargue la otra página.
              onClick={() => id !== 'settings' ? onNav?.(id) : null}
              className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-all"
              style={{
                background: isActive ? tokens.accentLight : 'transparent',
                color: isActive ? tokens.accentText : tokens.textSecondary,
                border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = tokens.bgHover; e.currentTarget.style.color = tokens.textPrimary; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = tokens.textSecondary; } }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}

        <div className="flex-1" />

        {/* PERFIL (Se adapta según Rol) */}
        <div className="rounded-[12px] border p-3.5" style={{ background: tokens.bgCard, borderColor: tokens.border }}>
          <div className="mb-3 flex items-center gap-2.5">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientClass} text-[12px] font-bold text-white`}>
              {profileInitials}
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: tokens.textPrimary }}>{profileName}</p>
              <p className="text-[11px]" style={{ color: tokens.textSecondary }}>{profileRole}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[8px] border py-1.5 text-[12px] font-medium transition-all"
            style={{ borderColor: tokens.border, color: tokens.textSecondary, background: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.color = tokens.textSecondary; }}
          >
            <LogOut size={12} /> Log out
          </button>
        </div>
      </aside>

      {/* ==================================================================
          COLUMNA 2: NAVEGACIÓN SECUNDARIA (Sub-menú de Settings)
          ================================================================== */}
      <div
        className="flex w-[196px] shrink-0 flex-col px-3 py-6"
        style={{ background: tokens.bg, borderRight: `1px solid ${tokens.borderSide}` }}
      >
        <div className="mb-6 px-2">
          <p className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>Settings</p>
          <p className="mt-0.5 text-[12px]" style={{ color: tokens.textSecondary }}>Manage your account</p>
        </div>

        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: tokens.textMuted }}>
          Preferences
        </p>

        {/* Pinta la lista [Appearance, Profile, Notif...] */}
        {SETTINGS_NAV.map(({ id, label, Icon }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)} // Cambia la variable de estado interna, y por tanto, el componente de la derecha
              className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all"
              style={{
                background: active ? tokens.accentLight : 'transparent',
                color: active ? tokens.accentText : tokens.textSecondary,
                border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = tokens.bgHover; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={14} />
              <span className="flex-1 text-left">{label}</span>
              {/* Añade un chevrón a la derecha si está seleccionada indicando que el contenido está ahí */}
              {active && <ChevronRight size={12} />}
            </button>
          );
        })}
      </div>

      {/* ==================================================================
          COLUMNA 3: CONTENIDO PRINCIPAL DE CONFIGURACIÓN
          Aquí se inyecta el componente (Appearance, Profile...) que elijamos
          ================================================================== */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-[800px]">
          {/* Se carga dinámicamente llamando al objeto con la clave activa */}
          {content[activeSection]}
        </div>
      </main>
    </div>
  );
}