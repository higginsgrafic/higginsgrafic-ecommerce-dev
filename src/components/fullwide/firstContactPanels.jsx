import { ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImg from './OptimizedImg.jsx';
import { estilCaixaBloc, ALCADA_PASTILLA_SELECTOR_PX } from './estilsBlocs.js';
import useDeviceLayout from '@/hooks/useDeviceLayout';
import { composicioMegaslide, esComposicioEstretaMegaslide } from '../megaslide/geometriaMegaslide.js';
import { tshirtSrc } from '@/utils/placeholders';

/**
 * firstContactPanels
 * -----------------------------------------------------------------------------
 * Components UI auxiliars per a la primera pàgina del mega-slide (col·leccions
 * "first_contact", "the_human_inside", "austen", "cube", etc.).
 *
 * Inclou:
 *  - FirstContactStripeMockupPanel: previsualització del dibuix sobre samarreta.
 *    Actualment no es crida des del header però es manté per disponibilitat
 *    futura (assets ja resolts en línia).
 *  - FirstContactDibuix00Buttons: botonera Blanc/Negre/Color (selector de
 *    variant cromàtica). És el "tile BN".
 *  - FirstContactDibuix09Buttons: botonera de fletxes (anterior/següent).
 *    És el "tile ARROWS".
 */

export function FirstContactStripeMockupPanel({
  megaTileSize,
  selectedItem,
  variant,
  resolveSrc,
}) {
  if (!megaTileSize) return null;
  if (!selectedItem) return null;
  if (!resolveSrc) return null;

  const inkSrc = resolveSrc(selectedItem);
  if (!inkSrc) return null;

  const shirtSrc =
    variant === 'white'
      ? tshirtSrc('black')
      : tshirtSrc('white');

  const overlayClass =
    selectedItem === 'The Phoenix'
      ? 'scale-[0.43]'
      : selectedItem === 'NX-01'
        ? 'scale-[0.26]'
        : selectedItem === 'NCC-1701'
          ? 'scale-[0.41]'
          : selectedItem === 'NCC-1701-D'
            ? 'scale-[0.54]'
            : selectedItem === 'Wormhole'
              ? 'scale-[0.30]'
              : selectedItem === 'Plasma Escape'
                ? 'scale-[0.30]'
                : selectedItem === "Vulcan's End"
                  ? 'scale-[0.36]'
                  : 'scale-[0.34]';

  return (
    <div
      className="absolute top-0 z-[20]"
      style={{
        width: `${Math.round(megaTileSize * (4 / 3))}px`,
        height: `${megaTileSize}px`,
        right: 0,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md bg-muted">
        <div className="relative h-full w-full">
          <OptimizedImg src={shirtSrc} alt="" className="absolute inset-0 h-full w-full object-contain" />
          <OptimizedImg
            src={inkSrc}
            alt=""
            className={`absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain ${overlayClass}`}
          />
        </div>
      </div>
    </div>
  );
}

export function FirstContactDibuix00Buttons({
  onWhite,
  onBlack,
  onMulti,
  showWhite = true,
  showBlack = true,
  showMulti = true,
  selectedVariant,
  sliderInset = 5,
  // EL COIXI DE COSTAT I L'ALCADA DE LA PASTILLA NOME S A LA COMPOSICIO ESTRETA
  // (02/10/2026). L'amo: «Al selector b/c/n, també. 10 px per banda», «Que sigui
  // la mateixa mida que la pastilla de la tira de col·leccions» i, tot seguit,
  // «Tot això que hem fet no ha d'afectar les vistes 1920 i 1440». O sigui: a
  // 1024-1366 el coixi es de 10 px i la pastilla fa l'alcada declarada; a la
  // resta de mides tot queda com era (coixi de 5 i alcada de la cella menys 2 x
  // 5). Es decideix amb `esComposicioEstretaMegaslide`, la mateixa bandera que fa
  // servir la franja de colleccions.
  sliderSideInset = null,
  // Amplada i alcada manades (vegeu l'estil del contenidor).
  ampladaPx = null,
  alcadaPx = null,
  compact = false,
  // LA FORMA ES D'EN QUI EL POSA, I LES DUES PAGINES NO LA VOLEN IGUAL
  // (26/09/2026, ho ha dit l'amo: «És el mateix selector? Han de ser diferents
  // perquè un serà quadrat i l'altre rectangular»).
  //
  // El bloc es compartit, i el commit `97e2bd7` el va fer QUADRAT a tot arreu
  // quan nome's tocava el de la pagina 1: la pagina 2, que es el punt estable,
  // es va quedar amb el selector quadrat i havia de ser rectangle.
  //
  //   - `quadrat` (per defecte): `aspect-square w-full`, l'amplada la mana el
  //     pare i l'alçada es la mateixa. Es el de la PAGINA 1 (109,4x109,4 a
  //     1920x946).
  //   - `rectangle`: `w-1/2 aspect-[1/2]`, la meitat d'amplada i el doble
  //     d'alçada, que es la forma que la pagina 2 tenia abans de `97e2bd7`
  //     (59,5x119 a 1920x946).
  format = 'quadrat',
  // SENSE EL MARGE DE DALT (28/09/2026). El bloc porta `mt-2` (8 px) des de la
  // composicio horitzontal; a la vertical la casella de la taula l'alinea amb la
  // vora de dalt, com la graella, i aquests 8 px el deixaven mes avall que les
  // dues files de dibuixos (mesurat: botons a 139 i graella a 130).
  senseMargeDalt = false,
}) {
  // La banda de la composicio estreta (1024-1366): nome s alla la pastilla va amb
  // 10 px de coixi a cada costat i amb l'alcada declarada. A la resta de mides
  // tot queda com era (vegeu l'estil de la pastilla). EL HOOK VA A DALT DE TOT:
  // aquest component te un retorn anticipat mes avall (`if (!buttons.length)`) i
  // un hook desprès d'un retorn es un hook condicional.
  const { isLandscapeTablet: esApaissada } = useDeviceLayout();
  const composicioEstreta = composicioMegaslide({ isLandscapeTablet: esApaissada });
  const coixiCostat = sliderSideInset ?? (composicioEstreta ? 10 : sliderInset);

  // Els noms dels acabats són els catalans (Blanc/Color/Negre) i es mostren en
  // majúscules; la resta de la botiga també els anomena així.
  // ELS TRES ACABATS SURTEN SEMPRE, I ELS QUE NO TOCA ES MOSTREN DESACTIVATS
  // (25/09/2026, ho va demanar l'amo: «No amaguis l'opció que sobra, només
  // desactiva-la»).
  //
  // Abans, un acabat que la colleccio no te s'esborrava del bloc. Amb la
  // graella de tres caselles fixes aixo ja no movia res, pero el nom hi faltava
  // i l'amo vol veure'l: BLANC, COLOR i NEGRE sempre al mateix lloc, i el que
  // no es pot triar es queda apagat, sense respondre al clic.
  const buttons = [
    { key: 'white', label: 'Blanc', onClick: onWhite, disabled: !showWhite },
    { key: 'color', label: 'Color', onClick: onMulti, disabled: !showMulti },
    { key: 'black', label: 'Negre', onClick: onBlack, disabled: !showBlack },
  ];

  if (!buttons.length) return null;

  // LES TRES CASELLES SURTEN SEMPRE AL MATEIX LLOC (25/09/2026).
  //
  // Aixo era la causa dels 6,7 px que ballaven en clicar CUBE. Quan el pare
  // amaga acabats (`stripeVariantVisibility`, que a CUBE deixa NOMES Color), el
  // bloc es repartia entre els botons que quedaven: amb un de sol, el seu
  // `height: 33,33%` passava a ser el 100% i el boto creixia de 35,84 a 107,54
  // px (mesurat a 1920). El bucle `alignTopRowToPage1` (MegaslidePagina2) llegeix
  // el selector de la pagina 1 per alinear-hi la filera de la pagina 2, i
  // arrossegava TOT el bloc del cercador —selector, filera i barres de color—
  // 6,7 px avall (76,7 -> 83,3 · 78,3 -> 85,0 · 176,9 -> 183,5). Tambe es veia
  // malament: la pastilla marcava BLANC en una colleccio que nome's te Color.
  //
  // El bloc te TRES caselles sempre, tamany `100/3` cadascuna, i cada acabat viu
  // a la SEVA (BLANC a dalt, COLOR al mig, NEGRE a baix). Amagar un acabat
  // n'esborra el boto, no en mou els altres. Aixi el bloc fa sempre la mateixa
  // alcada i el bucle d'alineacio no es mou.
  const ORDRE = ['white', 'color', 'black'];
  const slotPct = 100 / ORDRE.length;
  const getTopPct = (key) => ORDRE.indexOf(key) * slotPct;
  // Si la variant rebuda esta amagada, la pastilla es queda al mig (Color), que
  // es l'acabat que sempre hi es.
  const selectedKey = buttons.some((b) => b.key === selectedVariant) ? selectedVariant : 'color';
  const _selectedIndex = Math.max(0, ORDRE.indexOf(selectedKey));

  // Mode compacte: redueix l'espai entre textos, manté l'últim (Negre) fixat
  const btnH = compact ? 24 : slotPct;

  const sliderTopPct = compact
    ? (() => {
      const last = ORDRE.indexOf('black');
      const lastCenter = last * slotPct + slotPct / 2;
      const lastTop = lastCenter - btnH / 2;
      return lastTop - (last - ORDRE.indexOf(selectedKey)) * btnH;
    })()
    : getTopPct(selectedKey);
  const sliderHeightPct = btnH;

  return (
    <div
      // LA FORMA, PER PARAMETRE (26/09/2026).
      //
      // El 24/09 es va fer la meitat d'amplada i el doble d'alçada
      // (`w-1/2` + `aspect-[1/2]`); el 26/09 (`97e2bd7`) l'amo va demanar de
      // tornar-lo quadrat, pero allo era per a la PAGINA 1 i el bloc es
      // compartit: la pagina 2 s'hi va quedar. Ara la forma la tria qui el posa
      // (`format`), i per defecte es el quadrat de la pagina 1.
      //
      // Va alineat a l'ESQUERRA a posta (sense `mx-auto`): a la pagina 2 el
      // selector arrenca on arrenca el logo del header, i aixo no ha de canviar.
      className={`relative ${senseMargeDalt ? '' : 'mt-2'} ${ampladaPx != null ? '' : (format === 'rectangle' ? 'aspect-[1/2] w-1/2' : 'aspect-square w-full')}`}
      data-stripe-buttonbar="bn"
      data-stripe-buttonbar-format={format}
      style={{
        // L'AMPLADA MANADA (02/10/2026): la pagina 2 la fa servir perque la
        // pastilla del B/C/N acabi on acaba la de la franja de colleccions. Amb
        // `ampladaPx` s'anul·la la forma (`w-1/2` + `aspect`), que lligava
        // amplada i alcada, i l'alçada arriba per `alcadaPx`.
        ...(ampladaPx != null
          ? {
            width: typeof ampladaPx === 'number' ? `${ampladaPx}px` : ampladaPx,
            flex: '0 0 auto',
            ...(alcadaPx != null ? { height: typeof alcadaPx === 'number' ? `${alcadaPx}px` : alcadaPx } : null),
          }
          : null),
        // LE REQUADRE DE FONS ORIGINAL (24/09/2026). El selector va néixer amb
        // fons gris i contorn, i el commit `3f68cf2` (7/09) els va treure
        // («treu fons gris, contorn selector»): va quedar el slider blanc sol,
        // que sobre fons blanc no es veu. L'amo els ha demanat de tornada, amb
        // les proporcions noves (la meitat d'amplada, el doble d'alçada).
        //
        // DES DEL 28/09/2026 la caixa es compartida i porta ombra
        // (`ESTIL_CAIXA_BLOC_SELECTOR`): el bloc de fletxes de la pagina 2 fa
        // servir la mateixa.
        ...estilCaixaBloc(composicioEstreta),
        // LA VORA NO HA DE MENJAR MIDA A LA PASTILLA (02/10/2026). L'amo: «No
        // m'he explicat bé. Reverteix els dos canvis de mida de la pastilla
        // b/c/n». Quan el contorn va tornar a les mides de sempre, la pastilla
        // va encongir-se 2 px d'amplada i 0,67 px d'alçada (a 1920 passava de
        // 49,5 x 29,66 a 47,5 x 28,98): la pastilla es absoluta i els seus
        // percentatges es resolen contra el PADDING BOX de la caixa, que amb
        // `box-sizing: border-box` fa 2 px menys d'ample i 2 px menys d'alt si
        // la caixa porta vora. La vora pintada —una ombra interior d'1 px— ocupa
        // exactament els mateixos píxels que la vora de debò (ni la caixa ni el
        // contorn es mouen ni un px), pero no en menja cap: la pastilla torna a
        // fer la mida que feia sense contorn.
        ...(composicioEstreta ? null : {
          border: 'none',
          boxShadow: 'inset 0 0 0 1px hsl(var(--grey-line-strong)), 0 1px 3px rgba(0,0,0,0.12)',
        }),
        // LA PASTILLA ES QUI REP ELS CLICS (24/09/2026): el contenidor del
        // selector (a MegaSlidePagina2) fa el DOBLE d'ample que la pastilla, i
        // la meitat que sobra trepitja les primeres caselles del carrusel. El
        // contenidor hi va amb `pointerEvents: none` i els clics els recupera
        // aquesta pastilla.
        pointerEvents: 'auto',
      }}
    >
      {buttons.map((btn) => {
        const topPct = getTopPct(btn.key);
        const desactivat = !!btn.disabled;
        return (
          <button
            key={btn.key}
            type="button"
            aria-label={btn.label}
            // Un acabat desactivat no respon al clic: la pastilla no s'hi mou i
            // el dibuix de la franja no canvia d'acabat.
            onClick={desactivat ? undefined : btn.onClick}
            disabled={desactivat}
            aria-disabled={desactivat ? 'true' : undefined}
            className="absolute left-0 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              top: `${topPct}%`,
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
                // EL CRITERI TIPOGRAFIC DE LA COLUMNA DE COLLECCIONS
                // (28/09/2026, ho ha demanat l'amo): 12 px, i el nom triat en
                // regular (400) i la resta en Extra Light (200).
                fontSize: '12px',
                fontWeight: selectedKey === btn.key ? 400 : 200,
                textTransform: 'uppercase',
                // El desactivat s'apaga (seguint la convencio de la casa: el
                // gris fluix i el cursor de prohibida), pero el nom s'hi veu.
                // LA PARAULA COLOR, TAMBE EN NEGRE (28/09/2026, ho ha demanat
                // l'amo): es l'acabat de colors i es sempre fosca, triat o no.
                color: desactivat ? 'hsl(var(--grey-muted))' : ((selectedKey === btn.key || btn.key === 'color') ? 'hsl(var(--grey-ink-strong))' : 'hsl(var(--grey-ink-soft))'),
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
          // A LA COMPOSICIO ESTRETA LA PASTILLA ARRENCA A LA VORA DEL CARRIL
          // (02/10/2026, correccio de l'amo: «t'he dit que alineessis al final de
          // la pastilla de la tira de col·leccions en la posicio First Contact,
          // pero hauria d'haver dit al principi de la pill»). Com que la caixa fa
          // l'amplada d'aquella casa mes el coixi de la dreta, la pastilla queda
          // EXACTAMENT com la de la franja: la mateixa amplada i les dues vores
          // (l'esquerra a la vora del carril i la dreta al coixi de la caixa).
          left: `${composicioEstreta ? 0 : coixiCostat}px`,
          right: `${coixiCostat}px`,
          // A la composicio estreta la pastilla fa la MATEIXA MIDA que la de la
          // franja de colleccions (alcada declarada, centrada dins la cella); a
          // la resta de mides, com sempre: la cella menys 2 x inset.
          top: composicioEstreta
            ? `calc(${sliderTopPct}% + ${sliderHeightPct / 2}% - ${ALCADA_PASTILLA_SELECTOR_PX / 2}px)`
            : `calc(${sliderTopPct}% + ${sliderInset}px)`,
          height: composicioEstreta
            ? `${ALCADA_PASTILLA_SELECTOR_PX}px`
            : `calc(${sliderHeightPct}% - ${sliderInset * 2}px)`,
          backgroundColor: 'hsl(var(--grey-paper))',
          borderRadius: '3px',
          // SENSE CONTORN nome s A LA COMPOSICIO ESTRETA (02/10/2026, «Treu-los el
          // contorn, també» + «Recupera el contorn a les versions 1920/1440»). A
          // un bloc absolut la vora no mou res, o sigui que treure-la o posar-la
          // no canvia cap mida.
          border: composicioEstreta ? 'none' : '1px solid hsl(var(--grey-line-strong))',
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

export function FirstContactDibuix09Buttons({
  onPrev,
  onNext,
  _tileSize,
  // UNA FLETXA A DALT I L'ALTRA A BAIX (24/09/2026, ho va demanar l'amo).
  //
  // Amb `vertical` la botonera deixa de ser quadrada i fa la MATEIXA forma que
  // el selector Blanc/Color/Negre (`aspect-[1/2]`: meitat d'amplada i el doble
  // d'alçada). Dins seu, el selector te TRES cel·les (BLANC / COLOR / NEGRE) i
  // el bloc de fletxes tambe: la primera i l'ultima porten les fletxes, i la
  // del mig fa 0 px, o sigui que els dos botons son contigus i el bloc queda
  // sencer clicable.
  //
  // Els chevrons van al CENTRE DE LA SEVA MEITAT: a la vista vertical, el de
  // dalt a 1/4 del bloc i el de baix a 3/4 (vegeu el JSX). Abans anaven a 1/3 i
  // 2/3, que era el centre de la primera i de l'ultima cel·la d'un selector de
  // TRES caselles: amb dues meitats, allo els deixava 9,9 px desviats cap al mig
  // i l'amo els veia descol·locats (26/09/2026).
  //
  // Els chevrons segueixen apuntant a esquerra i dreta: el carrusel es mou en
  // horitzontal, el que canvia es on son els botons.
  vertical = false,
  // L'ALCADA DECLARADA, SI HI ES (05/10/2026): quan arriba, mana sobre
  // l'`aspect-[1/2]` de la variant vertical. La fa servir la p2 als portatils,
  // on el selector fa DUES files i no el rectangle de sempre.
  alcadaPx = null,
  onPrevPointerDown,
  onPrevPointerUp,
  onNextPointerDown,
  onNextPointerUp,
}) {
  const hasPrevPointerHandlers = typeof onPrevPointerDown === 'function' || typeof onPrevPointerUp === 'function';
  const hasNextPointerHandlers = typeof onNextPointerDown === 'function' || typeof onNextPointerUp === 'function';

  return (
    // Amb `vertical` la caixa fa la MATEIXA forma que el selector
    // (`aspect-[1/2]`: meitat d'amplada i el doble d'alçada) i les dues fletxes
    // s'apilen dins seu, una a dalt i l'altra a baix.
    // Sense `mt-2` a la variant vertical: a la horitzontal aquell marge es el
    // que separa el bloc del seu contenidor, pero aqui el bloc ha de caure
    // exactament on el posa el seu embolcall (que es qui s'alinea amb el
    // selector). Amb el marge, el bloc visible quedava 8 px mes avall.
    // LA BOTONERA VERTICAL TE DUES FLETXES I L'ALCADA DEL SELECTOR (24/09/2026,
    // ho va demanar l'amo): dues meitats, una fletxa a dalt i l'altra a baix,
    // amb la MATEIXA alcada que el selector B/C/N.
    //
    // I LES DUES FLETXES, JUNTES AL CENTRE («sembla que no es parlin», va dir):
    // van a les vores de la casella del mig del selector, o sigui a 1/3 i a 2/3
    // del bloc, que es el mateix que dir a 21,6 px del centre. Per aixo el
    // dibuix de la fletxa viu a l'embolcall (el bloc) i no dins del boto: dins
    // del boto, el 1/3 i el 2/3 serien els de la meitat, i quedaven a 86 px.
    <div
      className={`relative w-full ${vertical ? 'aspect-[1/2]' : 'mt-2 aspect-square'}`}
      style={alcadaPx != null ? { height: alcadaPx } : undefined}
    >
      {/* SENSE FONS (26/09/2026, ho va demanar l'amo): el bloc portava un
          `bg-muted` (rgb(249,250,251) a 1920) que ara desapareix. L'ancora
          `#stripe-guide-right-anchor` es queda (els guions la fan servir) pero
          sense pintar-hi res. */}
      <div className="absolute inset-0 overflow-hidden" id="stripe-guide-right-anchor">
        <button
          type="button"
          aria-label="Anterior"
          onClick={hasPrevPointerHandlers ? undefined : onPrev}
          onPointerDown={onPrevPointerDown}
          onPointerUp={onPrevPointerUp}
          onPointerCancel={onPrevPointerUp}
          onPointerLeave={onPrevPointerUp}
          className={`absolute bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            vertical ? 'left-0 top-0 h-1/2 w-full' : 'left-0 top-0 h-full w-1/2'
          }`}
        >
        </button>
        <button
          type="button"
          aria-label="Següent"
          id="stripe-guide-right-arrow"
          onClick={hasNextPointerHandlers ? undefined : onNext}
          onPointerDown={onNextPointerDown}
          onPointerUp={onNextPointerUp}
          onPointerCancel={onNextPointerUp}
          onPointerLeave={onNextPointerUp}
          className={`absolute bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            vertical ? 'bottom-0 left-0 h-1/2 w-full' : 'right-0 top-0 h-full w-1/2'
          }`}
        >
        </button>
        {/* ELS CHEVRONS, AL CENTRE DE LA SEVA MEITAT (26/09/2026, ho va
            demanar l'amo: «l'amo els veu descol·locats»). Eren a 1/3 i 2/3 del
            bloc, i a la vista vertical cada boto es mitja alcada: amb el bloc de
            119 px, el bloc de dalt va de 0 a 59,5 i el seu centre es a 29,75
            (25 %), i el de baix a 89,25 (75 %). Mesurat abans: 145,1 i 184,8
            contra els centres de les meitats (135,2 i 194,7), o sigui 9,9 px
            desviats cap al mig. Amb 1/4 i 3/4 la desviacio es 0. */}
        {/* ELS CHEVRONS, AL CENTRE DE LA SEVA MEITAT, TAMBE EN HORITZONTAL
            (05/10/2026). Amb `vertical` les meitats son la de dalt i la de baix
            (1/4 i 3/4 de l'alcada); sense, la de l'esquerra i la de la dreta
            (1/4 i 3/4 de l'amplada). Abans, en horitzontal, tots dos queien a
            `left-1/2` i es trepitjaven al centre: la botonera ensenyava una sola
            fletxa. */}
        <ChevronLeft
          className={`pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80 ${vertical ? 'left-1/2 top-1/4' : 'left-1/4 top-1/2'}`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <ChevronRight
          className={`pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-foreground/80 ${vertical ? 'left-1/2 top-3/4' : 'left-3/4 top-1/2'}`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
