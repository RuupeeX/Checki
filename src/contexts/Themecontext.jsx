import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// 1. CREACIÓN DEL CONTEXTO
// ============================================================================
// Creamos el contexto de React. Esto nos permite pasar datos (el tema actual) 
// a cualquier componente de la app sin tener que pasarlo por "props" manualmente.
const ThemeContext = createContext(null);

// ============================================================================
// 2. PROVEEDOR DEL TEMA (ThemeProvider)
// ============================================================================
// Este componente envuelve toda tu aplicación (en App.jsx). Todo lo que esté 
// dentro de él tendrá acceso al estado del tema.
export function ThemeProvider({ children }) {
  // Inicializamos el estado del tema. Usamos una función para leer de localStorage
  // y recordar si el usuario ya había elegido un tema en su visita anterior.
  const [theme, setTheme] = useState(() => {
    // Comprobamos que window existe (útil si usas Next.js/SSR para evitar errores)
    if (typeof window !== 'undefined') {
      // Si hay un tema guardado en el navegador, lo usamos. Si no, por defecto es 'dark'.
      return localStorage.getItem('checkin-theme') || 'dark';
    }
    return 'dark';
  });

  // Este useEffect se ejecuta cada vez que la variable 'theme' cambia.
  useEffect(() => {
    // Guardamos la nueva preferencia en el almacenamiento del navegador
    localStorage.setItem('checkin-theme', theme);
    // Inyectamos un atributo en el HTML (<html>) por si queremos usar CSS puro (ej. data-theme="dark")
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Función de ayuda para alternar rápidamente entre claro y oscuro
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    // Proveemos los valores y funciones al resto de la aplicación
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// 3. HOOK PERSONALIZADO: useTheme
// ============================================================================
// En lugar de usar useContext(ThemeContext) en cada archivo, creamos este hook.
export function useTheme() {
  const ctx = useContext(ThemeContext);
  // Si alguien intenta usar useTheme fuera del <ThemeProvider>, lanzamos un error claro.
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

// ============================================================================
// 4. HOOK DE DISEÑO: useTokens (EL SISTEMA DE COLORES)
// ============================================================================
// Este hook es fundamental. Funciona como un "Diccionario de variables CSS".
// Al importarlo en cualquier componente, te devuelve los colores exactos 
// dependiendo de si el modo actual es claro u oscuro.
export function useTokens() {
  // Extraemos isDark del contexto
  const { isDark } = useTheme();

  return {
    // FONDOS (Backgrounds)
    bg:          isDark ? '#0a0c10' : '#f4f5f7', // Fondo principal (body)
    bgSidebar:   isDark ? '#0d0f14' : '#ffffff', // Fondo del panel lateral
    bgCard:      isDark ? '#111318' : '#ffffff', // Fondo de las tarjetas (Dashboards)
    bgInput:     isDark ? '#0d0f14' : '#f8f9fb', // Fondo de cajas de texto o áreas hundidas
    bgHover:     isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', // Efecto hover sutil
    bgActive:    isDark ? 'rgba(99,102,241,0.15)'  : 'rgba(99,102,241,0.08)', // Botón pulsado o activo

    // BORDES (Borders)
    border:      isDark ? '#1e2330' : '#e2e6ed', // Bordes generales (tarjetas, inputs)
    borderSide:  isDark ? '#1a1f2b' : '#e8ebf0', // Borde sutil para separar el sidebar

    // TEXTOS (Typography)
    textPrimary:   isDark ? '#e2e8f0' : '#111827', // Títulos y textos principales
    textSecondary: isDark ? '#5a6478' : '#6b7280', // Subtítulos y descripciones
    textMuted:     isDark ? '#3a4155' : '#9ca3af', // Texto muy apagado (ej. labels pequeñas)
    textDim:       isDark ? '#2e3545' : '#cbd5e1', // Texto casi invisible o bordes inactivos

    // ACENTOS (Colores de la marca - Morado)
    accent:        '#6366f1', // Color principal de la marca (Morado índigo)
    accentLight:   isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)', // Fondo morado muy transparente
    accentText:    '#818cf8', // Texto morado (más brillante en dark mode para que lea bien)
    accentBorder:  isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.3)', // Bordes de acento

    // SOMBRAS (Shadows)
    shadow: isDark
      ? '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px #1e2330' // Sombra oscura con un micro-borde
      : '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px #e2e6ed', // Sombra clara estándar
  };
}