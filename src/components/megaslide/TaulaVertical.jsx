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
  // La pestanya del megaslide es dimensiona amb la taula de la pagina 1 (5x3
  // amb caselles quadrades), pero la taula de la pagina 2 s'acaba ABANS: al ras
  // de la imatge de la franja, i baixa 15 px mes (43,8 px mes curta a 768: el
  // bottom de la taula toca el de la imatge). Es la mes curta, que es la que
  // mana.
  return Math.ceil((ampladaCarril(ampleFinestra) * 3) / 5) - 43.8;
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
  // Les caseslles son TOTES SENCILLES (5 columnes senceres, sense mitges
  // caselles ni talls): la filera de dalt sencera per a la graella, la
  // franja a les columnes 2-4 de les fileres 2 i 3, i la columna 5 per a les
  // fletxes (filera 2) i el selector (filera 3).
  return (
    <div
      data-taula-vertical="1"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: '100%',
        // Les caselles, de la MATEIXA mida que les de la pagina 2: la taula fa
        // la mateixa alcada (la banda menys els 15 px del marge) i les files
        // queden igual.
        height: 'calc(100% - 15px)',
        marginTop: '15px',
        minHeight: 0,
      }}
    >
      <div data-taula-cela="1-5" style={{ ...CELA, gridColumn: '1 / -1', gridRow: '1' }}>{grid || 'Grid'}</div>
      <div data-taula-cela="6" style={{ ...CELA, gridColumn: '1', gridRow: '2', marginRight: '20px', alignItems: 'flex-end' }}>{selector || null}</div>
      <div data-taula-cela="7-9+12-14" style={{ ...CELA, gridColumn: '2 / 5', gridRow: '2 / 4', justifyContent: 'center', alignItems: 'flex-end', marginLeft: '-20px', marginRight: '-20px' }}>{stripe || 'Stripe'}</div>
      <div data-taula-cela="10" style={{ ...CELA, gridColumn: '5', gridRow: '2', marginLeft: '20px' }}>{fletxes || 'Fletxes'}</div>
      <div data-taula-cela="11" style={{ ...CELA, gridColumn: '1', gridRow: '3', marginRight: '20px' }} />
      {/* La casella del selector, exactament com la de la pagina 2: els
          mateixos marges (20 a la dreta) i la mateixa correguda (10 a
          l'esquerra), i el selector al bottom. */}
      <div data-taula-cela="15" style={{ ...CELA, gridColumn: '5', gridRow: '3', marginLeft: '20px' }} />
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
        // La taula va 15 px mes avall que la banda de la seva pagina i fa
        // l'alcada de sempre (la banda es mes curta: ho fixa
        // `alturaTaulaVertical`).
        height: 'calc(100% - 15px)',
        marginTop: '15px',
        minHeight: 0,
      }}
    >
      <div data-taula-cela="1-5" style={{ ...CELA, gridColumn: '1 / -1', gridRow: '1' }}>{graella || 'Graella dibuixos 16x4'}</div>
      {/* Les caselles veïnes s'ajusten a la correguda de 10 px: la de
          colleccions s'encongeix i la franja s'eixampla, perque les vores
          tornin a tocar-se. */}
      <div data-taula-cela="6-11" style={{ ...CELA, gridColumn: '1', gridRow: '2 / 4', marginRight: '10px' }}>
        {/* La llista de colleccions va del TOP del selector (301,2) al BOTTOM
            de la graella de colors (516). */}
        <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', paddingTop: '19.2px', paddingBottom: '0px' }}>
          {colleccions || 'Col·leccions'}
        </div>
      </div>
      {/* La graella de colors i el selector (i la seva casella, amb el
          contorn) van 10 px a l'esquerra. */}
      <div data-taula-cela="7" style={{ ...CELA, gridColumn: '2', gridRow: '2', transform: 'translateX(-10px)', marginRight: '20px', alignItems: 'flex-end' }}>{selector || 'Selector b/c/n'}</div>
      {/* La franja: la imatge va enganxada a l'esquerra de la casella i s'eixampla
          20 px cap a la dreta, mantenint la seva proporcio (alcada automatica). */}
      <div data-taula-cela="8-10+13-15" style={{ ...CELA, gridColumn: '3 / 6', gridRow: '2 / 4', marginLeft: '-30px', justifyContent: 'flex-start', alignItems: 'flex-start' }}>{stripe || 'Stripe'}</div>
      <div data-taula-cela="12" style={{ ...CELA, gridColumn: '2', gridRow: '3', transform: 'translateX(-10px)', marginRight: '20px', alignItems: 'flex-end' }}>{colors || 'Graella colors 4x4'}</div>
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
