import { forwardRef } from 'react';
import TambeRail from '@/pages/productRail/TambeRail';

// =============================================================================
//  TRAM FINAL — Component reutilitzable
// =============================================================================
//
//  Ocupa des de la fila global 219 fins a la fila global 267 (aire inclòs).
//  Conté:
//    - El text-poster gran ("CADA PERSONA TÉ UNA HISTÒRIA, CADA HISTÒRIA TÉ UN DIBUIX").
//    - El subtítol "ALTRES HISTÒRIES" + les fletxes de carrusel.
//    - El TambeRail (graella de samarretes relacionades).
//
//  Props:
//    - pautaGridRef:  ref que es passa al Pauta4ColsOverlay per mesurar files.
//    - rowHeight:     alçada actual d'una fila (per dimensionar les fletxes).
//    - posterText:    array de línies del text gran (default: text de l'home).
//    - posterTextOffsetX: desplaçament X del bloc de text.
//    - tambeTitle:    title que es passa al TambeRail.
//    - tambeHref:     href de cada targeta del TambeRail.
//    - marginTop:     marge superior del bloc (per encaixar dins la pauta global).
// =============================================================================

// Sense frase per defecte: cada col·lecció ha de passar el seu `posterLines`.
// Així cada frase apareix només a una sola col·lecció.
const DEFAULT_POSTER_LINES = [];

const TramFinal = forwardRef(function TramFinal(
  {
    rowHeight = 38,
    posterLines = DEFAULT_POSTER_LINES,
    posterTextOffsetX = '10px',
    tambeTitle = 'cada dibuix té una història',
    tambeHref = '/constructor/pdp',
    marginTop = '-552px',
    posterTextAlign = 'left',
    tambeImages,
    visibleCards,
    style,
  },
  pautaGridRef,
) {
  return (
    <div
      ref={pautaGridRef}
      data-tram-final="1"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(4, minmax(0, calc((100% - ${3 * 22.5}px) / 4)))`,
        gridTemplateRows: 'minmax(0, 1fr) repeat(57, minmax(0, 1fr))',
        aspectRatio: '2642 / 4323',
        columnGap: '22.5px',
        rowGap: '3px',
        marginTop,
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(var(--hg-tdp-xR) - var(--hg-tdp-xL))',
        boxSizing: 'border-box',
        // El bloc puja amb marginTop negatiu i encavalca la darrera fila de la
        // graella de col·lecció. Deixem passar el ratolí per la zona buida
        // (els fills interactius reactiven pointerEvents:'auto').
        pointerEvents: 'none',
        ...style,
      }}
    >
      {/* TEXT POSTER GRAN (Fila local 27 / 33 - correspon a global 227 / 233) */}
      <div
        data-poster-text="1"
        data-poster-block="1"
        style={{
          gridColumn: '1 / 5',
          // El bloc del poster ocupa MES files que abans (25/31): el text es
          // fix (60pt) i amb 6 files no hi cap, i se n'anava cap amunt fins a
          // tapar el titol del rail (46 px a 768).
          gridRow: '22 / 34',
          // Ancorat a DALT: el text es fix (60pt, unes 9 files) i amb el
          // centrat vertical se n'anava cap amunt, fins a tapar el titol del
          // rail. Amb `flex-start` nomes pot créixer cap avall.
          paddingTop: '50px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            textAlign: posterTextAlign,
            fontFamily: 'Oswald, sans-serif',
            fontSize: '60pt',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#111827',
            transform: `translateX(${posterTextOffsetX})`,
          }}
        >
          {posterLines.map((line, idx) => (
            <div key={idx} style={line.marginTop ? { marginTop: line.marginTop } : undefined}>
              {line.text}
            </div>
          ))}
        </div>
      </div>

      {/* També et pot interessar Rail (Fila local 43 / 60 - correspon a global 243 / 260) */}
      <div
        style={{
          gridColumn: '1 / 5',
          gridRow: '37 / 54',
          alignSelf: 'start',
          // El rail ha d'ocupar l'amplada del bloc perque el titol pugui
          // alinear-se amb la primera targeta i les targetes hi càpiguen.
          width: '100%',
          justifySelf: 'stretch',
          marginTop: '180px',
          pointerEvents: 'auto',
        }}
      >
        <TambeRail
          // El rail ha de començar per la PRIMERA targeta. El valor per defecte
          // del component es 3 (el carrousel te clones al davant i arrencava
          // desplaçat tres targetes), i a les fulles de colleccio aixo feia que
          // el rail sortis desviat a l'esquerra i es talles a la dreta.
          initialIndex={0}
          // No es un carrousel: es un bloc estatic amb totes les targetes i el
          // titol, centrat al viewport.
          estatic
          cardHref={tambeHref}
          title="ALTRES HISTÒRIES"
          images={tambeImages}
          showInternalArrows={false}
          // El titol forma part del MATEIX bloc que les targetes: el pinta el
          // rail, perque dins la graella els dos no es poden posicionar per
          // separat sense trepitjar-se.
          showTitle
          visibleCards={visibleCards}
        />
      </div>
    </div>
  );
});

export default TramFinal;
