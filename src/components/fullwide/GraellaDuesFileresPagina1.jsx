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
// LA MIDA DEL SELECTOR, UNA MICA MENYS PER PODER SEPARAR LES FILES (28/09/2026).
// En Marc: «escalar la graella a la mida del selector» (60, que es l'amplada del
// selector) i, tot seguit, «separa la fila 2 de la fila 1 de la graella, sense
// que es mogui res mes». Les caselles de la graella fan 59,5 d'alcada (dues, 119:
// l'alcada del selector, que no es toca), i amb la peca a 54 queden 5,5 px de
// separacio entre les dues fileres.
export const COSTAT_PECA_PAGINA1_PX = 51.3;

/**
 * LA SEPARACIO VERTICAL ENTRE LES DUES FILERES (28/09/2026). En Marc: «Separa la
 * fila 2 en Y» i «No les pots separar?». Es el `gapV` de la graella: les peces no
 * es centren a la casella, sino que la segona filera cau a `peca + gapV`. Amb la
 * peca a 54 i el gap a 30, la filera 2 arrenca 84 px mes avall.
 */
export const GAP_FILES_PAGINA1_PX = 20;

/**
 * Els px que la primera filera es puja (6 a 1920). En Marc: «Alinea la primera
 * fila amb el top del selector» i, tot seguit, «mes val que la centris amb
 * COLOR»: amb aquest desplacament el CENTRE de la primera filera cau al centre de
 * la casella COLOR del selector.
 */
export const DESPLACAMENT_TOP_FILERA_PX = 16;

/** El gap entre peces, en unitats de disseny (el mateix que la pagina 2). */
// EL MATEIX GAP QUE LA PAGINA 2 (28/09/2026). En Marc, mirant la graella de la
// p1: «la graella dels dibuixos hi estan tots enganxats l'un amb l'altre. Deixa-hi
// el mateix gap que a la p2». Mesurat a 1920: la p2 fa 26,07 px de gap entre
// peces (44,63 de peca); la p1 en feia 0.
export const GAP_PECA_PAGINA1_PX = 54;

/**
 * @param {object} o
 * @param {Array<{label:string, collection:string, subcollection:string|null, stripeItem:(string|undefined)}>} o.items
 *   els mateixos dibuixos que fa servir la pagina 2 (`dibuixosGraella16x4()`).
 * @param {string} o.activeCollection la colleccio activa (les altres s'atenuen).
 * @param {string|null} [o.activeSubcollection] la subcolleccio activa dins la
 *   colleccio (nome's AUSTEN en te). Es el que fa que, en clicar un dibuix
 *   d'AUSTEN, nome's s'encengui la seva subcolleccio i no totes quatre alhora
 *   (28/09/2026, ho va veure l'amo: «Quan cliques un dibuix d'Austen, activa
 *   totes les col·leccions d'Austen»).
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
  activeSubcollection = null,
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
    <div
      data-graella-files-p1="1"
      style={{
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        // FORA LA RATLLA DE L'ESQUERRA (28/09/2026). En Marc: «Treu la línia de
        // davant de la graella a la p1». Era la vora esquerra del contenidor
        // (1 px, `hsl(var(--grey-muted))`), posada el mateix dia amb «A la part esquerra de la
        // graella, hi pots posar una línia?».
        //
        // EL COIXI DE 10 px S'HI QUEDA, i es el que fa que NOMES marxi la ratlla:
        // la caixa (vora inclosa) ancorra el clic de la p1 i el bucle
        // d'alineacio de la p2, i el centratge de les files es fa MOVENT LES
        // PECES. Sense la vora, el contingut guanya 1 px d'amplada i el
        // carrusel arrenca 1 px mes a l'esquerra (392 -> 391): les dues fileres
        // i el seu centre (147,0) es queden clavats a la casella COLOR. Traient
        // tambe el coixi, tot el dibuix marxaria 10 px mes i el centre cauria
        // 1 px fora de la casella.
        paddingLeft: '10px',
        // LA PRIMERA FILERA, AL TOP DEL SELECTOR (28/09/2026). En Marc: «mou-les
        // juntes cap amunt. Alinea la primera fila amb el top del selector». Les
        // peces del carrusel van absolutes i la primera filera cau
        // `desnivellsLinies.primera` per sota del top de la caixa: amb aquest
        // desplacament, el seu top coincideix amb el del selector (mesurat: 28 px
        // a 1920) i les dues fileres pugen juntes.
      }}
    >
      <CercadorDibuixosGraella
        items={items}
        dibuixPx={dibuixPx}
        gapH={GAP_PECA_PAGINA1_PX * escalaNumerica}
        gapV={GAP_FILES_PAGINA1_PX * escalaNumerica}
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
        activeSubcollection={activeSubcollection}
        // LA P1 NO ATENUA LES ALTRES COLLECCIONS (28/09/2026, «Treu el vel de la
        // p1»): a la p2 es queden al 0,12.
        senseAtenuacio
        onSelectGroup={onSelectGroup}
        onHoverItem={onHoverItem}
        onHoverLeave={onHoverLeave}
        onCarouselStep={onCarouselStep}
      />
    </div>
  );
}
