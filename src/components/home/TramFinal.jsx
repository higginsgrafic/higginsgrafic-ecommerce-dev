import { forwardRef } from 'react';
import Pauta4ColsOverlay from '@/components/pauta/Pauta4ColsOverlay';
import TambeRail from '@/pages/nikeTambe/TambeRail';
import CarouselArrows from '@/pages/nikeTambe/CarouselArrows';

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
    style,
  },
  pautaGridRef,
) {
  return (
    <div
      ref={pautaGridRef}
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
        style={{
          gridColumn: '1 / 5',
          gridRow: '25 / 31',
          paddingTop: '50px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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

      {/* Subtítol "ALTRES HISTÒRIES" (Fila local 45 / 46 - correspon a global 245 / 246) */}
      <div
        style={{
          gridColumn: '1 / 3',
          gridRow: '39 / 40',
          alignSelf: 'center',
          fontFamily: 'Roboto Condensed, sans-serif',
          fontWeight: 400,
          fontSize: '15pt',
          lineHeight: 1.2,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(71, 80, 89, 0.7)',
          textAlign: 'left',
          pointerEvents: 'auto',
          transform: 'translateY(20px) translateX(2px)', // Baixat 1px (abans 19px) i 2px dreta
        }}
      >
        ALTRES HISTÒRIES
      </div>

      {/* Fletxes També et pot interessar (Fila local 45 / 46 - correspon a global 245 / 246) */}
      <div
        style={{
          gridColumn: '4 / 5',
          gridRow: '39 / 40',
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 0,
          pointerEvents: 'auto',
          transform: 'translateY(20px) translateX(2px)', // Baixat 1px (abans 19px) i 2px dreta
        }}
      >
        <CarouselArrows
          rightPx={0}
          topPx={0}
          onPrev={() => {
            window.dispatchEvent(new CustomEvent('tambe-rail:prev'));
          }}
          onNext={() => {
            window.dispatchEvent(new CustomEvent('tambe-rail:next'));
          }}
          rowHeight={rowHeight - 3}
        />
      </div>

      {/* També et pot interessar Rail (Fila local 43 / 60 - correspon a global 243 / 260) */}
      <div
        style={{
          gridColumn: '1 / 5',
          gridRow: '37 / 54',
          alignSelf: 'start',
          width: '100%',
          marginTop: '-28px', // Baixat 1px (abans -29px)
          pointerEvents: 'auto',
        }}
      >
        <TambeRail
          cardHref={tambeHref}
          title={tambeTitle}
          showInternalArrows={false}
          showTitle={false}
        />
      </div>
    </div>
  );
});

export default TramFinal;
