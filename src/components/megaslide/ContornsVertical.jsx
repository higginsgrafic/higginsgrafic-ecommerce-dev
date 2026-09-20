import React from 'react';

/** Nomes es munten amb aquest parametre a l'adreca. */
export function contornsActius() {
  if (typeof window === 'undefined') return false;
  const p = new URLSearchParams(window.location.search);
  return p.has('contornsVertical') || p.has('contorns');
}

const A = 'rgba(220, 38, 38, 0.9)';   // vermell de la taula
const C = 'rgba(220, 38, 38, 0.45)';  // vermell fi de les cel·les

/**
 * ContornsVertical — els CONTORNS de la retícula de la vista vertical.
 * -----------------------------------------------------------------------------
 * Dibuixa damunt de la composició:
 *
 *   - el CONTORN DE LA TAULA (el carril sencer), en vermell;
 *   - el CONTORN DE CADA CEL·LA, en vermell fi;
 *   - les línies de la retícula del carril (les columnes de sota i les files).
 *
 * Serveix per veure si les peces cauen dins de la seva cel·la. Nomes es munta
 * amb `?contornsVertical=1` (o `?contorns=1`), aixi que en produccio no hi es.
 */
export default function ContornsVertical({ carril, columnes = [] }) {
  if (!carril) return null;
  const casella = Math.round(carril / 16);
  return (
    <div
      data-contorns-vertical="1"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        boxSizing: 'border-box',
      }}
    >
      {/* La marca de cada CEL·LA de la graella de dibuixos (16 columnes). */}
      <div
        data-contorns-caselles="1"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, ${C} 1px, transparent 1px), linear-gradient(to bottom, ${C} 1px, transparent 1px)`,
          backgroundSize: `${casella}px ${casella}px`,
        }}
      />
      {/* Les COLUMNES de la retícula de sota. */}
      {columnes.map((pct, i) => (
        <div
          key={`col-${i}`}
          style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, borderLeft: `2px solid ${A}` }}
        />
      ))}
      {/* La TAULA: el carril sencer. */}
      <div style={{ position: 'absolute', inset: 0, border: `2px solid ${A}`, boxSizing: 'border-box' }} />
    </div>
  );
}

/**
 * ContornsFlex — els contorns per a una composició de BLOCS (la pagina 1):
 * cada bloc que es passa rep el seu contorn, i el conjunt, el de la taula.
 */
export function ContornsFlex({ blocs = [], color = C }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999, boxSizing: 'border-box' }}
    >
      {blocs.map((estil, i) => (estil ? (
        <div key={`bloc-${i}`} style={{ position: 'absolute', border: `1px solid ${color}`, boxSizing: 'border-box', ...estil }} />
      ) : null))}
      <div style={{ position: 'absolute', inset: 0, border: `2px solid ${A}`, boxSizing: 'border-box' }} />
    </div>
  );
}
