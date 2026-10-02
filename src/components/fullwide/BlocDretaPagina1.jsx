import { carrilPx } from '../../utils/layoutMetrics.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ALCADA_PASTILLA_SELECTOR_PX } from './estilsBlocs.js';
import useDeviceLayout from '@/hooks/useDeviceLayout';
import { composicioMegaslide, esComposicioEstretaMegaslide } from '../megaslide/geometriaMegaslide.js';

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
 * LA PASTILLA BLANCA DEL SELECTOR DE LA P1, A PART (28/09/2026)
 * -----------------------------------------------------------------------------
 * En Marc: «A la p2, la pastilla blanca passa per sota de l'ombra, no nome's de
 * la samarreta. A la p1 has aconseguit posar la pastilla per sota de la
 * samarreta, pero no per sota de l'ombra» i «Et puc suggerir que imitis el que
 * has fet a la p2?».
 *
 * LA CAUSA ES L'ORDRE DE PINTAT, NO LA GEOMETRIA. A la p2 la caixa blanca de la
 * colleccio activa es un element `position: static`: el seu fons es pinta a la
 * fase 3 de l'ordre de pintat, ABANS que l'ombra de la maniga (que es
 * `position: absolute` amb `z-index: 0`, fase 6), i per aixo l'ombra hi cau a
 * sobre. A la p1 la pastilla vivia dins del selector, que va a la capa dels
 * BOTONS (`zIndex: 6`, la que cal perque la franja no se'ls mengi els clics):
 * la pastilla tapava l'ombra.
 *
 * PER AIXO LA PASTILLA SE SURT DEL SELECTOR. Amb aquesta peca a part es pot
 * muntar a la CAPA DE LA CAIXA (`zIndex: 0`) i ABANS de l'ombra al DOM: dins
 * d'una mateixa capa, amb els dos elements posicionats i sense `z-index` propi,
 * guanya el que va MES TARD, o sigui que l'ombra queda per damunt de la
 * pastilla, exactament com a la p2. Els BOTONS es queden a la capa de dalt: els
 * clics i el text no es toquen.
 *
 * Es la MATEIXA pastilla que la del selector (un sol joc de numeros, aqui): el
 * component nome's la pinta, amb el seu coixi i la seva transicio (llisca entre
 * BLANC/COLOR/NEGRE). El lloc on viu el decideix el pare:
 *
 *   - dins del selector, que es el cami de sempre;
 *   - dins d'un embolcall que ocupi el REQUADRE DEL SELECTOR, si ha de quedar
 *     per sota de l'ombra (el bloc de la dreta de la p1).
 *
 * IMPORTANT: la pastilla NO porta `z-index`. Amb un `z-index` propi guanyaria a
 * l'ombra (que va a `0`) i tornariem a tenir el problema de sempre. Sense, qui
 * mana es l'ordre del DOM.
 */
export function PastillaBlancaPagina1({ topPct, alcadaPct = 100 / 3, inset = 5 }) {
  // NOME S A LA COMPOSICIO ESTRETA (02/10/2026): alla la pastilla va amb 10 px de
  // coixi a cada costat i amb l'alcada declarada; a 1920/1440 tot queda com era
  // («Tot això que hem fet no ha d'afectar les vistes 1920 i 1440»).
  const { isLandscapeTablet } = useDeviceLayout();
  const composicioEstreta = composicioMegaslide({ isLandscapeTablet: isLandscapeTablet });
  // LA PASTILLA, D'AMPLADA DE TOTA LA SEVA COLUMNA A LA COMPOSICIO ESTRETA
  // (02/10/2026). En Marc: «Que la pastilla del selector ocupi el seu mig quadrat
  // d'amplada»: alla el selector i les fletxes van en dues columnes i la pastilla
  // ha d'omplir la seva, sense el coixi de costat. A la resta de mides, com era.
  const coixiCostat = composicioEstreta ? 0 : inset;
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `${coixiCostat}px`,
        right: `${coixiCostat}px`,
        // A la composicio estreta, la mateixa alcada que la pastilla de la franja
        // de colleccions (centrada dins la cella); a la resta, com sempre.
        top: composicioEstreta
          ? `calc(${topPct}% + ${alcadaPct / 2}% - ${ALCADA_PASTILLA_SELECTOR_PX / 2}px)`
          : `calc(${topPct}% + ${inset}px)`,
        height: composicioEstreta
          ? `${ALCADA_PASTILLA_SELECTOR_PX}px`
          : `calc(${alcadaPct}% - ${inset * 2}px)`,
        backgroundColor: 'hsl(var(--grey-paper))',
        borderRadius: '3px',
        // SENSE CONTORN nome s A LA COMPOSICIO ESTRETA (02/10/2026).
        border: composicioEstreta ? 'none' : '1px solid hsl(var(--grey-line-strong))',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        transition: 'top 200ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    />
  );
}

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
  sliderInset = 5,
  // LA PASTILLA, EN UN ALTRE LLOC (28/09/2026). A la p1 la pastilla ha d'anar
  // per SOTA de l'ombra de la maniga i els botons per DAMUNT (si no, la franja
  // se'ls menja els clics): son DUES CAPES, i per aixo la pastilla es pot pintar
  // des de fora. Amb `mostraPastilla` falsa, aqui nome's queden els botons i el
  // text; la pastilla la munta el bloc, a la capa de la caixa.
  mostraPastilla = true,
  // LA CAIXA LA PORTA EL BLOC (28/09/2026): amb `dinsBloc` el selector nome's
  // pinta les seves tres caselles i la pastilla, i el fons, la vora i les
  // cantonades els posa el bloc sencer (selector + fletxes).
  dinsBloc = false,
  // LA FORMA (28/09/2026): `rectangle` es la meitat d'amplada i el doble
  // d'alçada, que es la forma del selector de la pagina 2. En Marc: «amb el
  // selector (també de la mateixa mida que el p2)».
  format = 'square',
  // OMPLE EL SEU QUADRAT (28/09/2026): amb `omple` la peca no imposa el seu
  // aspecte, sino que fa el 100% del que li dona el pare (dues botoneres
  // quadrades apilades dins del bloc).
  omple = false,
}) {
  const buttons = [
    { key: 'white', label: 'Blanc', onClick: onWhite, disabled: !showWhite },
    { key: 'color', label: 'Color', onClick: onMulti, disabled: !showMulti },
    { key: 'black', label: 'Negre', onClick: onBlack, disabled: !showBlack },
  ];
  const ORDRE = ['white', 'color', 'black'];
  const slotPct = 100 / ORDRE.length;
  // Vegeu `PastillaBlancaPagina1`: la composicio estreta nome s mana a 1024-1366.
  const { isLandscapeTablet: esApaissadaP1 } = useDeviceLayout();
  const esComposicioEstreta = composicioMegaslide({ isLandscapeTablet: esApaissadaP1 });
  const selectedKey = buttons.some((b) => b.key === selectedVariant) ? selectedVariant : 'color';
  const getTopPct = (key) => ORDRE.indexOf(key) * slotPct;
  const sliderTopPct = getTopPct(selectedKey);
  const btnH = slotPct;

  return (
    <div
      className={`relative ${omple ? 'h-full w-full' : (format === 'rectangle' ? (dinsBloc ? 'aspect-[1/2] w-full' : 'aspect-[1/2] w-1/2') : 'aspect-square w-full')}`}
      data-stripe-buttonbar="bn-p1"
      style={{
        ...(dinsBloc ? null : {
          borderRadius: '5.3px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          // SENSE FONS NI CONTORN NOME S A LA COMPOSICIO ESTRETA (02/10/2026,
          // «Treu-los el fons als selectors» + «Recupera el contorn a les
          // versions 1920/1440»).
          ...(esComposicioEstreta
            ? null
            : {
              border: '1px solid hsl(var(--grey-line-strong))',
              backgroundColor: 'hsl(var(--grey-paper-soft))',
            }),
        }),
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
                fontSize: `max(10px, ${carrilPx(13.5)})`,
                fontWeight: 400,
                textTransform: 'uppercase',
                color: desactivat ? 'hsl(var(--grey-muted))' : (selectedKey === btn.key ? 'hsl(var(--grey-ink-strong))' : 'hsl(var(--grey-ink-soft))'),
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
      {mostraPastilla ? (
        <PastillaBlancaPagina1 topPct={sliderTopPct} alcadaPct={btnH} inset={sliderInset} />
      ) : null}
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
export function FletxesQuadratPagina1({ onPrev, onNext, omple = false }) {
  return (
    <div className={`relative ${omple ? 'h-full w-full' : 'aspect-square w-full'}`} data-fletxes-p1="1">
      {/* SENSE FONS (26/09/2026, ho va demanar l'amo): el bloc portava un
          `bg-muted` i ara desapareix, com al bloc compartit
          (`FirstContactDibuix09Buttons`). */}
      <div className="absolute inset-0 overflow-hidden">
        <button
          type="button"
          aria-label="Anterior"
          onClick={onPrev}
          className="absolute left-0 top-0 h-1/2 w-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="absolute bottom-0 left-0 h-1/2 w-full bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
