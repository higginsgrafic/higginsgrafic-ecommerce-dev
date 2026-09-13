import { useEffect, useState } from 'react';

/**
 * MegaslideEndGuide — guia de desenvolupament.
 *
 * Dibuixa una línia horitzontal exactament allà on acaba el mega-slide quan
 * s'obre el cistell. Serveix per calibrar l'aire que hi ha entre el bloc de
 * productes i el formulari del checkout: el mega-slide hi acaba a sobre i
 * aquella franja ha de quedar neta.
 *
 * Com s'activa:
 *   - En desenvolupament (npm run dev) surt sempre.
 *   - Al lloc publicat, només si s'hi afegeix `?megaslide=1` a l'adreça.
 *   - Un cop s'ha obert el cistell del mega-slide una vegada, la posició es
 *     recorda (localStorage) i la línia continua sortint amb el cistell tancat.
 *
 * El panell del mega-slide només és al DOM mentre és obert: per això la guia
 * mesura quan el troba i es guarda l'últim valor bo.
 */
const CLAU = 'hg.megaslideGuide.enabled';
const CLAU_ALCADA = 'hg.megaslideGuide.bottom';
const SELECTOR = '[data-mega-page-viewport="3"]';

function activadaAlQuery() {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('megaslide')) return null;
    const v = String(params.get('megaslide') || '').trim().toLowerCase();
    if (['1', 'true', 'on', 'yes'].includes(v)) return true;
    if (['0', 'false', 'off', 'no'].includes(v)) return false;
    return null;
  } catch {
    return null;
  }
}

function llegirActivat() {
  const alQuery = activadaAlQuery();
  if (alQuery !== null) return alQuery;
  if (import.meta.env.DEV) return true;
  try {
    return window.localStorage.getItem(CLAU) === '1';
  } catch {
    return false;
  }
}

function llegirAlcadaDesada() {
  try {
    const n = Number(window.localStorage.getItem(CLAU_ALCADA));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  } catch {
    return null;
  }
}

export default function MegaslideEndGuide() {
  const [activat, setActivat] = useState(llegirActivat);
  const [alcada, setAlcada] = useState(llegirAlcadaDesada);

  // El panell del mega-slide va i ve: mesurem mentre hi sigui.
  useEffect(() => {
    if (!activat) return undefined;
    let raf = 0;
    const mesura = () => {
      const el = document.querySelector(SELECTOR);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.height > 0) {
          const bottom = Math.round(r.bottom);
          setAlcada((prev) => {
            if (prev === bottom) return prev;
            try { window.localStorage.setItem(CLAU_ALCADA, String(bottom)); } catch { /* ignore */ }
            return bottom;
          });
        }
      }
      raf = requestAnimationFrame(mesura);
    };
    raf = requestAnimationFrame(mesura);
    return () => cancelAnimationFrame(raf);
  }, [activat]);

  // Permet encendre'l i apagar-lo sense recarregar (útil mentre es prova).
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        setActivat((prev) => {
          const next = !prev;
          try { window.localStorage.setItem(CLAU, next ? '1' : '0'); } catch { /* ignore */ }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!activat) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: alcada != null ? `${alcada}px` : 'auto',
        bottom: alcada == null ? 0 : 'auto',
        zIndex: 2147483000,
        pointerEvents: 'none',
        borderTop: '1px dashed #E11D48',
        display: 'flex',
        justifyContent: 'flex-start',
      }}
    >
      <span
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '10px',
          lineHeight: 1.6,
          color: '#FFFFFF',
          background: '#E11D48',
          padding: '1px 6px',
          whiteSpace: 'nowrap',
        }}
      >
        {alcada != null
          ? `final del mega-slide · ${alcada} px (Alt+M per amagar)`
          : 'obre el cistell del mega-slide per calibrar la línia (Alt+M per amagar)'}
      </span>
    </div>
  );
}
