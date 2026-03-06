import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowRight, Shield, User } from 'lucide-react';

// ============================================================================
// HOOK: COUNT-UP para las estadísticas
// ============================================================================
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    // Start after a delay to sync with fadeUp animation
    const t = setTimeout(() => { raf.current = requestAnimationFrame(step); }, 400);
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return value;
}

// ============================================================================
// FLOATING PARTICLES — Efecto sutil en el panel izquierdo
// ============================================================================
function FloatingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const count = 35;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.05,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.04 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.8 }}
    />
  );
}

// ============================================================================
// ROLE INDICATOR — Badge que aparece según el email
// ============================================================================
function RoleIndicator({ email }) {
  const hasText = email.length > 0;
  const isAdmin = email.toLowerCase().includes('admin');

  if (!hasText) return null;

  return (
    <div
      className="flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 transition-all duration-300"
      style={{
        borderColor: isAdmin ? 'rgba(248,113,113,0.25)' : 'rgba(52,211,153,0.25)',
        background: isAdmin ? 'rgba(248,113,113,0.08)' : 'rgba(52,211,153,0.08)',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {isAdmin ? <Shield size={11} style={{ color: '#f87171' }} /> : <User size={11} style={{ color: '#34d399' }} />}
      <span className="text-[10px] font-bold tracking-[0.04em]" style={{ color: isAdmin ? '#f87171' : '#34d399' }}>
        {isAdmin ? 'ADMIN' : 'EMPLOYEE'}
      </span>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [shake, setShake]       = useState(false);

  // Contadores animados
  const empCount  = useCountUp(200, 1600);
  const deptCount = useCountUp(4, 800);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setShake(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (password.length < 4) {
        setError('Invalid credentials. Please check your email and password.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        return;
      }

      onLogin(email.includes('admin') ? 'admin' : 'employee');
    }, 800);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0c10] font-[DM_Sans,system-ui,sans-serif] text-[#e2e8f0]">

      {/* ============================================================================
          PANEL IZQUIERDO — Branding + Partículas
          ============================================================================ */}
      <div
        className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-[#1a1f2b] p-16 lg:flex"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {/* Partículas flotantes */}
        <FloatingParticles />

        {/* Aura morada */}
        <div className="pointer-events-none absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center -mb-8">
          <img src="./Checki_purple.png" alt="CheckIn Logo" className="h-12 w-auto object-contain" />
        </div>

        {/* Textos principales */}
        <div className="relative z-10 animate-[fadeUp_0.5s_ease_0.1s_both]">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4a5568]">
            Workforce Management
          </p>
          <h1 className="mb-5 text-[42px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#e2e8f0]">
            Track time.<br />
            <span className="text-[#818cf8]">Stay aligned.</span>
          </h1>
          <p className="max-w-[360px] text-[15px] leading-relaxed text-[#4a5568]">
            A modern attendance platform for teams who value clarity, accountability, and simplicity.
          </p>

          <ul className="mt-10 space-y-3">
            {[
              'Real-time attendance tracking',
              'Department-level analytics',
              'Smart schedule management',
              'Instant clock-in & clock-out',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-[13px] text-[#4a5568]">
                <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Estadísticas con contador animado */}
        <div className="relative z-10 flex animate-[fadeUp_0.5s_ease_0.2s_both] gap-10">
          {[
            { value: empCount, suffix: '+', label: 'Employees' },
            { value: deptCount, suffix: '',  label: 'Departments' },
            { value: 99.9, suffix: '%', label: 'Uptime', isDecimal: true },
          ].map(({ value, suffix, label, isDecimal }) => (
            <div key={label}>
              <p className="text-[22px] font-semibold tracking-[-0.02em] text-[#e2e8f0]">
                {isDecimal ? '99.9' : value}{suffix}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#3a4155]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================================
          PANEL DERECHO — Formulario de Login
          ============================================================================ */}
      <div className="flex w-full shrink-0 items-center justify-center bg-[#0a0c10] p-8 lg:w-[750px]">
        <div
          className={`w-full max-w-[380px] animate-[fadeUp_0.4s_ease_0.05s_both] rounded-[20px] border border-[#1e2330] bg-[#111318] p-9 shadow-[0_24px_48px_rgba(0,0,0,0.5),0_0_80px_rgba(99,102,241,0.06)] ${shake ? 'anim-shake' : ''}`}
        >

          <div className="mb-8 text-center lg:text-left">
            <img
              src="./Checki_purple.png"
              alt="CheckIn Logo"
              className="mx-auto mb-6 block h-10 w-auto object-contain lg:hidden"
            />
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#e2e8f0]">Welcome back</h2>
            <p className="mt-1.5 text-[13px] text-[#4a5568]">Sign in to your account to continue</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-[10px] border border-[#f87171]/20 bg-[#f87171]/8 px-4 py-3 anim-fadeIn">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f87171]" />
              <p className="text-[12px] font-medium text-[#f87171]">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* EMAIL + Role indicator */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="login-email" className="text-[12px] font-medium tracking-[0.02em] text-[#5a6478]">
                  Employee address
                </label>
                <RoleIndicator email={email} />
              </div>
              <input
                id="login-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                autoComplete="email"
                className="w-full rounded-[10px] border border-[#1e2330] bg-[#0d0f14] px-4 py-[13px] text-[14px] text-[#e2e8f0] outline-none placeholder:text-[#3a4155] transition-all focus:border-[#6366f1] focus:ring-[3px] focus:ring-[#6366f1]/20"
              />
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-[12px] font-medium tracking-[0.02em] text-[#5a6478]">
                  Password
                </label>
                <button type="button" className="text-[12px] text-[#5a6478] transition-colors hover:text-[#818cf8]">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-[10px] border border-[#1e2330] bg-[#0d0f14] px-4 py-[13px] pr-11 text-[14px] text-[#e2e8f0] outline-none placeholder:text-[#3a4155] transition-all focus:border-[#6366f1] focus:ring-[3px] focus:ring-[#6366f1]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a4155] transition-colors hover:text-[#818cf8]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* CHECKBOX */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer rounded border border-[#2a2f3a] bg-[#0d0f14] accent-[#6366f1]"
              />
              <span className="text-[12px] font-medium text-[#5a6478]">Keep me signed in</span>
            </label>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] py-[14px] text-[14px] font-semibold tracking-[0.01em] text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>

            {/* SEPARATOR */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#1e2330]" />
              <span className="text-[11px] font-medium text-[#2e3545]">OR</span>
              <div className="h-px flex-1 bg-[#1e2330]" />
            </div>

            {/* SECONDARY BUTTON */}
            <button
              type="button"
              className="w-full rounded-[10px] border border-[#1e2330] bg-transparent py-[13px] text-[13px] font-medium text-[#5a6478] transition-all hover:border-[#6366f1] hover:bg-[#6366f1]/5 hover:text-[#818cf8]"
            >
              Request account access
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-[#2e3545]">
            By signing in you agree to our{' '}
            <span className="cursor-pointer text-[#4a5568] hover:text-[#818cf8]">Terms of Service</span>
          </p>
        </div>
      </div>

      {/* ============================================================================
          ANIMACIONES
          ============================================================================ */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-fadeIn { animation: fadeIn 0.25s ease both; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-4px); }
          30%, 70% { transform: translateX(4px); }
        }
        .anim-shake { animation: shake 0.5s ease; }
      `}</style>
    </div>
  );
}