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
/**
 * L'ALÇADA DE LA CAPÇALERA: EL LOGO MÉS 10 px D'AIRE A DALT I A BAIX (24/09/2026).
 *
 * L'amo ho va demanar així. El logo fa 32 px, o sigui que la fila fa **52**:
 * abans en feia 80 i el logo hi nedava amb 24 px d'aire per banda.
 */
const ALCADA_CAPCALERA_ESCRIPTORI = 52;
const ALCADA_CAPCALERA_MOBIL = 52;
/**
 * La capçalera de DUES FILES de la tauleta vertical: els 52 px de la fila del
 * logo i les icones + 62 px la fila del menu de colleccions. Son **114**.
 *
 * PER QUE ES UNA CONSTANT I NO ES MESURA. Amb 116 (una versio anterior) el
 * layout reservava 7 px menys del que la capçalera ocupa de veritat, i els
 * primers 7 px de la pagina queien sota seu (invisible mentre allo es buit, pero
 * es una trampa: qualsevol cosa que s'hi posi desapareix). El megaslide hi penja
 * —el panell arrenca on acaba la capçalera—, així que la pagina i el panell han
 * de començar al mateix lloc.
 */
const ALCADA_CAPCALERA_TAULETA_VERTICAL = 114;

/**
 * Classificació del dispositiu a partir de les mides de la finestra.
 * NOMES mides: el touch no hi entra, perque la mateixa finestra ha de donar
 * sempre la mateixa maquetacio.
 *
 * ES UNA MATRIU D'AMPLADA I ALCADA, NO UNA FRONTERA D'AMPLADA (24/09/2026).
 *
 * El motiu es mesurat: **un telefon girat no es reconeix per l'amplada**. Un
 * Android 16:9 girat fa 640x310 i un iPad mini vertical fa 744x1133, i tots dos
 * cauen a la banda 600-767. Amb una frontera d'amplada sola, o son tots dos
 * mobil o no ho es cap; amb la matriu, el primer es mobil (es mes ample que
 * alt i encara no arriba a la tauleta apaissada) i el segon es tauleta.
 *
 * Amb aquesta regla, els 48 formats de `scripts/mesura-formats.mjs` tenen tots
 * classe: abans, els dos telefons girats de 600 a 767 (640x310 i 667x325)
 * queien a la branca per defecte de `headerHeightFor` i no eren res.
 *
 * Les quatre linies, avaluades en ordre, parteixen TOTES les finestres: no hi
 * ha cap forat i cap finestra cau a dues classes alhora.
 *
 *   1. mobil             =  ample < 600  ||  (ample < 768 && alcada < ample)
 *   2. tauleta vertical  =  alcada > ample  &&  ample <= 1024
 *   3. tauleta apaissada =  alcada < ample  &&  ample <= 1366  &&  alcada <= 1100
 *   4. escriptori        =  la resta
 *
 * L'alcada de 1100 nomes actua a la banda 1025-1366: es el que separa una
 * tauleta apaissada d'un monitor. I una finestra exactament quadrada (que no
 * es dona) cau a escriptori.
 */
export function deviceLayoutFromViewport(vw, vh) {
  const ample = Number.isFinite(vw) && vw > 0 ? vw : 0;
  const alt = Number.isFinite(vh) && vh > 0 ? vh : 0;

  const isMobile = ample > 0
    && (ample < MIDA_MOVIL || (ample < MIDA_TAULETA_APAISADA_MIN && alt < ample));
  const isPortraitTablet = !isMobile && ample > 0 && ample <= MIDA_TAULETA_VERTICAL_MAX && alt > ample;
  const isLandscapeTablet =
    !isMobile &&
    !isPortraitTablet &&
    ample <= MIDA_TAULETA_APAISADA_MAX &&
    alt > 0 &&
    alt < ample &&
    alt <= ALCADA_TAULETA_APAISADA_MAX;
  const isDesktop = !isMobile && !isPortraitTablet && !isLandscapeTablet;

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
 * rodona: 114 px a la tauleta vertical (les dues files) i 52 px a tota la
 * resta (el logo i 10 px d'aire a dalt i a baix; vegeu les constants). El que
 * canvia entre mobils, tauletes apaisades i escriptori es el contingut, no
 * l'alçada.
 *
 * LA CAPÇALERA DE DUES FILES ES NOMES DE LA TAULETA VERTICAL: el logo i les
 * icones (52 px) i el menu de colleccions a sota (62). L'apaisada la va portar
 * un temps (commit `17291eb`) i s'ha tornat enrere.
 *
 * AQUI HI HAVIA UNA `ESTRETA` DE 64 px que s'enduia la franja de 600 a 767 px
 * d'amplada en apaisat (els telefons girats: Galaxy S9/S9+, S10/S10+, iPhone
 * SE). Estava documentada com «avui no es dona enlloc» i sí que es donava: la
 * capçalera hi feia 81 px i la pagina en reservava 64, o sigui 17 px de
 * contingut sota la capçalera.
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
 * EL CARRIL DECLARAT: 3/5 DE LA FINESTRA, AMB 1/5 DE MARGE PER BANDA.
 *
 * Es la decisio de l'amo (24/09/2026) i substitueix la belt com a regle: en
 * comptes de `min(70,3125vw, 1350px)` (que es 1350/1920), el carril es una
 * fraccio de la finestra i no te sostre. El que guanya: el regle es un de sol
 * —el lloc, la capçalera, la pagina nova i el megaslide— i per sobre de 1920
 * el disseny continua creixent en comptes de congelar-se.
 *
 * Nomes val per a l'ESCRIPTORI i la TAULETA APAISSADA, que son les classes que
 * avui comparteixen el regle. La TAUETA VERTICAL i el MOBIL tornen `null`: tenen
 * el seu propi disseny calibrat (el tauler de 992 de la tauleta vertical, que es
 * mes ample que la finestra; i el mobil, que fa gairebe tota l'amplada) i el seu
 * carril no es pot canviar sense refer-ne la densitat. Vegeu
 * `docs/informes/PLA-estructura-general-dispositius.md` §2 i §3.
 *
 * @returns {number|null} amplada del carril en px, o null si la classe te regle propi
 */
export function carrilDeclarat({ ample, alt } = {}) {
  const d = deviceLayoutFromViewport(ample, alt);
  if (d.isMobile || d.isPortraitTablet) return null;
  if (d.viewportWidth <= 0) return null;
  return Math.round((d.viewportWidth * 3) / 5);
}

/**
 * Marc horitzontal del lloc: el mateix càlcul que SiteFrame publica com a
 * `--site-xL/xR/w`. És la font de veritat horitzontal de tot el projecte.
 *
 * `maxAmple` es el carril declarat quan n'hi ha: el marc del lloc i el carril
 * son la mateixa cosa, i per això el marc tambe ha de poder seguir el 3/5.
 */
export function siteFrameForViewport({ vw, vh, rulerInset = 0, maxAmple = 1350 } = {}) {
  const ample = Number.isFinite(vw) && vw > 0 ? vw : getLayoutViewportWidth();
  if (!Number.isFinite(ample) || ample <= 0) return null;
  const disponible = Math.max(0, ample - rulerInset);
  const topall = Number.isFinite(maxAmple) && maxAmple > 0 ? maxAmple : 1350;
  const ampleMarc = Math.max(0, Math.min(topall, disponible - 16 * 2));
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
