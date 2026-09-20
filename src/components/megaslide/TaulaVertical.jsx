import React from 'react';
import { carrilPct } from '../../utils/layoutMetrics.js';

/**
 * TaulaVertical — la TAULA de les composicions de la vista vertical.
 * -----------------------------------------------------------------------------
 * Les dues pagines tenen una taula de 3 files dins del carril. Aquesta peca
 * en dibuixa la graella (contorns vermells) i, si es demana, les etiquetes que
 * diuen que hi va a cada cel·la. Serveix per validar l'estructura abans de
 * posar-hi els blocs de debò.
 *
 * ESTRUCTURA (la que ha passat l'amo)
 *
 *   PAGINA 1                          PAGINA 2
 *   fila 1: CARRUSEL (tota)           fila 1: GRAELLA 16x4 (tota)
 *   fila 2: STRIPE | FLETXES          fila 2: COLLECCIONS | COLORS | STRIPE
 *   fila 3: STRIPE | SELECTOR         fila 3: COLLECCIONS | SELECTOR | STRIPE
 *
 * La STRIPE es UN SOL bloc que ocupa les files 2 i 3.
 */

/** Les files, per alcada relativa de l'estructura de l'amo. */
export const FILES_VERTICAL = ['1fr', '1.05fr', '1fr'];
/** Les columnes de les files 2 i 3 (36-303-519-652-728 sobre 688). */
export const COLUMNES_VERTICAL = ['303fr', '216fr', '133fr', '76fr'];

export default function TaulaVertical({ etiquetes = false, graellaCarrusel = null }) {
  const C = 'rgba(220, 38, 38, 0.9)';
  const c = 'rgba(0,0,0,0.35)';
  const opt = {
    border: `1px solid ${c}`,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Oswald, Roboto Condensed, sans-serif',
    fontSize: '13px',
    letterSpacing: '0.06em',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    minHeight: 0,
  };
  // El requadre vermell d'una CEL·LA (la que mana l'amo).
  const vermell = { border: `2px solid ${C}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, fontFamily: 'Oswald, Roboto Condensed, sans-serif', fontSize: '13px', letterSpacing: '0.06em', color: '#1A1A1A', textTransform: 'uppercase' };
  return (
    <div
      data-taula-vertical="1"
      style={{
        display: 'grid',
        gridTemplateColumns: COLUMNES_VERTICAL.join(' '),
        gridTemplateRows: FILES_VERTICAL.join(' '),
        width: '100%',
        minHeight: 0,
      }}
    >
      {/* FILA 1: una sola cel·la, a tot el carril. Hi va la graella de 5x3. */}
      <div style={{ ...vermell, gridColumn: '1 / -1', gridRow: '1' }}>
        {graellaCarrusel || (etiquetes ? 'Carrusel' : null)}
      </div>
      {/* FILA 2: stripe (dues cel·les) i el bloc de la dreta. */}
      <div style={{ ...vermell, gridColumn: '1 / 3', gridRow: '2 / 4' }}>
        {etiquetes ? 'Stripe' : null}
      </div>
      <div style={{ ...vermell, gridColumn: '3', gridRow: '2' }}>
        {etiquetes ? 'Fletxes' : null}
      </div>
      <div style={{ ...vermell, gridColumn: '3', gridRow: '3' }}>
        {etiquetes ? 'Selector' : null}
      </div>
      <div style={{ ...opt, gridColumn: '4', gridRow: '2 / 4', border: 'none' }} />
    </div>
  );
}

/**
 * TaulaVerticalP2 — la taula de la PAGINA 2.
 *
 *   fila 1: GRAELLA 16x4 (tota)
 *   fila 2: COLLECCIONS (files 2-3) | GRAELLA COLORS | STRIPE (files 2-3)
 *   fila 3: COLLECCIONS             | SELECTOR       | STRIPE
 */
export function TaulaVerticalP2({ etiquetes = false }) {
  const C = 'rgba(220, 38, 38, 0.9)';
  const c = 'rgba(0,0,0,0.35)';
  const base = { boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: 'Oswald, Roboto Condensed, sans-serif', fontSize: '13px', letterSpacing: '0.06em', color: '#1A1A1A', textTransform: 'uppercase', minHeight: 0 };
  const vermell = { ...base, border: `2px solid ${C}` };
  const fi = { ...base, border: `1px solid ${c}` };
  return (
    <div
      data-taula-vertical="2"
      style={{
        display: 'grid',
        gridTemplateColumns: COLUMNES_VERTICAL.join(' '),
        gridTemplateRows: FILES_VERTICAL.join(' '),
        width: '100%',
        minHeight: 0,
      }}
    >
      {/* FILA 1: tota la graella. */}
      <div style={{ ...vermell, gridColumn: '1 / -1', gridRow: '1' }}>
        {etiquetes ? 'Graella 16x4' : null}
      </div>
      {/* COLLECCIONS: columna de l'esquerra, files 2 i 3. */}
      <div style={{ ...vermell, gridColumn: '1', gridRow: '2 / 4', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
        {etiquetes ? 'Col·leccions' : null}
      </div>
      {/* GRAELLA DE COLORS (fila 2) i SELECTOR (fila 3), a la segona columna. */}
      <div style={{ ...vermell, gridColumn: '2', gridRow: '2' }}>
        {etiquetes ? 'Graella colors' : null}
      </div>
      <div style={{ ...vermell, gridColumn: '2', gridRow: '3' }}>
        {etiquetes ? 'Selector' : null}
      </div>
      {/* STRIPE: files 2 i 3, columnes 3 i 4. */}
      <div style={{ ...vermell, gridColumn: '3 / 5', gridRow: '2 / 4' }}>
        {etiquetes ? 'Stripe' : null}
      </div>
    </div>
  );
}

/** Utilitat: les proporcions en % del carril, per si calen fora. */
export const columnesVerticalPct = COLUMNES_VERTICAL.map((_, i) => carrilPct([303, 216, 133, 76][i]));
