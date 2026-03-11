import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, User, Clock, Users, BarChart3, CalendarCheck, Zap, CheckCircle2 } from 'lucide-react';
import useCountUp from '../hooks/useCountUp';
import { useAuth } from '../contexts/AuthContext';

// ── Floating Particles ──
function FloatingParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, particles = [];
    const resize = () => { canvas.width = canvas.offsetWidth * devicePixelRatio; canvas.height = canvas.offsetHeight * devicePixelRatio; ctx.scale(devicePixelRatio, devicePixelRatio); };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 40; i++) particles.push({ x: Math.random() * canvas.offsetWidth, y: Math.random() * canvas.offsetHeight, r: Math.random() * 1.5 + 0.5, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, opacity: Math.random() * 0.25 + 0.05 });
    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      particles.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(99,102,241,${p.opacity})`; ctx.fill(); });
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) { const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, dist = Math.sqrt(dx * dx + dy * dy); if (dist < 100) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(99,102,241,${0.035 * (1 - dist / 100)})`; ctx.lineWidth = 0.5; ctx.stroke(); } }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0.9 }} />;
}

// ── Role Indicator ──
function RoleIndicator({ email }) {
  if (!email.length) return null;
  const isAdmin = email.toLowerCase().includes('admin');
  return (
    <div className="flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 transition-all duration-300 anim-fadeIn"
      style={{ borderColor: isAdmin ? 'rgba(248,113,113,0.25)' : 'rgba(52,211,153,0.25)', background: isAdmin ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)' }}>
      {isAdmin ? <Shield size={11} style={{ color: '#f87171' }} /> : <User size={11} style={{ color: '#34d399' }} />}
      <span className="text-[10px] font-bold tracking-[0.04em]" style={{ color: isAdmin ? '#f87171' : '#34d399' }}>{isAdmin ? 'ADMIN' : 'EMPLOYEE'}</span>
    </div>
  );
}

// ── Main ──
export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const empCount = useCountUp(200, 1600);
  const deptCount = useCountUp(6, 800);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setShake(false); setLoading(true);
    try { await login(email, password); }
    catch (err) { setError(err.data?.error || 'Invalid credentials.'); setShake(true); setTimeout(() => setShake(false), 600); }
    finally { setLoading(false); }
  };

  const features = [
    { icon: Clock, label: 'Real-time tracking', color: '#818cf8' },
    { icon: BarChart3, label: 'Department analytics', color: '#34d399' },
    { icon: CalendarCheck, label: 'Smart scheduling', color: '#f59e0b' },
    { icon: Zap, label: 'Instant clock-in', color: '#22d3ee' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0c10] font-[DM_Sans,system-ui,sans-serif] text-[#e2e8f0]">

      {/* ═══════ LEFT PANEL ═══════ */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-[#1a1f2b] p-10 lg:flex xl:p-14"
        style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        <FloatingParticles />
        <div className="pointer-events-none absolute left-1/3 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_65%)]" />

        {/* Logo */}
        <div className="relative z-10 animate-[fadeUp_0.4s_ease_both]">
          <img src="./Checki_purple.png" alt="CheckIn Logo" className="h-11 w-auto object-contain" />
        </div>

        {/* Hero */}
        <div className="relative z-10 -mt-4 animate-[fadeUp_0.5s_ease_0.08s_both]">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a5568]">Workforce Management Platform</p>
          <h1 className="mb-4 text-[34px] font-bold leading-[1.12] tracking-[-0.03em] text-[#e2e8f0] xl:text-[40px]">
            Track time.<br /><span className="bg-gradient-to-r from-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent">Stay aligned.</span>
          </h1>
          <p className="max-w-[340px] text-[14px] leading-[1.7] text-[#4a5568]">
            A modern attendance platform for teams who value clarity, accountability, and simplicity.
          </p>

          {/* Feature pills */}
          <div className="mt-8 grid grid-cols-2 gap-2.5">
            {features.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-[10px] border border-[#1a1f2b] bg-[#0d0f14]/60 px-3.5 py-2.5 backdrop-blur-sm transition-all hover:border-[#6366f1]/20 hover:bg-[#6366f1]/5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px]" style={{ background: `${color}12` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <span className="text-[12px] font-medium text-[#7a849b]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial + Stats */}
        <div className="relative z-10 animate-[fadeUp_0.5s_ease_0.16s_both]">
          {/* Stats */}
          <div className="flex gap-8">
            {[
              { value: empCount, suffix: '+', label: 'Employees' },
              { value: deptCount, suffix: '', label: 'Departments' },
              { value: '99.9', suffix: '%', label: 'Uptime', raw: true },
            ].map(({ value, suffix, label, raw }) => (
              <div key={label}>
                <p className="text-[20px] font-bold tracking-[-0.02em] text-[#e2e8f0]">{raw ? value : value}{suffix}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#3a4155]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ RIGHT PANEL — Login Form ═══════ */}
      <div className="flex w-full shrink-0 items-center justify-center bg-[#0a0c10] p-4 sm:p-8 lg:w-[520px] xl:w-[560px]">
        <div className={`w-full max-w-[400px] animate-[fadeUp_0.4s_ease_both] ${shake ? 'anim-shake' : ''}`}>

          {/* Mobile logo */}
          <img src="./Checki_purple.png" alt="CheckIn Logo" className="mx-auto mb-8 block h-10 w-auto object-contain lg:hidden" />

          {/* Card */}
          <div className="rounded-[22px] border border-[#1e2330] bg-[#111318] p-7 shadow-[0_24px_48px_rgba(0,0,0,0.4),0_0_80px_rgba(99,102,241,0.04)] sm:p-9">

            <div className="mb-7">
              <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[#e2e8f0]">Welcome back</h2>
              <p className="mt-1.5 text-[13px] text-[#4a5568]">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2.5 rounded-[10px] border border-[#f87171]/20 bg-[#f87171]/8 px-4 py-3 anim-fadeIn">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f87171]" />
                <p className="text-[12px] font-medium text-[#f87171]">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-email" className="text-[12px] font-medium tracking-[0.02em] text-[#5a6478]">Email address</label>
                  <RoleIndicator email={email} />
                </div>
                <input id="login-email" type="email" placeholder="you@company.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }} required autoComplete="email"
                  className="w-full rounded-[10px] border border-[#1e2330] bg-[#0d0f14] px-4 py-[13px] text-[14px] text-[#e2e8f0] outline-none placeholder:text-[#3a4155] transition-all focus:border-[#6366f1] focus:ring-[3px] focus:ring-[#6366f1]/20" />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-[12px] font-medium tracking-[0.02em] text-[#5a6478]">Password</label>
                  <button type="button" className="text-[12px] text-[#5a6478] transition-colors hover:text-[#818cf8]">Forgot?</button>
                </div>
                <div className="relative">
                  <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }} required autoComplete="current-password"
                    className="w-full rounded-[10px] border border-[#1e2330] bg-[#0d0f14] px-4 py-[13px] pr-11 text-[14px] text-[#e2e8f0] outline-none placeholder:text-[#3a4155] transition-all focus:border-[#6366f1] focus:ring-[3px] focus:ring-[#6366f1]/20" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a4155] transition-colors hover:text-[#818cf8]" aria-label="Toggle password">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" className="h-4 w-4 cursor-pointer rounded border border-[#2a2f3a] bg-[#0d0f14] accent-[#6366f1]" />
                <span className="text-[12px] font-medium text-[#5a6478]">Keep me signed in</span>
              </label>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] py-[14px] text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Signing in...</>) : (<>Sign in <ArrowRight size={15} /></>)}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#1e2330]" />
                <span className="text-[11px] font-medium text-[#2e3545]">OR</span>
                <div className="h-px flex-1 bg-[#1e2330]" />
              </div>

              <button type="button"
                className="w-full rounded-[10px] border border-[#1e2330] bg-transparent py-[13px] text-[13px] font-medium text-[#5a6478] transition-all hover:border-[#6366f1] hover:bg-[#6366f1]/5 hover:text-[#818cf8]">
                Request account access
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-[#2e3545]">
              By signing in you agree to our <span className="cursor-pointer text-[#4a5568] hover:text-[#818cf8]">Terms of Service</span>
            </p>
          </div>

          {/* Trust badges under card */}
          <div className="mt-5 flex items-center justify-center gap-4">
            {['256-bit encryption', 'GDPR compliant', 'SOC 2 certified'].map(badge => (
              <div key={badge} className="flex items-center gap-1.5">
                <CheckCircle2 size={10} style={{ color: '#34d399' }} />
                <span className="text-[10px] font-medium text-[#2e3545]">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ ANIMATIONS ═══════ */}
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
        .anim-fadeIn { animation: fadeIn 0.25s ease both; }
        @keyframes shake { 0%,100% { transform:translateX(0) } 10%,50%,90% { transform:translateX(-4px) } 30%,70% { transform:translateX(4px) } }
        .anim-shake { animation: shake 0.5s ease; }
      `}</style>
    </div>
  );
}