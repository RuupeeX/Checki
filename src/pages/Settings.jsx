import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun, Moon, Monitor, Check,
  Bell, Shield, Globe, User, Mail, Smartphone,
  ChevronRight, Palette, Camera, Save,
  RotateCcw, Eye, EyeOff, AlertTriangle, Clock,
  Info, Heart, Github, ExternalLink, X, CheckCircle2,
} from 'lucide-react';
import { useTheme, useTokens } from '../contexts/Themecontext';
import AppLayout from '../components/AppLayout';

// ============================================================================
// TOAST / SNACKBAR
// ============================================================================
function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(22,163,74,0.12)', border: 'rgba(52,211,153,0.3)', text: '#34d399', icon: CheckCircle2 },
    error:   { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', text: '#f87171', icon: AlertTriangle },
  };
  const c = colors[type];
  const Icon = c.icon;

  return (
    <div
      className="fixed bottom-6 right-4 z-[100] flex items-center gap-3 rounded-[12px] border px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-all duration-300 sm:right-6 sm:px-5 sm:py-3.5"
      style={{
        background: c.bg, borderColor: c.border,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
      }}
    >
      <Icon size={16} style={{ color: c.text }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: c.text, margin: 0 }}>{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, marginLeft: 4 }}>
        <X size={14} />
      </button>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);
  const el = toast ? <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  return { show, el };
}

// ============================================================================
// UI KIT
// ============================================================================
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} aria-pressed={checked}
      style={{
        position: 'relative', height: 22, width: 40, borderRadius: 11,
        border: 'none', cursor: 'pointer', flexShrink: 0,
        background: checked ? '#6366f1' : '#2a2f3a', transition: 'background 0.3s',
      }}>
      <span style={{
        position: 'absolute', top: 3, height: 16, width: 16, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        left: checked ? 'calc(100% - 19px)' : 3, transition: 'left 0.3s',
      }} />
    </button>
  );
}

function FieldInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  const tokens = useTokens();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: tokens.textSecondary }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input type={isPassword && show ? 'text' : type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 13, background: tokens.bgInput, border: `1px solid ${tokens.border}`, color: tokens.textPrimary, outline: 'none', boxSizing: 'border-box' }}
          onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
          onBlur={(e) => (e.target.style.borderColor = tokens.border)} />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: tokens.textSecondary }}
            aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  const tokens = useTokens();
  return (
    <div>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: tokens.textSecondary }}>{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 13, background: tokens.bgInput, border: `1px solid ${tokens.border}`, color: tokens.textPrimary, outline: 'none', cursor: 'pointer', appearance: 'none' }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ children }) {
  const tokens = useTokens();
  return <div style={{ borderRadius: 16, border: `1px solid ${tokens.border}`, padding: '16px', background: tokens.bgCard }} className="sm:p-6">{children}</div>;
}

function SectionTitle({ icon: Icon, title, description }) {
  const tokens = useTokens();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><Icon size={16} color="#fff" /></div>
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: tokens.textPrimary, margin: 0 }}>{title}</p>
        {description && <p style={{ fontSize: 12, color: tokens.textSecondary, margin: '3px 0 0' }}>{description}</p>}
      </div>
    </div>
  );
}

function Divider() {
  const tokens = useTokens();
  return <div style={{ height: 1, background: tokens.border, margin: '20px 0' }} />;
}

// ============================================================================
// THEME PREVIEW
// ============================================================================
function ThemePreview({ previewTheme }) {
  const isDark = previewTheme === 'dark' || (previewTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const bg = isDark ? '#0a0c10' : '#f4f5f7'; const sidebar = isDark ? '#0d0f14' : '#ffffff';
  const card = isDark ? '#111318' : '#ffffff'; const border = isDark ? '#1e2330' : '#e2e6ed';
  const textP = isDark ? '#e2e8f0' : '#111827'; const textS = isDark ? '#5a6478' : '#9ca3af';
  const accent = '#6366f1';

  return (
    <div style={{ width: '100%', height: 140, borderRadius: 12, overflow: 'hidden', border: `1px solid ${border}`, background: bg, display: 'flex', transition: 'all 0.4s ease' }}>
      <div style={{ width: 44, background: sidebar, borderRight: `1px solid ${border}`, padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ width: 32, height: 6, borderRadius: 3, background: accent, opacity: 0.4 }} />
        <div style={{ marginTop: 8 }} />
        {[1,2,3,4].map(i => (<div key={i} style={{ width: '100%', height: 5, borderRadius: 2.5, background: i === 1 ? `${accent}30` : (isDark ? '#1e2330' : '#e8ebf0') }} />))}
      </div>
      <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ width: 80, height: 6, borderRadius: 3, background: textP, opacity: 0.7 }} /><div style={{ width: 50, height: 4, borderRadius: 2, background: textS, opacity: 0.5, marginTop: 4 }} /></div>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: `${accent}20`, border: `1px solid ${accent}40` }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {['#34d399','#f59e0b','#818cf8'].map((c,i) => (
            <div key={i} style={{ flex: 1, borderRadius: 8, background: card, border: `1px solid ${border}`, padding: 8, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ width: '60%', height: 3, borderRadius: 1.5, background: textS, opacity: 0.4 }} />
              <div style={{ width: '40%', height: 8, borderRadius: 2, background: c, opacity: 0.8 }} />
              <div style={{ width: '80%', height: 3, borderRadius: 1.5, background: textS, opacity: 0.25 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SECCIONES (unchanged logic, minor responsive tweaks)
// ============================================================================
function AppearanceSection({ showToast }) {
  const { theme, setTheme } = useTheme();
  const tokens = useTokens();
  const themes = [{ id: 'light', label: 'Light', Icon: Sun },{ id: 'dark', label: 'Dark', Icon: Moon },{ id: 'system', label: 'System', Icon: Monitor }];
  return (
    <Card>
      <SectionTitle icon={Palette} title="Appearance" description="Customize how CheckIn looks and feels" />
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: tokens.textMuted, marginBottom: 10 }}>Preview</p>
      <ThemePreview previewTheme={theme} />
      <div style={{ height: 20 }} />
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: tokens.textMuted, marginBottom: 12 }}>Color Theme</p>
      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: 24 }}>
        {themes.map(({ id, label, Icon: I }) => {
          const active = theme === id;
          return (
            <button key={id} onClick={() => { setTheme(id); showToast(`Theme changed to ${label}`); }} style={{
              position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              borderRadius: 14, border: `2px solid ${active ? tokens.accent : tokens.border}`,
              padding: 16, cursor: 'pointer', transition: 'all 0.2s',
              background: active ? tokens.accentLight : tokens.bgInput,
            }}>
              <div style={{ width: '100%', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <I size={24} color={active ? tokens.accentText : tokens.textSecondary} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: active ? tokens.accentText : tokens.textSecondary }}>{label}</span>
              {active && (<div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: tokens.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={10} color="#fff" /></div>)}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function ProfileSection({ role, showToast }) {
  const tokens = useTokens();
  const isAdmin = role === 'admin';
  const [name, setName] = useState(isAdmin ? 'Rosa Muñoz' : 'Antonio Pérez');
  const [email, setEmail] = useState(isAdmin ? 'rosa@co.com' : 'antonio@co.com');
  const [jobTitle, setJobTitle] = useState(isAdmin ? 'Administrator' : 'Web Designer');
  const [dept, setDept] = useState(isAdmin ? 'Management' : 'IT');
  const [phone, setPhone] = useState('+34 612 345 678');
  const ini = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const gradientBG = isAdmin ? 'linear-gradient(135deg,#f093fb,#f5576c)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)';

  return (
    <Card>
      <SectionTitle icon={User} title="Profile" description="Your personal information and account details" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: gradientBG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>{ini}</div>
          <button style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: '50%', background: '#6366f1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Change avatar">
            <Camera size={11} color="#fff" />
          </button>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: tokens.textPrimary, margin: 0 }}>{name}</p>
          <p style={{ fontSize: 12, color: tokens.textSecondary, margin: '2px 0 4px' }}>{jobTitle} · {dept}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldInput label="Full Name" value={name} onChange={setName} placeholder="Your name" />
        <FieldInput label="Email" value={email} onChange={setEmail} type="email" />
        <FieldInput label="Job Title" value={jobTitle} onChange={setJobTitle} />
        <FieldSelect label="Department" value={dept} onChange={setDept} options={['IT','Sales','HR','Marketing','Management'].map(v => ({ value: v, label: v }))} />
        <FieldInput label="Phone" value={phone} onChange={setPhone} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, border: `1px solid ${tokens.border}`, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: tokens.textSecondary, background: 'none', cursor: 'pointer' }}><RotateCcw size={12} /> Reset</button>
        <button onClick={() => showToast('Profile saved successfully')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, border: 'none', padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}><Save size={13} /> Save changes</button>
      </div>
    </Card>
  );
}

function SecuritySection({ showToast }) {
  const tokens = useTokens();
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState(true);
  const [loginAl, setLoginAl] = useState(true);
  const strength = password.new.length === 0 ? null : password.new.length < 6 ? 'weak' : password.new.length < 10 ? 'medium' : 'strong';
  const strengthMap = { weak: { label: 'Weak', color: '#f87171', bars: 1 }, medium: { label: 'Fair', color: '#f59e0b', bars: 2 }, strong: { label: 'Strong', color: '#34d399', bars: 3 } };
  const handleUpdatePassword = () => {
    if (!password.current || !password.new) { showToast('Please fill all password fields', 'error'); return; }
    if (password.new !== password.confirm) { showToast('Passwords do not match', 'error'); return; }
    showToast('Password updated successfully'); setPassword({ current: '', new: '', confirm: '' });
  };

  return (
    <Card>
      <SectionTitle icon={Shield} title="Security" description="Manage your password and account security" />
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: tokens.textMuted, marginBottom: 12 }}>Change Password</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        <FieldInput label="Current password" value={password.current} onChange={v => setPassword({ ...password, current: v })} type="password" placeholder="••••••••" />
        <FieldInput label="New password" value={password.new} onChange={v => setPassword({ ...password, new: v })} type="password" placeholder="Min. 8 characters" />
        {strength && (
          <div><div style={{ display: 'flex', gap: 4 }}>{[1,2,3].map(i => (<div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= strengthMap[strength].bars ? strengthMap[strength].color : tokens.border, transition: 'all 0.3s' }} />))}</div>
          <p style={{ fontSize: 11, fontWeight: 500, color: strengthMap[strength].color, margin: '4px 0 0' }}>{strengthMap[strength].label} password</p></div>
        )}
        <FieldInput label="Confirm password" value={password.confirm} onChange={v => setPassword({ ...password, confirm: v })} type="password" placeholder="Repeat password" />
      </div>
      {password.confirm && password.new !== password.confirm && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.08)', padding: '8px 12px', marginBottom: 12 }}>
          <AlertTriangle size={12} color="#f87171" /><p style={{ fontSize: 11, fontWeight: 500, color: '#f87171', margin: 0 }}>Passwords do not match</p>
        </div>
      )}
      <button onClick={handleUpdatePassword} style={{ borderRadius: 10, border: 'none', padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>Update password</button>
      <Divider />
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: tokens.textMuted, marginBottom: 12 }}>Advanced Security</p>
      <div style={{ borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
        {[
          { label: 'Two-factor authentication', desc: 'Extra layer via TOTP or SMS', value: twoFA, set: setTwoFA },
          { label: 'Active session alerts', desc: 'Email me when a new device signs in', value: loginAl, set: setLoginAl },
          { label: 'Auto-lock sessions', desc: 'Sign out after 30 days of inactivity', value: sessions, set: setSessions },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${tokens.border}` : 'none' }}>
            <div style={{ flex: 1, paddingRight: 16 }}><p style={{ fontSize: 13, fontWeight: 500, color: tokens.textPrimary, margin: 0 }}>{row.label}</p><p style={{ fontSize: 11, color: tokens.textSecondary, margin: '2px 0 0' }}>{row.desc}</p></div>
            <Toggle checked={row.value} onChange={row.set} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function NotificationsSection({ showToast }) {
  const tokens = useTokens();
  const [settings, setSettings] = useState({ emailCheckIn: true, emailLate: true, emailReports: false, pushCheckIn: true, pushLate: false, slackDaily: true, slackAlerts: true, quietEnabled: true, quietFrom: '22:00', quietTo: '08:00' });
  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));
  const channels = [
    { Icon: Mail, label: 'Email', rows: [{ label: 'Check-in & check-out alerts', desc: 'Email when employees log in or out', key: 'emailCheckIn' },{ label: 'Late arrival alerts', desc: 'Notified when someone arrives late', key: 'emailLate' },{ label: 'Weekly reports', desc: 'Summary report every Monday', key: 'emailReports' }]},
    { Icon: Smartphone, label: 'Push', rows: [{ label: 'Check-in reminders', desc: 'Remind me to clock in at my usual time', key: 'pushCheckIn' },{ label: 'Absence alerts', desc: 'Alert when a team member is absent', key: 'pushLate' }]},
    { Icon: Bell, label: 'Slack', rows: [{ label: 'Daily digest', desc: 'Post daily attendance summary to Slack', key: 'slackDaily' },{ label: 'Live alerts', desc: 'Post late arrival alerts in real time', key: 'slackAlerts' }]},
  ];
  return (
    <Card>
      <SectionTitle icon={Bell} title="Notifications" description="Control when and how you receive alerts" />
      {channels.map(({ Icon: I, label, rows }) => (
        <div key={label} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><I size={12} color={tokens.textMuted} /><p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: tokens.textMuted, margin: 0 }}>{label}</p></div>
          <div style={{ borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden' }}>
            {rows.map((row, i) => (
              <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < rows.length - 1 ? `1px solid ${tokens.border}` : 'none' }}>
                <div style={{ flex: 1, paddingRight: 16 }}><p style={{ fontSize: 13, fontWeight: 500, color: tokens.textPrimary, margin: 0 }}>{row.label}</p><p style={{ fontSize: 11, color: tokens.textSecondary, margin: '2px 0 0' }}>{row.desc}</p></div>
                <Toggle checked={settings[row.key]} onChange={() => toggle(row.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={() => showToast('Notification preferences saved')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, border: 'none', padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}><Save size={13} /> Save preferences</button>
      </div>
    </Card>
  );
}

function RegionSection({ showToast }) {
  const [lang, setLang] = useState('en'); const [tz, setTz] = useState('Europe/Madrid');
  const [df, setDf] = useState('DD/MM/YYYY'); const [tf, setTf] = useState('24h');
  const [curr, setCurr] = useState('EUR'); const [fd, setFd] = useState('monday');
  return (
    <Card>
      <SectionTitle icon={Globe} title="Language & Region" description="Localization settings for your workspace" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldSelect label="Language" value={lang} onChange={setLang} options={[{ value: 'en', label: 'English' },{ value: 'es', label: 'Spanish' },{ value: 'fr', label: 'French' },{ value: 'de', label: 'German' }]} />
        <FieldSelect label="Timezone" value={tz} onChange={setTz} options={[{ value: 'Europe/Madrid', label: 'Europe/Madrid (CET)' },{ value: 'Europe/London', label: 'Europe/London (GMT)' },{ value: 'America/NY', label: 'America/New York (EST)' }]} />
        <FieldSelect label="Date Format" value={df} onChange={setDf} options={[{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },{ value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }]} />
        <FieldSelect label="Time Format" value={tf} onChange={setTf} options={[{ value: '24h', label: '24-hour (14:30)' },{ value: '12h', label: '12-hour (2:30 PM)' }]} />
        <FieldSelect label="Currency" value={curr} onChange={setCurr} options={[{ value: 'EUR', label: '€ Euro' },{ value: 'USD', label: '$ US Dollar' },{ value: 'GBP', label: '£ British Pound' }]} />
        <FieldSelect label="First day of week" value={fd} onChange={setFd} options={[{ value: 'monday', label: 'Monday' },{ value: 'sunday', label: 'Sunday' }]} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={() => showToast('Region preferences saved')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, border: 'none', padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}><Save size={13} /> Save preferences</button>
      </div>
    </Card>
  );
}

function AboutSection() {
  const tokens = useTokens();
  return (
    <Card>
      <SectionTitle icon={Info} title="About CheckIn" description="Application info and credits" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <img src="./Checki_purple.png" alt="CheckIn" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: tokens.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>CheckIn</p>
          <p style={{ fontSize: 12, color: tokens.textSecondary, margin: '2px 0 0' }}>Workforce Management Platform</p>
        </div>
      </div>
      <div style={{ borderRadius: 12, border: `1px solid ${tokens.border}`, overflow: 'hidden', marginBottom: 20 }}>
        {[{ label: 'Version', value: '1.0.0' },{ label: 'Build', value: '2026.03.09' },{ label: 'Framework', value: 'React 18 + Vite' },{ label: 'UI Library', value: 'Tailwind CSS + Lucide Icons' },{ label: 'License', value: 'Academic Project' }].map((row, i, arr) => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${tokens.border}` : 'none' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: tokens.textSecondary }}>{row.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: tokens.textPrimary }}>{row.value}</span>
          </div>
        ))}
      </div>
      <div style={{ borderRadius: 12, padding: 16, background: tokens.bgInput, marginBottom: 20 }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: tokens.textSecondary, margin: 0 }}>
          CheckIn is a modern attendance and workforce management platform designed for teams who value clarity, accountability, and simplicity. Built as a vocational training project demonstrating full-stack development skills across React, component architecture, and UI/UX design.
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0' }}>
        <span style={{ fontSize: 12, color: tokens.textMuted }}>Made with</span>
        <Heart size={14} style={{ color: '#f43f5e' }} fill="#f43f5e" />
        <span style={{ fontSize: 12, color: tokens.textMuted }}>for DAM @ LinkiaFP</span>
      </div>
    </Card>
  );
}

// ============================================================================
// NAV SECUNDARIO
// ============================================================================
const SETTINGS_NAV = [
  { id: 'appearance',    label: 'Appearance',   Icon: Palette },
  { id: 'profile',       label: 'Profile',      Icon: User },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'security',      label: 'Security',     Icon: Shield },
  { id: 'region',        label: 'Language',      Icon: Globe },
  { id: 'about',         label: 'About',         Icon: Info },
];

// ============================================================================
// COMPONENTE PRINCIPAL — Responsive: tabs horizontales en mobile
// ============================================================================
export default function SettingsPage({ role = 'employee', onLogout, onNav }) {
  const tokens = useTokens();
  const [activeSection, setActiveSection] = useState('appearance');
  const [transitionKey, setTransitionKey] = useState(0);
  const { show: showToast, el: toastEl } = useToast();

  const handleSectionChange = (id) => {
    setActiveSection(id);
    setTransitionKey(k => k + 1);
  };

  const content = {
    appearance:    <AppearanceSection showToast={showToast} />,
    profile:       <ProfileSection role={role} showToast={showToast} />,
    notifications: <NotificationsSection showToast={showToast} />,
    security:      <SecuritySection showToast={showToast} />,
    region:        <RegionSection showToast={showToast} />,
    about:         <AboutSection />,
  };

  return (
    <AppLayout role={role} activePage="settings" onNav={onNav} onLogout={onLogout}>
      <style>{`
        @keyframes sectionFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .section-enter { animation: sectionFadeIn 0.25s ease both; }
      `}</style>

      <div className="flex h-full flex-col sm:flex-row">
        {/* Mobile: horizontal scrollable tabs */}
        <div className="flex overflow-x-auto border-b px-4 py-3 sm:hidden" style={{ borderColor: tokens.borderSide }}>
          {SETTINGS_NAV.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <button key={id} onClick={() => handleSectionChange(id)}
                className="flex shrink-0 items-center gap-1.5 rounded-[8px] px-3 py-2 text-[12px] font-medium transition-all"
                style={{ background: active ? tokens.accentLight : 'transparent', color: active ? tokens.accentText : tokens.textSecondary }}>
                <Icon size={13} /> {label}
              </button>
            );
          })}
        </div>

        {/* Desktop/Tablet: vertical sub-nav */}
        <div className="hidden w-[196px] shrink-0 flex-col px-3 py-6 sm:flex" style={{ borderRight: `1px solid ${tokens.borderSide}` }}>
          <div className="mb-6 px-2">
            <p className="text-[17px] font-semibold tracking-[-0.02em]" style={{ color: tokens.textPrimary }}>Settings</p>
            <p className="mt-0.5 text-[12px]" style={{ color: tokens.textSecondary }}>Manage your account</p>
          </div>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: tokens.textMuted }}>Preferences</p>
          {SETTINGS_NAV.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <button key={id} onClick={() => handleSectionChange(id)}
                className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all"
                style={{ background: active ? tokens.accentLight : 'transparent', color: active ? tokens.accentText : tokens.textSecondary, border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = tokens.bgHover; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                aria-current={active ? 'page' : undefined}>
                <Icon size={14} />
                <span className="flex-1 text-left">{label}</span>
                {active && <ChevronRight size={12} />}
              </button>
            );
          })}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-[800px] section-enter" key={transitionKey}>
            {content[activeSection]}
          </div>
        </div>
      </div>

      {toastEl}
    </AppLayout>
  );
}