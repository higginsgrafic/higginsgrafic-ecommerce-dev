/**
 * LES CAIXES DELS BLOCS DEL SELECTOR I DE LES FLETXES (28/09/2026)
 * -----------------------------------------------------------------------------
 * En Marc: «Fes un bloc com el de la columna del selector de la p1, a la p2. Amb
 * l'ombra i tot» i «Al bloc nou de la p1 hi ha d'anar el selector i les
 * fletxes».
 *
 * Es la caixa de sempre del selector —fons gris, vora i cantonades— mes l'ombra
 * que fins ara nome's tenia la pastilla blanca. La fan servir:
 *
 *   - el bloc de la dreta de la pagina 1, que des d'avui es UNA sola caixa amb
 *     el selector a dalt i les fletxes a sota (`ESTIL_CAIXA_BLOC`);
 *   - el bloc del selector de la pagina 2 (Blanc/Color/Negre);
 *   - el bloc de fletxes de la pagina 2, que es a l'altre extrem de la fila de
 *     colors i fa el mateix paper.
 *
 * Viu en un fitxer sense components perque `react-refresh` nome's vol components
 * als fitxers de components (ho demana el lint).
 *
 * DUES VERSIONS, I PER QUE:
 *
 *  - `ESTIL_CAIXA_BLOC`: la caixa amb la vora de debò. Es per als blocs que
 *    tenen la mida escrita (el selector i el bloc de fletxes de la pagina 2):
 *    amb `box-sizing: border-box` la vora no els mou ni un px.
 *  - `ESTIL_CAIXA_BLOC_ALCADA_AUTO`: la mateixa caixa pero amb la vora pintada
 *    com una ombra de 1 px, sense `border`. Es per al bloc de la pagina 1, que
 *    no te alcada escrita: la seva alcada es la dels dos fills (selector +
 *    fletxes) i amb una vora de debò els fills s'encongien 2 px (mesurat: el
 *    bloc passava de 220 a 218, les fletxes de 110 a 108 i la franja de la p1
 *    pujava 2 px). Amb la vora pintada, la caixa es veu igual i la composicio no
 *    es toca.
 */
/**
 * LES DUES CAIXES, AMB LA VORA I EL FONS NOME S FORA DE LA COMPOSICIO ESTRETA
 * -----------------------------------------------------------------------------
 * En Marc va demanar de treure'ls el fons, el contorn i l'ombra («Treu-los el
 * fons als selectors», «Treu-los el contorn, també») i despres va concretar que
 * allo nome s valia a la composicio de 1024-1366: «Recupera el contorn a les
 * versions 1920/1440». O sigui que la caixa te dues cares:
 *
 *   - a 1024-1366: nome s el radi i el retall (ni fons, ni vora, ni ombra);
 *   - a la resta (1920, 1440, ...): la caixa de sempre, amb el fons `paper-soft`,
 *     la vora d'1 px i l'ombra.
 *
 * Es una FUNCIO i no una constant perque la decisio es de qui la pinta, que es
 * qui sap la mida de la finestra.
 */
export function estilCaixaBloc(composicioEstreta = false) {
  return {
    boxSizing: 'border-box',
    borderRadius: '5.3px',
    ...(composicioEstreta ? null : {
      border: '1px solid hsl(var(--grey-line-strong))',
      backgroundColor: 'hsl(var(--grey-paper-soft))',
    }),
    boxShadow: composicioEstreta ? 'none' : '0 1px 3px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  };
}

/**
 * La mateixa caixa, pero amb la vora pintada com una ombra de 1 px i sense
 * `border`: es la del bloc de la pagina 1, que no te alcada escrita (amb una
 * vora de debò els seus fills s'encongien 2 px).
 */
export function estilCaixaBlocAlcadaAuto(composicioEstreta = false) {
  return {
    boxSizing: 'border-box',
    borderRadius: '5.3px',
    ...(composicioEstreta ? null : { backgroundColor: 'hsl(var(--grey-paper-soft))' }),
    boxShadow: composicioEstreta
      ? 'none'
      : '0 0 0 1px hsl(var(--grey-muted)), 0 1px 3px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  };
}

/**
 * L'ALÇADA DE LA PASTILLA DELS SELECTORS (02/10/2026)
 * -----------------------------------------------------------------------------
 * Es la mateixa per a tots: la de la franja de colleccions (que fa tota l'alçada
 * de la franja) i la del selector B/C/N. Ho va demanar l'amo: «Que sigui la
 * mateixa mida que la pastilla de la tira de col·leccions».
 *
 * Surt de la franja: la seva alçada es la caixa blanca (22,59) mes el coixi de
 * dalt i el de baix (2 + 1 px per costat, els que abans eren la vora) = 28,59.
 */
export const ALCADA_PASTILLA_SELECTOR_PX = 28.59;

/**
 * EL COIXI DE COSTAT DE LA PASTILLA DE LA FRANJA DE COLLECCIONS (02/10/2026)
 * -----------------------------------------------------------------------------
 * Els 10 px que l'amo va demanar per banda («Deixa-li, 10 px per banda, com a
 * minim»). Viu aqui perque el selector B/C/N tambe el necessita: la seva
 * pastilla ha d'acabar on acaba la de la franja amb FIRST CONTACT actiu, i per
 * aixo la caixa del selector fa l'amplada d'aquella casa mes aquest coixi.
 */
export const COIX_ENLLAC_COLLECCIONS_PX = 10;
