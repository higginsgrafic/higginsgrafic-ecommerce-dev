import { CercadorDibuixosGraella } from './CercadorTextRow.jsx';

/**
 * LA GRAELLA DE DUES FILERES DE LA PAGINA 1 (26/09/2026)
 * -----------------------------------------------------------------------------
 * L'amo ho ha dit clar: la graella intercalada de la pagina 2 JA ESTA FETA
 * (`CercadorDibuixosGraella`, a `CercadorTextRow.jsx`) i a la pagina 1 nome's
 * s'hi ha de DUPLICAR. Aquesta peca es l'adaptador: li passa les mides de la
 * pagina 1 i li deixa la feina de les dues fileres intercalades, el ziga-zaga,
 * el bucle i el gest.
 *
 * DIFERENCIES AMB LA PAGINA 2 (i per que):
 *
 *   - **La mida de la peca es quasi fixa.** A la pagina 2 es dedueix de
 *     l'amplada del retall (864) i cada peca fa 44,6; aqui el carril fa 1143.
 *     La relacio de la pagina 2 entre la peca i el selector (44,6 amb un
 *     selector de 119) dona 45 unitats de disseny, que es la mida que es fa
 *     servir sempre que hi capi.
 *   - **`reservaDreta` es 0**: les fletxes de la pagina 1 no viuen dins del
 *     retall, son al bloc de la dreta (vegeu `BlocDretaPagina1.jsx`).
 *   - **`midaSelector`** es el del bloc de la dreta, perque les fletxes del
 *     carrusel (que aqui no es veuen, les porta el bloc) hi quadrin.
 */

/** El costat de la peca, en unitats de disseny del carril (45 = 44,6 px a
 *  1920x946, el mateix que les peces de la pagina 2). */
export const COSTAT_PECA_PAGINA1_PX = 45;

/** El gap entre peces, en unitats de disseny (el mateix que la pagina 2). */
// EL MATEIX GAP QUE LA PAGINA 2 (28/09/2026). En Marc, mirant la graella de la
// p1: «la graella dels dibuixos hi estan tots enganxats l'un amb l'altre. Deixa-hi
// el mateix gap que a la p2». Mesurat a 1920: la p2 fa 26,07 px de gap entre
// peces (44,63 de peca); la p1 en feia 0.
export const GAP_PECA_PAGINA1_PX = 26;

/**
 * @param {object} o
 * @param {Array<{label:string, collection:string, subcollection:string|null, stripeItem:(string|undefined)}>} o.items
 *   els mateixos dibuixos que fa servir la pagina 2 (`dibuixosGraella16x4()`).
 * @param {string} o.activeCollection la colleccio activa (les altres s'atenuen).
 * @param {(collection:string, subcollection:string|null, stripeItem:string|undefined)=>void} o.onSelectGroup
 * @param {(stripeItem:string)=>void} [o.onHoverItem]
 * @param {()=>void} [o.onHoverLeave]
 * @param {(pas:number)=>void} [o.onCarouselStep] el pas de les fletxes.
 * @param {(fn:(direccio:number)=>void)=>void} [o.onStepper] ON ES PUBLICA la
 *   funcio de pas del carrusel. La pagina 1 te les fletxes al bloc de la dreta
 *   (fora de la graella) i han de fer el MATEIX que les del carrusel: el bloc
 *   crida aquesta funcio i no hi ha cap estat en paral·lel (27/09/2026).
 * @param {number} [o.midaSelector] l'amplada del bloc de la dreta, en unitats.
 * @param {number} [o.escala] l'escala del carril (`--hg-escala-mega`), que el
 *   pare passa perque aqui no es pot llegir el DOM. Les mides de
 *   `CercadorDibuixosGraella` han de ser NUMEROS: la geometria del carrusel
 *   (`pas`, `alcadaFila`, `periode`) es calcula amb ells, i amb una cadena CSS
 *   el carrusel es pinta amb amplada i alcada ZERO.
 */
export default function GraellaDuesFileresPagina1({
  items = [],
  activeCollection,
  onSelectGroup,
  onHoverItem,
  onHoverLeave,
  onCarouselStep,
  onStepper = null,
  midaSelector = 120,
  /** L'alcada de la finestra del carrusel, en px. La mana el bloc de la dreta
   *  (selector + fletxes): la graella ha de fer exactament la seva alcada. */
  alcadaCarruselPx = null,
  escala = 1,
}) {
  // LA PECA, EL MES GRAN POSSIBLE FINS A LA DE LA PAGINA 2 (45 unitats). Amb
  // poques peces (7 a FIRST CONTACT) el carril en dona per a mes, i la de la
  // pagina 2 mana.
  //
  // El numero, i no `carrilPx` (que torna una cadena `calc(...)`): aquest
  // component es qui calcula el pas i l'alcada del carrusel, i allo son
  // operacions matematiques. Amb la cadena, `dibuixPx > 0` era fals i el
  // carrusel naixia amb alcada 0 (mesurat: `carrusel 1025,5x0` i el retall
  // `1025,5x0`).
  const escalaNumerica = Number.isFinite(escala) && escala > 0 ? escala : 1;
  const dibuixPx = COSTAT_PECA_PAGINA1_PX * escalaNumerica;

  return (
    <div data-graella-files-p1="1" style={{ width: '100%', minWidth: 0 }}>
      <CercadorDibuixosGraella
        items={items}
        dibuixPx={dibuixPx}
        gapH={GAP_PECA_PAGINA1_PX * escalaNumerica}
        gapV={0}
        // L'ALCADA DE LA FINESTRA DEL CARRUSEL, EN NUMERO. Els dibuixos van
        // absoluts dins la tira i el contenidor no en treu cap alcada: el
        // calcul (dues files) la dona, pero aqui el que mana es l'alcada del
        // bloc de la dreta (`mida`), que es qui ha de coincidir amb el selector
        // i les fletxes. El pare la passa feta.
        alcadaCarruselPx={alcadaCarruselPx}
        midaSelector={midaSelector}
        reservaDreta={0}
        carrusel
        // LES FLETXES DEL CARRUSEL NO ES VEuen A LA PAGINA 1 (27/09/2026): les
        // que manen son les del bloc de la dreta, que criden `stepperRef`. Amb
        // les dues parelles visibles n'hi havia quatre i nome's dues feien
        // feina (mesurat: les del carrusel a x1349 i les del bloc a x1414).
        senseFletxes
        onStepper={onStepper}
        activeCollection={activeCollection}
        onSelectGroup={onSelectGroup}
        onHoverItem={onHoverItem}
        onHoverLeave={onHoverLeave}
        onCarouselStep={onCarouselStep}
      />
    </div>
  );
}
