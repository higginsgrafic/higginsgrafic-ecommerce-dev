import React from 'react';

/**
 * TaulaVertical — la TAULA de la vista vertical del megaslide, DIBUIXADA.
 * -----------------------------------------------------------------------------
 * Una reticula de 5 columnes x 3 files amb els contorns dibuixats i sense cap
 * contingut de debò: serveix per veure i validar l'estructura abans de posar-hi
 * les peces.
 *
 * Viu DINS del carril del megaslide: la referencia es la de la tauleta (1024
 * amb coixos de 40), mai mes ampla que la finestra menys els coixos.
 */

/** L'amplada de referencia del contingut de la tauleta (1024 amb coixos de 40). */
export const CARRIL_TAULETA_PX = 1024 * 0.995 - 80;

/** L'amplada del carril: la referencia de tauleta, mai mes ampla que la finestra. */
export function ampladaCarril(ampleFinestra) {
  const w = Number.isFinite(ampleFinestra) && ampleFinestra > 0 ? ampleFinestra : CARRIL_TAULETA_PX;
  return Math.max(0, Math.min(CARRIL_TAULETA_PX, w - 80));
}

/** Les columnes i les files de la taula. */
export const COLUMNES_TAULA = 5;
export const FILES_TAULA = 3;

/** L'alçada de la taula, en px, per a una amplada de finestra donada. */
export function alturaTaulaVertical(ampleFinestra) {
  return Math.ceil((ampladaCarril(ampleFinestra) * FILES_TAULA) / COLUMNES_TAULA);
}

export default function TaulaVertical({ columnes = COLUMNES_TAULA, files = FILES_TAULA }) {
  // El contorn d'una CEL·LA: la línia que dibuixa la taula.
  const cela = {
    border: '1px solid rgba(0, 0, 0, 0.35)',
    boxSizing: 'border-box',
    minWidth: 0,
    minHeight: 0,
  };
  return (
    <div
      data-taula-vertical="2"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnes}, 1fr)`,
        gridTemplateRows: `repeat(${files}, 1fr)`,
        width: '100%',
        // LES CASELLES SON QUADRADES: l'alcada de la taula surt de la mateixa
        // proporcio que les columnes (una retícula de 5x3 fa 3/5 d'alcada).
        aspectRatio: `${columnes} / ${files}`,
        minHeight: 0,
      }}
    >
      {Array.from({ length: columnes * files }).map((_, i) => (
        <div key={`cela-${i}`} data-taula-cela={i} style={cela} />
      ))}
    </div>
  );
}
