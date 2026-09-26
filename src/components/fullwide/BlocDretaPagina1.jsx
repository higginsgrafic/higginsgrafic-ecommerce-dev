import { carrilPx } from '../../utils/layoutMetrics.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * EL BLOC DE LA DRETA DE LA PAGINA 1 (26/09/2026)
 * -----------------------------------------------------------------------------
 * L'amo ho ha demanat aixi: «Passa el selector a la franja inferior i alinea'l
 * a la dreta del carril», «alinea les fletxes (...) a la dreta del carril» i
 * «allarga la graella fins a les fletxes (amb el seu corresponent gap, 10px)».
 *
 * Es una peca NOVA i d'us nome's de la pagina 1: la pagina 2 te el seu selector
 * (rectangle) i les seves fletxes a la vora ESQUERRA, i alla no s'hi ha de
 * tocar res. Aqui:
 *
 *   [ selector ]   <- quadrat, el primer
 *   [ fletxes  ]   <- quadrat, a sota, amb les dues fletxes apilades
 *
 * Les dues peces fan la mateixa amplada i, per tant, la vora DRETA del bloc es
 * la del carril (x1524 a 1920x946): la graella de dibuixos hi acaba amb el gap
 * de 10 px entremig.
 *
 * PER QUE UNA PECA NOVA I NO `FirstContactDibuix00Buttons`
 *
 * El bloc de BLANC/COLOR/NEGRE de la casa es compartit i la pagina 2 el vol
 * rectangle (mitja amplada i doble alcada). Aqui ha de ser QUADRAT, i en comptes
 * d'afegir-hi una variant mes, la peca es nova i quadrada: aixi el de la pagina
 * 2 no es pot desquadrar per culpa d'aquesta.
 */

/** La mida de disseny del bloc (a 1920 en fa 109,4 px): el selector i les
 *  fletxes fan el mateix, i es el que deixa la vora dreta del bloc a la del
 *  carril (`GRAELLA_DRETA_BLOC_PAGINA1_CARRIL_PX` a geometriaMegaslide.js). */
export const MIDA_BLOC_DRETA_PAGINA1_PX = 110;

/**
 * El selector quadrat de la pagina 1 (BLANC / COLOR / NEGRE).
 *
 * Es el mateix disseny que el de la casa (tres caselles iguals, la pastilla
 * blanca a la que mana, els acabats que no toquen apagats i el nom sempre
 * visible), pero QUADRAT: `aspect-square w-full`. El pare li mana l'amplada.
 */
export function SelectorQuadratPagina1({
  onWhite,
  onBlack,
  onMulti,
  showWhite = true,
  showBlack = true,
  showMulti = true,
  selectedVariant,
  sliderInset = 3,
}) {
  const buttons = [
    { key: 'white', label: 'Blanc', onClick: onWhite, disabled: !showWhite },
    { key: 'color', label: 'Color', onClick: onMulti, disabled: !showMulti },
    { key: 'black', label: 'Negre', onClick: onBlack, disabled: !showBlack },
  ];
  const ORDRE = ['white', 'color', 'black'];
  const slotPct = 100 / ORDRE.length;
  const selectedKey = buttons.some((b) => b.key === selectedVariant) ? selectedVariant : 'color';
  const getTopPct = (key) => ORDRE.indexOf(key) * slotPct;
  const sliderTopPct = getTopPct(selectedKey);
  const btnH = slotPct;

  return (
    <div
      className="relative aspect-square w-full"
      data-stripe-buttonbar="bn-p1"
      style={{
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        backgroundColor: '#F3F4F6',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      {buttons.map((btn) => {
        const desactivat = !!btn.disabled;
        return (
          <button
            key={btn.key}
            type="button"
            aria-label={btn.label}
            onClick={desactivat ? undefined : btn.onClick}
            disabled={desactivat}
            aria-disabled={desactivat ? 'true' : undefined}
            className="absolute left-0 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              top: `${getTopPct(btn.key)}%`,
              height: `${btnH}%`,
              border: 'none',
              background: 'transparent',
              cursor: desactivat ? 'not-allowed' : 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <span
              className="font-oswald"
              style={{
                fontSize: `max(10px, ${carrilPx(14)})`,
                fontWeight: 400,
                textTransform: 'uppercase',
                color: desactivat ? '#C4C8CE' : (selectedKey === btn.key ? '#1A1A1A' : '#6B7280'),
                pointerEvents: 'none',
                lineHeight: 1,
                transition: 'color 200ms ease',
              }}
            >
              {btn.label}
            </span>
          </button>
        );
      })}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `${sliderInset}px`,
          right: `${sliderInset}px`,
          top: `calc(${sliderTopPct}% + ${sliderInset}px)`,
          height: `calc(${btnH}% - ${sliderInset * 2}px)`,
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          border: '1px solid #D1D5DB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          transition: 'top 200ms cubic-bezier(0.32, 0.72, 0, 1)',
          zIndex: 1,
        }}
      />
    </div>
  );
}

/**
 * El bloc de les fletxes de la pagina 1: QUADRAT, amb una fletxa a dalt i
 * l'altra a baix.
 *
 * A la malla vella cada fletxa era una columna (55x109) i la icona hi quedava
 * petita; aqui el bloc fa el mateix que el selector (quadrat) i les dues
 * fletxes se'l reparteixen a mitges.
 */
export function FletxesQuadratPagina1({ onPrev, onNext }) {
  return (
    <div className="relative aspect-square w-full" data-fletxes-p1="1">
      <div className="absolute inset-0 overflow-hidden rounded-md bg-muted">
        <button
          type="button"
          aria-label="Anterior"
          onClick={onPrev}
          className="absolute left-0 top-0 h-1/2 w-full bg-transparent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft
            className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-label="Següent"
          id="stripe-guide-right-arrow"
          onClick={onNext}
          className="absolute bottom-0 left-0 h-1/2 w-full bg-transparent hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight
            className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
