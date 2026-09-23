import { useEffect, useState } from 'react';

/**
 * EL MARC DEL NAVEGADOR, A SOBRE DE LA PAGINA.
 *
 * Serveix per treballar amb una finestra de veritat: dibuixa la barra d'un
 * navegador (les pestanyes i l'adreça) a dalt de tot de la pagina, amb
 * l'alcada del pitjor cas, i aixi es veu on acabaria la finestra de debò.
 *
 * ES UNA PEÇA DEL DOM, no una imatge: es pot seleccionar a `Elements`, veure
 * les mides que te i canviar-les en directe. Tot el que dibuixa surt de
 * `--marc-navegador-alcada`, i per tant canviar aquesta variable a `Styles`
 * mou la barra a l'instant.
 *
 * NO TOCA LA PAGINA. Va amb `pointer-events: none` i per sobre de tot, pero no
 * mou res: la finestra que rep l'aplicacio segueix sent la de debò. Perque
 * l'aplicacio NOTI la finestra petita cal l'iframe de
 * `docs/finestra-navegador.html`.
 *
 * COM S'ENCEN. Amb el parametre d'URL `navegador`:
 *
 *   ?navegador=1         la barra de 150 px (escriptori)
 *   ?navegador=150       una alcada concreta
 *   ?navegador=tauleta   la de 130 px
 *
 * i sense el parametre no surt.
 */
const ALCADA_ESCRIPTORI = 150;
const ALCADA_TAULETA = 130;
/** El terra i el sostre, perque un valor absurd no faci desaparèixer la barra. */
const ALCADA_MIN = 40;
const ALCADA_MAX = 400;

/** L'alcada que demana l'URL, o 0 si no se n'ha demanat cap. */
function alcadaDemanada() {
  if (typeof window === 'undefined') return 0;
  try {
    const sp = new URLSearchParams(window.location.search);
    if (!sp.has('navegador')) return 0;
    const v = (sp.get('navegador') || '').trim().toLowerCase();
    if (v === '' || v === '1' || v === 'si' || v === 'sí' || v === 'escriptori') return ALCADA_ESCRIPTORI;
    if (v === 'tauleta' || v === 'tablet') return ALCADA_TAULETA;
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return ALCADA_ESCRIPTORI;
    return Math.min(ALCADA_MAX, Math.max(ALCADA_MIN, Math.round(n)));
  } catch {
    return 0;
  }
}

function MarcNavegador() {
  // L'alcada no canvia sola: ve de l'URL i prou (per canviar-la, recarrega).
  const [alcada] = useState(alcadaDemanada);
  const [mides, setMides] = useState({ ample: 0, alt: 0 });

  // La mida de la finestra, per poder dir quina finestra queda sota la barra.
  useEffect(() => {
    const actualitza = () => setMides({ ample: window.innerWidth, alt: window.innerHeight });
    actualitza();
    window.addEventListener('resize', actualitza);
    return () => window.removeEventListener('resize', actualitza);
  }, []);

  if (!alcada) return null;

  return (
    <div
      id="marc-navegador"
      data-marc-navegador="1"
      data-alcada={alcada}
      style={{
        // TOT surt d'aquí: canviar aquesta variable a `Styles` mou la barra.
        '--marc-navegador-alcada': `${alcada}px`,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--marc-navegador-alcada, 150px)',
        // Per sobre de tot, tambe del megaslide, i sense agafar clics.
        zIndex: 100000,
        pointerEvents: 'none',
        background: '#E5E7EB',
        borderBottom: '1px solid #9CA3AF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Les pestanyes. */}
      <div style={{ position: 'absolute', top: 10, left: 14, display: 'flex', gap: 7 }}>
        <span style={{ width: 150, height: 22, borderRadius: '7px 7px 0 0', background: '#FFFFFF' }} />
        <span style={{ width: 150, height: 22, borderRadius: '7px 7px 0 0', background: '#CBD5E1' }} />
        <span style={{ width: 150, height: 22, borderRadius: '7px 7px 0 0', background: '#CBD5E1' }} />
      </div>

      {/* L'adreça. */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          right: 328,
          bottom: 12,
          height: 30,
          borderRadius: 15,
          background: '#FFFFFF',
          border: '1px solid #9CA3AF',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          fontSize: 13,
          color: '#6B7280',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {typeof window !== 'undefined' ? window.location.href : ''}
      </div>

      {/* Les mides, que es el que es mira aquí. */}
      <div
        style={{
          position: 'absolute',
          right: 14,
          bottom: 14,
          fontSize: 12,
          color: '#374151',
          background: '#FFFFFF',
          border: '1px solid #9CA3AF',
          borderRadius: 6,
          padding: '4px 9px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        pantalla {mides.ample}×{mides.alt} · barra {alcada} · finestra de l&apos;aplicació {mides.ample}×
        {Math.max(0, mides.alt - alcada)}
      </div>
    </div>
  );
}

export default MarcNavegador;
