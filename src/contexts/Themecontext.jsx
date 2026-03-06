import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// 1. CREACIÓN DEL CONTEXTO
// ============================================================================
const ThemeContext = createContext(null);

// ============================================================================
// 2. PROVEEDOR DEL TEMA (ThemeProvider)
// ============================================================================
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('checkin-theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('checkin-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    // ── MEJORA: Inyectar CSS variables para usar hover: en Tailwind ──
    const isDark = theme === 'dark';
    const root = document.documentElement;
    root.style.setProperty('--ck-bg',            isDark ? '#0a0c10' : '#f4f5f7');
    root.style.setProperty('--ck-bg-sidebar',    isDark ? '#0d0f14' : '#ffffff');
    root.style.setProperty('--ck-bg-card',       isDark ? '#111318' : '#ffffff');
    root.style.setProperty('--ck-bg-input',      isDark ? '#0d0f14' : '#f8f9fb');
    root.style.setProperty('--ck-bg-hover',      isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)');
    root.style.setProperty('--ck-border',        isDark ? '#1e2330' : '#e2e6ed');
    root.style.setProperty('--ck-border-side',   isDark ? '#1a1f2b' : '#e8ebf0');
    root.style.setProperty('--ck-text-primary',  isDark ? '#e2e8f0' : '#111827');
    root.style.setProperty('--ck-text-secondary', isDark ? '#5a6478' : '#6b7280');
    root.style.setProperty('--ck-text-muted',    isDark ? '#3a4155' : '#9ca3af');
    root.style.setProperty('--ck-text-dim',      isDark ? '#2e3545' : '#cbd5e1');
    root.style.setProperty('--ck-accent-light',  isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)');
    root.style.setProperty('--ck-scrollbar',     isDark ? '#2a2f3a' : '#d1d5db');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// 3. HOOK PERSONALIZADO: useTheme
// ============================================================================
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

// ============================================================================
// 4. HOOK DE DISEÑO: useTokens
// ============================================================================
export function useTokens() {
  const { isDark } = useTheme();

  return {
    // FONDOS
    bg:          isDark ? '#0a0c10' : '#f4f5f7',
    bgSidebar:   isDark ? '#0d0f14' : '#ffffff',
    bgCard:      isDark ? '#111318' : '#ffffff',
    bgInput:     isDark ? '#0d0f14' : '#f8f9fb',
    bgHover:     isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    bgActive:    isDark ? 'rgba(99,102,241,0.15)'  : 'rgba(99,102,241,0.08)',

    // BORDES
    border:      isDark ? '#1e2330' : '#e2e6ed',
    borderSide:  isDark ? '#1a1f2b' : '#e8ebf0',

    // TEXTOS
    textPrimary:   isDark ? '#e2e8f0' : '#111827',
    textSecondary: isDark ? '#5a6478' : '#6b7280',
    textMuted:     isDark ? '#3a4155' : '#9ca3af',
    textDim:       isDark ? '#2e3545' : '#cbd5e1',

    // ACENTOS
    accent:        '#6366f1',
    accentLight:   isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
    accentText:    '#818cf8',
    accentBorder:  isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.3)',

    // SOMBRAS
    shadow: isDark
      ? '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px #1e2330'
      : '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px #e2e6ed',

    // REFERENCIA AL MODO (útil para lógica condicional)
    isDark,
  };
}