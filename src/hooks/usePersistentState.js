import { useEffect, useState } from 'react';

/**
 * usePersistentState
 * -----------------------------------------------------------------------------
 * Hook similar a `useState` però que persisteix el valor a `sessionStorage`
 * amb TTL (10s per defecte). Quan el component es remunta abans del TTL,
 * el valor es recupera; si ha expirat, s'usa el valor inicial.
 *
 * Pensat per a estats de UI temporals (tabs actius, ordenacions) que no han
 * de sobreviure a navegacions llargues però sí a remuntatges ràpids.
 *
 * @param {string} key  Clau de sessionStorage.
 * @param {*}      initial Valor inicial (i fallback en cas d'error/expiració).
 * @param {number} [ttlMs=10000] Temps de vida en mil·lisegons.
 */
export default function usePersistentState(key, initial, ttlMs = 10000) {
  const read = () => {
    try {
      if (typeof window === 'undefined') return initial;
      const raw = window.sessionStorage.getItem(key);
      if (!raw) return initial;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return initial;
      if (typeof parsed.expiresAt === 'number' && Date.now() > parsed.expiresAt) {
        window.sessionStorage.removeItem(key);
        return initial;
      }
      return parsed.value;
    } catch {
      return initial;
    }
  };

  const [state, setState] = useState(read);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.sessionStorage.setItem(
        key,
        JSON.stringify({ value: state, expiresAt: Date.now() + ttlMs })
      );
    } catch {
      // ignore
    }
  }, [key, state, ttlMs]);

  return [state, setState];
}
