import { useState, useEffect, useRef } from 'react';

/**
 * Hook reutilizable para animar un contador numérico con easing cúbico.
 * @param {number} target   - Valor final
 * @param {number} duration - Duración de la animación en ms (default 1200)
 * @param {boolean} start   - Si debe arrancar la animación (default true)
 */
export default function useCountUp(target, duration = 1200, start = true) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);

  return value;
}