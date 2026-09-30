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

/** (28/09/2026) Els CONTORNS de les caselles, a la vista: l'amo els va demanar
 * per validar on cau cada casella. La casella ja porta un `border` d'1 px (era
 * transparent justament perque la geometria no es mogues en amagar-lo): aqui
 * nome's se li dona color, o sigui que les mides no canvien gens. */
const MOSTRA_CONTORNS_TAULA = false;
const COLOR_CONTORN_TAULA = 'rgba(0, 140, 255, 0.5)';

/** L'estil d'una casella. El contorn es transparent (no `none`) perque la
 * geometria de les caselles no es mogui en amagar-lo.
 *
 * SENSE COIXI (28/09/2026, ho va demanar l'amo): era `0 4px` i el contingut de
 * cada casella arrencava 4 px endins. Ara les peces van a la vora de la casella
 * (queda la vora d'1 px del contorn). */
const CELA = {
  border: `1px solid ${MOSTRA_CONTORNS_TAULA ? COLOR_CONTORN_TAULA : 'transparent'}`,
  boxSizing: 'border-box',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: 0,
  fontFamily: 'Oswald, Roboto Condensed, sans-serif',
  fontSize: '13px',
  letterSpacing: '0.06em',
  color: 'hsl(var(--grey-ink-strong))',
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
      /* La capa de la taula es `pointer-events: none`; la taula el torna a
         activar perque les seves peces rebin els tocs (tap i clic). */
      style={{
        pointerEvents: 'auto',
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
      <div data-taula-cela="1-5" style={{ ...CELA, gridColumn: '1 / -1', gridRow: '1', position: 'relative', zIndex: 20 }}>{grid || 'Grid'}</div>
      <div data-taula-cela="6" style={{ ...CELA, gridColumn: '1', gridRow: '2', marginRight: '20px', alignItems: 'flex-end' }}>{selector || null}</div>
      <div data-taula-cela="7-9+12-14" style={{ ...CELA, gridColumn: '2 / 5', gridRow: '2 / 4', justifyContent: 'center', alignItems: 'flex-end', marginLeft: '-20px', marginRight: '-20px' }}>{stripe || 'Stripe'}</div>
      <div data-taula-cela="10" style={{ ...CELA, gridColumn: '5', gridRow: '2', marginLeft: '20px', alignItems: 'flex-end' }}>{fletxes || 'Fletxes'}</div>
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
 *   fila 1: [ Selector ][ Graella dibuixos 16x4 + barres de color ][ Col·leccions ]
 *   files 2 i 3: [ Franja (cols 1-4) ][ Col·leccions (col 5) ]
 *
 * Es la MATEIXA distribucio que la PAGINA 2 HORITZONTAL (28/09/2026, ho va
 * demanar l'amo): el selector a l'esquerra, la graella de dibuixos amb la tira
 * de colors just a sota, la columna de colleccions a la DRETA i la franja a
 * sota de tot. SENSE FLETXES: a la tauleta es tactic i no n'hi ha.
 *
 * Cada casella porta escrit el nom del que hi anira.
 */
export function TaulaVerticalP2({ graella = null, colleccions = null, colors = null, selector = null, stripe = null }) {
  return (
    <div
      data-taula-vertical="2"
      style={{
        pointerEvents: 'auto',
        display: 'grid',
        // LA COLUMNA DEL SELECTOR, DE LA SEVA MIDA (28/09/2026, ho va demanar
        // l'amo: ajustar la casella al maxim sense moure el selector). Els
        // 117,8 px son el selector (105,8) mes les seves dues vores d'1 px mes
        // els 10 px de la correguda que separa les caselles: la casella queda de
        // 107,8 i el selector l'omple sense canviar de mida. Les altres quatre
        // columnes es reparteixen la resta.
        gridTemplateColumns: '117.8px repeat(4, 1fr)',
        // LA FILA DEL SELECTOR FA LA SEVA MIDA (28/09/2026): amb `1fr` la
        // casella feia 118,1 px i el selector 105,8, o sigui que li sobraven
        // 12,3 px de buit a sota. Amb `auto` la fila s'ajusta al selector i les
        // dues de baix es reparteixen la resta.
        gridTemplateRows: 'auto 1fr 1fr',
        width: '100%',
        // La taula va 15 px mes avall que la banda de la seva pagina i fa
        // l'alcada de sempre (la banda es mes curta: ho fixa
        // `alturaTaulaVertical`).
        height: 'calc(100% - 15px)',
        marginTop: '15px',
        minHeight: 0,
      }}
    >
      {/* El selector, a l'ESQUERRA i A DALT de la casella (28/09/2026, ho va
          demanar l'amo): el node fa el 90% d'ample (aixo es el que li dona la
          mida als botons, i per aixo no es toca) i amb `center` quedava centrat,
          o sigui que arrencava 10,9 px endins del carril. Amb `flex-start`
          arrenca on arrenca el contingut de la taula (40 + la vora i el coixi de
          4 px) i, com la graella, toca la vora de dalt. */}
      {/* LA FILA 1, AL FONS DEL HEADER (28/09/2026, ho ha demanat l'amo): les
          DUES caselles de la fila pugen 15 px, que es exactament el `marginTop`
          de la taula, o sigui que la vora de dalt de la fila queda al fons del
          header (y=114) i les files de sota no es mouen. */}
      <div data-taula-cela="1" style={{ ...CELA, gridColumn: '1', gridRow: '1', transform: 'translateY(-15px)', marginRight: '10px', alignItems: 'flex-start', justifyContent: 'flex-start' }}>{selector || 'Selector b/c/n'}</div>
      {/* LES TRES BANDES, alineades amb els TRES BOTONS del selector
          (28/09/2026, ho va demanar l'amo): la fila de dalt amb BLANC, la de
          baix amb COLOR i la tira de colors amb NEGRE. Cada banda fa 34,6 px,
          que es l'alcada de cada boto del selector (mesurada a 768x1024).
          I el conjunt toca la vora de DALT de la casella, com el selector. */}
      <div
        data-taula-cela="2-5"
        style={{ ...CELA, gridColumn: '2 / -1', gridRow: '1', transform: 'translateY(-15px)', position: 'relative', zIndex: 20, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}
      >
        <div style={{ width: '100%', height: '69.2px' }}>{graella || 'Graella dibuixos 16x4'}</div>
        <div style={{ width: '100%', height: '34.6px', display: 'flex', alignItems: 'center' }}>{colors || 'Graella colors 4x4'}</div>
      </div>
      {/* La columna de colleccions, a la DRETA i nome's a les FILES 2 I 3 (col
          5): la fila 1 d'aquella columna queda per a la graella. El marge de
          10 px es la mateixa correguda que separa les caselles de dalt. */}
      <div data-taula-cela="10+15" style={{ ...CELA, gridColumn: '5', gridRow: '2 / 4', marginLeft: '10px', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}>{colleccions || 'Col·leccions'}</div>
      {/* La franja, sota de tot (cols 1-4, files 2-3) i enganxada a l'esquerra
          de la casella, com a la pagina 2 horitzontal. */}
      <div data-taula-cela="6-9+11-14" style={{ ...CELA, gridColumn: '1 / 5', gridRow: '2 / 4', justifyContent: 'flex-start', alignItems: 'flex-start' }}>{stripe || 'Stripe'}</div>
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
        // La correcció de la BARRA DE DESPLAÇAMENT (28/09/2026): aquesta capa
        // viu dins el marc del lloc, que descompta la barra (15 px a 768), i la
        // taula hi quedava centrada a 376,5 en lloc de 384 — el mateix
        // desviament de 7,5 px que la capçalera. La capa fa l'amplada de la
        // FINESTRA (`100vw`, que inclou la barra) i la taula s'hi centra: 40 a
        // cada banda, igual que el header. (Un `marginLeft` no hi serveix: amb
        // `right: 0` tambe encongeix la capa i la centrada es reparteix.)
        width: '100vw',
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
