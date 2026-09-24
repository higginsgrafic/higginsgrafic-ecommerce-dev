import { getLayoutViewportWidth } from './layoutMetrics';

/**
 * layoutModel — model ÚNIC de les mides de layout del lloc.
 *
 * Per què existeix:
 *   Les mateixes mides estaven calculades a més d'un lloc i amb fórmules
 *   divergents (App.jsx feia `isPortraitTablet ? 116 : ...` i
 *   useRouteLayout.js feia `isLargeScreen ? 80 : 64`), o sigui que la mateixa
 *   finestra podia donar dos valors diferents segons qui preguntés. I com que
 *   aquests números són la base de la capçalera, la hero i els paddings, qualsevol
 *   divergència es veu com un salt de tot el contingut.
 *
 * Com s'ha de fer servir:
 *   - A dins de React: `computeLayoutModel({ offersHeaderHeight, ... })` amb les
 *     banderes de ruta, i publicar amb `publishLayoutModel(model)`.
 *   - A fora de React (mòdul, abans del primer pintat): `publishEarlyLayoutModel()`.
 *   - Mai no s'ha de mesurar el DOM per obtenir aquests números: són funcions
 *     pures de l'amplada i l'alçada de la finestra.
 */

const MIDA_MOVIL = 600;
const MIDA_TAULETA_VERTICAL_MAX = 1024;
const MIDA_TAULETA_APAISADA_MIN = 768;
const MIDA_TAULETA_APAISADA_MAX = 1366;
const ALCADA_TAULETA_APAISADA_MAX = 1100;
const ALCADA_CAPCALERA_ESCRIPTORI = 80;
const ALCADA_CAPCALERA_MOBIL = 80;
/**
 * La capçalera de DUES FILES de la tauleta vertical: 61 px la fila del logo i
 * les icones + 62 px la fila del menu de colleccions.
 *
 * SON 123, NO 116. Amb 116 el layout reservava 7 px menys del que la capçalera
 * ocupa de veritat, i els primers 7 px de la pagina queien sota seu (invisible
 * mentre allo es buit, pero es una trampa: qualsevol cosa que s'hi posi
 * desapareix). El megaslide ja hi penjava dels 123 —el panell arrenca on acaba
 * la capçalera—, aixi que ara la pagina i el panell comencen al mateix lloc.
 *
 * Es la xifra MES DESFAVORABLE de les dues que quadraven els comptes: l'altra
 * era deixar la fila 2 en 55 px perque 61 + 55 fessin 116, i allo li treia 7 px
 * al menu (que ja va just a les mides petites) per no moure la pagina.
 */
const ALCADA_CAPCALERA_TAULETA_VERTICAL = 123;

/**
 * Classificació del dispositiu a partir de les mides de la finestra.
 * NOMES mides: el touch no hi entra, perque la mateixa finestra ha de donar
 * sempre la mateixa maquetacio.
 */
export function deviceLayoutFromViewport(vw, vh) {
  const ample = Number.isFinite(vw) && vw > 0 ? vw : 0;
  const alt = Number.isFinite(vh) && vh > 0 ? vh : 0;

  const isMobile = ample > 0 && ample < MIDA_MOVIL;
  const isPortraitTablet = ample >= MIDA_MOVIL && ample <= MIDA_TAULETA_VERTICAL_MAX && alt > ample;
  const isLandscapeTablet =
    ample >= MIDA_TAULETA_APAISADA_MIN &&
    ample <= MIDA_TAULETA_APAISADA_MAX &&
    alt < ample &&
    alt > 0 &&
    alt <= ALCADA_TAULETA_APAISADA_MAX;
  const isDesktop = !isPortraitTablet && !isLandscapeTablet && ample >= MIDA_TAULETA_VERTICAL_MAX;

  return {
    isMobile,
    isPortraitTablet,
    isLandscapeTablet,
    isDesktop,
    // Compat: hi ha consumidors que fan servir isLargeScreen com a "escriptori".
    isLargeScreen: isDesktop,
    viewportWidth: ample,
    viewportHeight: alt,
  };
}

/**
 * Alçada de la capçalera per tipus de dispositiu.
 *
 * LES DUES RESERVES SON EL QUE LA CAPÇALERA OCUPA DE VERITAT, no una xifra
 * rodona: 123 px a la tauleta vertical (les dues files) i 80 px a tota la
 * resta, perque la capçalera d'una fila fa 80 px a tot arreu (el que canvia
 * entre mobils, tauletes apaisades i escriptori es el contingut, no l'alçada).
 *
 * LA CAPÇALERA DE DUES FILES ES NOMES DE LA TAULETA VERTICAL: el logo i les
 * icones (61 px) i el menu de colleccions a sota (62). L'apaisada la va portar
 * un temps (commit `17291eb`) i s'ha tornat enrere.
 *
 * AQUI HI HAVIA UNA `ESTRETA` DE 64 px que s'enduia la franja de 600 a 767 px
 * d'amplada en apaisat (els telefons girats: Galaxy S9/S9+, S10/S10+, iPhone
 * SE). Estava documentada com «avui no es dona enlloc» i sí que es donava: la
 * capçalera hi fa 81 px i la pagina en reservava 64, o sigui 17 px de contingut
 * sota la capçalera.
 */
export function headerHeightFor(deviceLayout) {
  if (deviceLayout.isPortraitTablet) return ALCADA_CAPCALERA_TAULETA_VERTICAL;
  if (deviceLayout.isLandscapeTablet) return ALCADA_CAPCALERA_ESCRIPTORI;
  if (deviceLayout.isLargeScreen) return ALCADA_CAPCALERA_ESCRIPTORI;
  if (deviceLayout.isMobile) return ALCADA_CAPCALERA_MOBIL;
  // L'unic que queda son les finestres de 600 a 767 px d'amplada i mes amplades
  // que altes (vegeu `deviceLayoutFromViewport`): tambe porten la d'una fila.
  return ALCADA_CAPCALERA_ESCRIPTORI;
}

/**
 * Marc horitzontal del lloc: el mateix càlcul que SiteFrame publica com a
 * `--site-xL/xR/w`. És la font de veritat horitzontal de tot el projecte.
 */
export function siteFrameForViewport({ vw, vh, rulerInset = 0 } = {}) {
  const ample = Number.isFinite(vw) && vw > 0 ? vw : getLayoutViewportWidth();
  if (!Number.isFinite(ample) || ample <= 0) return null;
  const disponible = Math.max(0, ample - rulerInset);
  const ampleMarc = Math.max(0, Math.min(1350, disponible - 16 * 2));
  const xL = Math.round(rulerInset + (disponible - ampleMarc) / 2);
  return { xL, xR: xL + ampleMarc, width: ampleMarc };
}

/**
 * Tots els números de layout d'una tacada.
 *
 * @param {object} opts
 * @param {object} [opts.deviceLayout]  resultat de deviceLayoutFromViewport; si no es passa, es calcula
 * @param {boolean} [opts.teCapcaleraDev] rutes amb la capçalera de desenvolupament
 * @param {number} [opts.alcadaOfertesPx=0]
 * @param {number} [opts.alcadaBannerAdminPx=0]
 * @param {number} [opts.rulerInsetPx=0]
 */
export function computeLayoutModel({
  deviceLayout,
  teCapcaleraDev = false,
  alcadaOfertesPx = 0,
  alcadaBannerAdminPx = 0,
  rulerInsetPx = 0,
} = {}) {
  const layout = deviceLayout || deviceLayoutFromViewport(
    typeof window !== 'undefined' ? window.innerWidth : 0,
    typeof window !== 'undefined' ? window.innerHeight : 0,
  );
  const alcadaCapcalera = headerHeightFor(layout);
  // L'offset de capcalera sempre compta l'alcada base; el que canvia per ruta
  // es qui la publica (capcalera de dev o del lloc), no el número.
  const offsetCapcalera = alcadaCapcalera + alcadaOfertesPx + alcadaBannerAdminPx + rulerInsetPx;
  const offsetGlobal = alcadaOfertesPx + alcadaBannerAdminPx + rulerInsetPx;

  return {
    ...layout,
    headerHeight: alcadaCapcalera,
    appHeaderOffset: `${offsetCapcalera}px`,
    globalHeaderTopOffset: `${offsetGlobal}px`,
    rulerInset: `${rulerInsetPx}px`,
    siteFrame: siteFrameForViewport({
      vw: layout.viewportWidth || (typeof window !== 'undefined' ? window.innerWidth : 0),
      vh: layout.viewportHeight,
      rulerInset: rulerInsetPx,
    }),
  };
}

/** Publica el model a `<html>` com a CSS vars. */
export function publishLayoutModel(model) {
  if (typeof document === 'undefined' || !model) return;
  try {
    const root = document.documentElement;
    root.style.setProperty('--appHeaderOffset', model.appHeaderOffset);
    root.style.setProperty('--globalHeaderTopOffset', model.globalHeaderTopOffset);
    root.style.setProperty('--rulerInset', model.rulerInset);
  } catch {
    // ignore
  }
}

/**
 * NOTA (mesurada): NO s'ha de publicar el model abans que React sàpiga si hi
 * ha ofertes o banners. Es va provar i pitjorava les coses: publicava 116 px
 * (sense ofertes) i el valor bo era 156 px, o sigui que creava un salt de
 * 40 px que abans no hi era. El publica App amb useLayoutEffect, que ja va
 * abans del primer pintat.
 */

/**
 * El carril de la pauta ja NO es publica des de JavaScript.
 *
 * Aqui hi havia `publishEarlyBeltVars()`, que calculava `getSafeBelt()` i
 * escrivia `--hg-tdp-xL/xR` a l'arrel abans del primer pintat, perque el
 * calcul arribava tard (quan es carregava el chunk de la pauta, cap a 1,2 s) i
 * la graella de les colleccions es desplaçava. El carril es, pero, una regla de
 * tres —1350/1920 de la finestra, amb sostre a 1350— i ara viu a
 * `src/foundation.css` com a `--contingut-max`, declarada abans que res.
 */

/**
 * Amplada del carril per a una amplada de finestra donada.
 *
 * Es la MATEIXA formula que `getSafeBelt()` fa servir quan no hi ha guies de
 * desenvolupament, pero pura: no llegeix cap CSS var. Serveix perque cap codi
 * de produccio hagi de dependre de `--belt2-*` (que nomes les publica
 * `BeltReferenceOverlay`, en DEV, i sempre mes tard): aixo era el que feia que
 * dev i produccio pintessin mides diferents.
 */
export function laneForViewport(vw = getLayoutViewportWidth()) {
  const ample = Number.isFinite(vw) && vw > 0 ? vw : 0;
  if (ample <= 0) return 1350;
  // El sostre es la proporcio de la finestra respecte de la referencia del
  // megaslide (a 1920 dona 1350 i a 1440 en dona 1013).
  const sostre = Math.round(ample * (1350 / 1920));
  const disponible = ample - 16 * 2;
  const objectiu = Math.min(sostre, disponible);
  const min = 320;
  const ambMinim = Math.max(objectiu, min);
  return Math.max(min, Math.min(ambMinim, sostre));
}
