import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react'; 

export default function LoginPage({ onLogin }) {
  // ============================================================================
  // ESTADOS DEL COMPONENTE
  // ============================================================================
  
  // Controla si la contraseña se ve como texto normal o con asteriscos
  const [showPassword, setShowPassword] = useState(false);
  // Almacena lo que el usuario escribe en el campo de email
  const [email, setEmail] = useState('');
  // Almacena lo que el usuario escribe en el campo de contraseña
  const [password, setPassword] = useState('');
  // Controla el estado de carga (ruedita girando) cuando se hace clic en "Sign in"
  const [loading, setLoading] = useState(false);

  // ============================================================================
  // FUNCIÓN DE INICIO DE SESIÓN (SIMULADA)
  // ============================================================================
  const handleLogin = (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setLoading(true);   // Activa el estado de carga en el botón
    
    // Simulamos una petición a una API que tarda 800ms
    setTimeout(() => {
      setLoading(false); // Desactiva la carga
      
      // Lógica simple para la demo: 
      // Si el email escrito contiene la palabra "admin" (ej. admin@co.com), entra como administrador.
      // Si no, entra como empleado normal. Llama a la función onLogin que viene desde App.jsx
      onLogin(email.includes('admin') ? 'admin' : 'employee');
    }, 800);
  };

  return (
    // Contenedor principal: Ocupa el 100% del alto (h-screen) y ancho (w-full).
    // bg-[#0a0c10] establece el fondo oscuro principal.
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0c10] font-[DM_Sans,system-ui,sans-serif] text-[#e2e8f0]">

      {/* ============================================================================
          PANEL IZQUIERDO — Branding (Solo visible en pantallas grandes)
          ============================================================================ */}
      <div 
        // "hidden lg:flex" oculta este panel en móviles y lo muestra en pantallas grandes
        // flex-1 hace que ocupe todo el espacio sobrante a la izquierda.
        className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-[#1a1f2b] p-16 lg:flex"
        // Este style en línea crea el patrón de cuadrícula de puntos sutil en el fondo
        style={{ 
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}
      >
        {/* Aura morada de fondo (resplandor circular) decorativa */}
        <div className="pointer-events-none absolute left-1/4 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)]" />

        {/* LOGO DE LA EMPRESA (Panel Izquierdo) */}
        <div className="flex items-center -mb-8">
          <img 
            src="./Checki_purple.png" 
            alt="Logo CheckIn"
            className="h-12 w-auto object-contain" 
          />
        </div>

        {/* Textos Principales y Lista de características */}
        {/* "animate-[fadeUp...]" aplica una animación CSS definida al final del archivo */}
        <div className="animate-[fadeUp_0.5s_ease_0.1s_both]">
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

          {/* Lista de características con puntos morados */}
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

        {/* Fila inferior de estadísticas (200+ Employees, etc.) */}
        <div className="flex animate-[fadeUp_0.5s_ease_0.2s_both] gap-10">
          {[['200+', 'Employees'], ['4', 'Departments'], ['99.9%', 'Uptime']].map(([val, label]) => (
            <div key={label}>
              <p className="text-[22px] font-semibold tracking-[-0.02em] text-[#e2e8f0]">{val}</p>
              <p className="mt-1 text-[11px] font-medium text-[#3a4155]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================================
          PANEL DERECHO — Formulario de Login
          ============================================================================ */}
      <div className="flex w-full shrink-0 items-center justify-center bg-[#0a0c10] p-8 lg:w-[750px]">
        {/* Tarjeta central del formulario con sombra, bordes y animación */}
        <div className="w-full max-w-[380px] animate-[fadeUp_0.4s_ease_0.05s_both] rounded-[20px] border border-[#1e2330] bg-[#111318] p-9 shadow-[0_24px_48px_rgba(0,0,0,0.5),0_0_80px_rgba(99,102,241,0.06)]">

          <div className="mb-8 text-center lg:text-left">
            {/* LOGO EN VERSIÓN MÓVIL: 
                Solo se muestra (block) en móviles y se oculta (lg:hidden) en escritorio 
                porque en escritorio ya se ve gigante a la izquierda */}
            <img 
              src="./Checki_purple.png" 
              alt="Logo CheckIn"
              className="mx-auto mb-6 block h-10 w-auto object-contain lg:hidden" 
            />
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#e2e8f0]">Welcome back</h2>
            <p className="mt-1.5 text-[13px] text-[#4a5568]">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* INPUT EMAIL */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium tracking-[0.02em] text-[#5a6478]">Employee address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Actualiza el estado al escribir
                required
                // focus:ring-* crea el aura morada al hacer click en el input
                className="w-full rounded-[10px] border border-[#1e2330] bg-[#0d0f14] px-4 py-[13px] text-[14px] text-[#e2e8f0] outline-none placeholder:text-[#3a4155] transition-all focus:border-[#6366f1] focus:ring-[3px] focus:ring-[#6366f1]/20"
              />
            </div>

            {/* INPUT PASSWORD */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium tracking-[0.02em] text-[#5a6478]">Password</label>
                <button type="button" className="text-[12px] text-[#5a6478] transition-colors hover:text-[#818cf8]">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} // Alterna entre texto visible o asteriscos
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-[10px] border border-[#1e2330] bg-[#0d0f14] px-4 py-[13px] pr-11 text-[14px] text-[#e2e8f0] outline-none placeholder:text-[#3a4155] transition-all focus:border-[#6366f1] focus:ring-[3px] focus:ring-[#6366f1]/20"
                />
                {/* Botón del "Ojito" posicionado de forma absoluta a la derecha */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Cambia el estado true/false
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a4155] transition-colors hover:text-[#818cf8]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* CHECKBOX "REMEMBER ME" */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer rounded border border-[#2a2f3a] bg-[#0d0f14] accent-[#6366f1]"
              />
              <span className="text-[12px] font-medium text-[#5a6478]">Keep me signed in</span>
            </label>

            {/* BOTÓN DE ENVIAR (Submit) */}
            <button
              type="submit"
              disabled={loading} // Se deshabilita mientras carga para evitar doble click
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] py-[14px] text-[14px] font-semibold tracking-[0.01em] text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)] transition-all hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                // Si está cargando, muestra el spinner giratorio (animate-spin)
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                // Si no, muestra el texto normal y la flecha
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>

            {/* SEPARADOR VISUAL "OR" */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#1e2330]" />
              <span className="text-[11px] font-medium text-[#2e3545]">OR</span>
              <div className="h-px flex-1 bg-[#1e2330]" />
            </div>

            {/* BOTÓN SECUNDARIO: Solicitar acceso */}
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
          ESTILOS GLOBALES E INYECCIÓN DE ANIMACIONES
          ============================================================================ */}
      <style>{`
        /* Importamos la fuente principal desde Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        
        /* Definimos la animación de "Fade Up" para que los elementos entren suavemente desde abajo */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}