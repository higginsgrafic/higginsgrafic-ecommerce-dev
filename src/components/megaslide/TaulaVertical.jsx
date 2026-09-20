import React from 'react';

/**
 * TaulaVertical — les DUES taules dibuixades de la vista vertical del megaslide.
 * -----------------------------------------------------------------------------
 * Una per PAGINA, i INDEPENDENTS: cada una te la seva reticula, el seu nombre
 * de caselles i el seu numero, i es pot canviar sense tocar l'altra. Avui totes
 * dues son una reticula de 5 columnes x 3 files amb els contorns dibuixats i
 * les caselles numerades (1..15), sense cap contingut de debò: serveixen per
 * veure i validar l'estructura abans de posar-hi les peces.
 *
 * Viuen DINS del carril del megaslide: la referencia es la de la tauleta (1024
 * amb coixos de 40), mai mes ampla que la finestra menys els coixos.
 */

/** L'amplada de referencia del contingut de la tauleta (1024 amb coixos de 40). */
export const CARRIL_TAULETA_PX = 1024 * 0.995 - 80;

/** L'amplada del carril: la referencia de tauleta, mai mes ampla que la finestra. */
export function ampladaCarril(ampleFinestra) {
  const w = Number.isFinite(ampleFinestra) && ampleFinestra > 0 ? ampleFinestra : CARRIL_TAULETA_PX;
  return Math.max(0, Math.min(CARRIL_TAULETA_PX, w - 80));
}

/**
 * L'alcada que demana la mes alta de les dues taules (avui totes dues son de
 * 5x3, amb les caselles quadrades): es la que fa servir el megaslide per
 * dimensionar la pestanya.
 */
export function alturaTaulaVertical(ampleFinestra) {
  return Math.ceil((ampladaCarril(ampleFinestra) * 3) / 5);
}

/** L'estil d'una casella: el contorn dibuixat i el número centrat. */
const CELA = {
  border: '1px solid rgba(0, 0, 0, 0.35)',
  boxSizing: 'border-box',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Oswald, Roboto Condensed, sans-serif',
  fontSize: '13px',
  letterSpacing: '0.06em',
  color: '#1A1A1A',
};

/**
 * TaulaVerticalP1 — la taula de la PAGINA 1: 5 columnes x 3 files amb les
 * caselles fusionades que ha demanat l'amo:
 *
 *   fila 1: [ 1-5 ]
 *   fila 2: [ 6 ][ 7-9 ][ 10 ]
 *   fila 3: [ 11 ][ 12-14 ][ 15 ]
 *
 * Cada casella porta escrit el numero (o el rang) de les caselles originals que
 * cobreix, per poder validar l'estructura.
 */
export function TaulaVerticalP1() {
  return (
    <div
      data-taula-vertical="1"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: '100%',
        // Les caselles son quadrades: 3 files sobre 5 columnes = 3/5 d'alcada.
        aspectRatio: '5 / 3',
        minHeight: 0,
      }}
    >
      <div data-taula-cela="1-5" style={{ ...CELA, gridColumn: '1 / -1', gridRow: '1' }}>1-5</div>
      <div data-taula-cela="6" style={{ ...CELA, gridColumn: '1', gridRow: '2' }}>6</div>
      <div data-taula-cela="7-9" style={{ ...CELA, gridColumn: '2 / 5', gridRow: '2' }}>7-9</div>
      <div data-taula-cela="10" style={{ ...CELA, gridColumn: '5', gridRow: '2' }}>10</div>
      <div data-taula-cela="11" style={{ ...CELA, gridColumn: '1', gridRow: '3' }}>11</div>
      <div data-taula-cela="12-14" style={{ ...CELA, gridColumn: '2 / 5', gridRow: '3' }}>12-14</div>
      <div data-taula-cela="15" style={{ ...CELA, gridColumn: '5', gridRow: '3' }}>15</div>
    </div>
  );
}

/**
 * TaulaVerticalP2 — la taula de la PAGINA 2: 5 columnes x 3 files amb les
 * caselles fusionades que ha demanat l'amo:
 *
 *   fila 1: [ 1-5 ]
 *   fila 2: [ 6-11 ][ 7 ][ 8-10 ]
 *   fila 3: [ 6-11 ][ 12 ][ 13-15 ]
 *
 * (La 6 i l'11 son la MATEIXA casella, fusionada de dalt a baix.) Cada casella
 * porta escrit el numero (o el rang) de les caselles originals que cobreix.
 */
export function TaulaVerticalP2() {
  return (
    <div
      data-taula-vertical="2"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: '100%',
        // Les caselles son quadrades: 3 files sobre 5 columnes = 3/5 d'alcada.
        aspectRatio: '5 / 3',
        minHeight: 0,
      }}
    >
      <div data-taula-cela="1-5" style={{ ...CELA, gridColumn: '1 / -1', gridRow: '1' }}>1-5</div>
      <div data-taula-cela="6-11" style={{ ...CELA, gridColumn: '1', gridRow: '2 / 4' }}>6-11</div>
      <div data-taula-cela="7" style={{ ...CELA, gridColumn: '2', gridRow: '2' }}>7</div>
      <div data-taula-cela="8-10" style={{ ...CELA, gridColumn: '3 / 6', gridRow: '2' }}>8-10</div>
      <div data-taula-cela="12" style={{ ...CELA, gridColumn: '2', gridRow: '3' }}>12</div>
      <div data-taula-cela="13-15" style={{ ...CELA, gridColumn: '3 / 6', gridRow: '3' }}>13-15</div>
    </div>
  );
}

/**
 * CapaTaulaVertical — la CAPA que munta la taula d'una pagina damunt del seu
 * viewport, a la vista vertical. Es absoluta (no mou res del layout), va
 * centrada i fa l'amplada del carril. La taula hi entra com a filla, aixi cada
 * pagina porta la SEVA.
 *
 * @param {object} props
 * @param {number} props.pagina  la pagina del megaslide (1 o 2)
 * @param {React.ReactNode} props.children  la taula d'aquella pagina
 */
export function CapaTaulaVertical({ pagina, children }) {
  const ample = typeof window !== 'undefined' && window.innerWidth > 0
    ? Math.round(ampladaCarril(window.innerWidth))
    : 0;
  return (
    <div
      data-megaslide-taula={pagina}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ width: ample ? `${ample}px` : '100%', maxWidth: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
