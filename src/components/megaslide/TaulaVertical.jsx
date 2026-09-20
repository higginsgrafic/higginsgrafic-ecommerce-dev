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
  textAlign: 'center',
  padding: '0 4px',
  fontFamily: 'Oswald, Roboto Condensed, sans-serif',
  fontSize: '13px',
  letterSpacing: '0.06em',
  color: '#1A1A1A',
};

/**
 * TaulaVerticalP1 — la taula de la PAGINA 1: 5 columnes x 3 files amb les
 * caselles fusionades que ha demanat l'amo:
 *
 *   fila 1: [ Grid ..................................... ]
 *   fila 2: [6-11][ Stripe .......][ Fletxes ][16-17]
 *   fila 3: [ "  ][      "       ][ Selector b/c/n ][  " ]
 *
 * Els blocs 7-9 i 12-14 son la MATEIXA casella, fusionada de dalt a baix, i les
 * caselles 6-11 i 16-17 tambe.
 *
 * La reticula va amb MITGES columnes (10) perque el conjunt de Stripe +
 * Fletxes + Selector va MOGUT MITJA CEL·LA A L'ESQUERRA. D'aqui en surten les
 * caselles 16-17 (la mitja columna de la dreta) i, a l'esquerra, la 6-11 es
 * queda amb mitja casella d'amplada.
 */
export function TaulaVerticalP1({ grid = null, stripe = null, fletxes = null, selector = null }) {
  return (
    <div
      data-taula-vertical="1"
      style={{
        display: 'grid',
        // 10 mitges columnes: aixi el conjunt de la dreta pot anar mig desplacat.
        gridTemplateColumns: 'repeat(10, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: '100%',
        // Les caselles son quadrades: 3 files sobre 5 columnes = 3/5 d'alcada.
        aspectRatio: '5 / 3',
        minHeight: 0,
      }}
    >
      <div data-taula-cela="1-5" style={{ ...CELA, gridColumn: '1 / 11', gridRow: '1' }}>{grid || 'Grid'}</div>
      <div data-taula-cela="6-11" style={{ ...CELA, gridColumn: '1 / 2', gridRow: '2 / 4' }} />
      <div data-taula-cela="7-9+12-14" style={{ ...CELA, gridColumn: '2 / 8', gridRow: '2 / 4' }}>{stripe || 'Stripe'}</div>
      <div data-taula-cela="10" style={{ ...CELA, gridColumn: '8 / 10', gridRow: '2' }}>{fletxes || 'Fletxes'}</div>
      <div data-taula-cela="15" style={{ ...CELA, gridColumn: '8 / 10', gridRow: '3' }}>{selector || 'Selector b/c/n'}</div>
      <div data-taula-cela="16-17" style={{ ...CELA, gridColumn: '10 / 11', gridRow: '2 / 4' }}>16-17</div>
    </div>
  );
}

/**
 * TaulaVerticalP2 — la taula de la PAGINA 2: 5 columnes x 3 files amb les
 * caselles fusionades que ha demanat l'amo:
 *
 *   fila 1: [ Graella dibuixos 16x4 ]
 *   fila 2: [ Col·leccions ][ Graella colors 4x4 ][ Stripe ]
 *   fila 3: [      "       ][    Selector b/c/n   ][   "    ]
 *
 * La 6 i l'11 son la MATEIXA casella, i els blocs 8-10 i 13-15 tambe (les dues
 * fusionades de dalt a baix). Cada casella porta escrit el nom del que hi anira.
 */
export function TaulaVerticalP2({ graella = null, colleccions = null, colors = null, selector = null, stripe = null }) {
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
      <div data-taula-cela="1-5" style={{ ...CELA, gridColumn: '1 / -1', gridRow: '1' }}>{graella || 'Graella dibuixos 16x4'}</div>
      {/* Les caselles veïnes s'ajusten a la correguda de 10 px: la de
          colleccions s'encongeix i la franja s'eixampla, perque les vores
          tornin a tocar-se. */}
      <div data-taula-cela="6-11" style={{ ...CELA, gridColumn: '1', gridRow: '2 / 4', marginRight: '10px' }}>{colleccions || 'Col·leccions'}</div>
      {/* La graella de colors i el selector (i la seva casella, amb el
          contorn) van 10 px a l'esquerra. */}
      <div data-taula-cela="7" style={{ ...CELA, gridColumn: '2', gridRow: '2', transform: 'translateX(-10px)' }}>{colors || 'Graella colors 4x4'}</div>
      <div data-taula-cela="8-10+13-15" style={{ ...CELA, gridColumn: '3 / 6', gridRow: '2 / 4', marginLeft: '-10px' }}>{stripe || 'Stripe'}</div>
      <div data-taula-cela="12" style={{ ...CELA, gridColumn: '2', gridRow: '3', transform: 'translateX(-10px)' }}>{selector || 'Selector b/c/n'}</div>
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
