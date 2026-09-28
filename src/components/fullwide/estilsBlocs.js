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
export const ESTIL_CAIXA_BLOC = {
  boxSizing: 'border-box',
  border: '1px solid #D1D5DB',
  borderRadius: '5.3px',
  backgroundColor: '#F3F4F6',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  overflow: 'hidden',
};

export const ESTIL_CAIXA_BLOC_ALCADA_AUTO = {
  boxSizing: 'border-box',
  borderRadius: '5.3px',
  backgroundColor: '#F3F4F6',
  // La vora, pintada: `0 0 0 1px` fa la ratlla sense ocupar lloc.
  boxShadow: '0 0 0 1px #D1D5DB, 0 1px 3px rgba(0,0,0,0.12)',
  overflow: 'hidden',
};

/**
 * LA PASTILLA BLANCA DEL SELECTOR (28/09/2026).
 *
 * Viu a part perque la pastilla te DOS llocs on es pot pintar: dins del selector
 * (com sempre, a la capa de la caixa) o a la capa de la caixa del bloc de la p1,
 * per sota de l'ombra de la maniga («A la p1, el rectangle blanc del selector ha
 * de passar per sota l'ombra de la maniga»). Amb un sol joc de numeros, les dues
 * versions son exactament la mateixa pastilla.
 */
export const ESTIL_PASTILLA_SELECTOR = {
  backgroundColor: '#FFFFFF',
  borderRadius: '3px',
  border: '1px solid #D1D5DB',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  boxSizing: 'border-box',
  pointerEvents: 'none',
};

/** El coixi de la pastilla dins la seva casella, en px (a 1920). */
export const PASTILLA_INSET_PX = 5;
