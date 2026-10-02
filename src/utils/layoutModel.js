import { getLayoutViewportWidth } from './layoutMetrics';
import {
  MIDA_MOVIL,
  MIDA_TAULETA_VERTICAL_MAX,
  MIDA_TAULETA_APAISADA_MIN,
  MIDA_TAULETA_APAISADA_MAX,
  ALCADA_TAULETA_APAISADA_MAX,
  esTauletaApaisada,
} from './layoutMetrics';

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

// ELS LÍMITS VIUEN A `layoutMetrics.js` (02/10/2026), amb les dues funcions
// `esTauletaApaisada`/`esTauletaVertical`: son les mateixes que consulten les
// peces del megaslide i el header, i la mateixa finestra no pot tenir dues
// classes. Aqui nome's s'importen (vegeu el comentari d'alla).
/**
 * L'ALÇADA DE LA CAPÇALERA: EL LOGO MÉS 20 px D'AIRE A DALT I A BAIX (04/10/2026).
 *
 * L'amo ho va demanar dues vegades: el 24/09 amb 10 px per banda, i el 04/10
 * («Dona-li 10 px d'aire al header, per sobre i per sota») amb 10 mes, o sigui
 * 20. El logo fa 32 px, aixi que la fila fa **72** (abans 52, i abans d'aixo 80,
 * amb el logo nedant-hi amb 24 px per banda).
 */
const ALCADA_CAPCALERA_ESCRIPTORI = 72;
const ALCADA_CAPCALERA_MOBIL = 72;
/**
 * La capçalera de DUES FILES de la tauleta vertical: els 72 px de la fila del
 * logo i les icones + 62 px la fila del menu de colleccions. Son **134**.
 *
 * PER QUE ES UNA CONSTANT I NO ES MESURA. Amb 116 (una versio anterior) el
 * layout reservava 7 px menys del que la capçalera ocupa de veritat, i els
 * primers 7 px de la pagina queien sota seu (invisible mentre allo es buit, pero
 * es una trampa: qualsevol cosa que s'hi posi desapareix). El megaslide hi penja
 * —el panell arrenca on acaba la capçalera—, així que la pagina i el panell han
 * de començar al mateix lloc.
 */
const ALCADA_CAPCALERA_TAULETA_VERTICAL = 134;

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
 *   2. tauleta vertical  =  alcada > ample  &&  ample <= 1032
 *   3. tauleta apaissada =  alcada < ample  &&  ample <= 1376  &&  alcada <= 1100
 *                           &&  (ample <= 1200  ||  alcada >= 900)
 *   4. escriptori        =  la resta
 *
 * L'alcada de 1100 nomes actua a la banda 1025-1376: es el que separa una
 * tauleta apaissada d'un monitor. I una finestra exactament quadrada (que no
 * es dona) cau a escriptori.
 *
 * I A LA BANDA DE 1201 A 1376, L'ALÇADA DE 900 (04/10/2026). En Marc: «L'de 1280
 * no ha de ser el de la tablet sino el del desktop»: alla hi conviuen els iPads
 * grans (1366x946 i 1376x954) amb els portatils (1280x666, 1280x720, 1366x634),
 * i el que els separa es l'alcada. Per sota de 1200 no canvia res.
 *
 * ELS DOS LÍMITS SON ELS DE LA TAULETA MES GRAN DE LA LLISTA (02/10/2026). En
 * Marc: «Em pregunto si no es podrien veure els formats tablet que tenim
 * seleccionats com a tablet, no com a desktop petit». L'iPad Pro 13 fa
 * 1032x1304 vertical i 1376x954 apaïssat: amb 1024 i 1366 queia a escriptori.
 * Vegeu `layoutMetrics.js`, que es qui declara els números.
 */
export function deviceLayoutFromViewport(vw, vh) {
  const ample = Number.isFinite(vw) && vw > 0 ? vw : 0;
  const alt = Number.isFinite(vh) && vh > 0 ? vh : 0;

  const isMobile = ample > 0
    && (ample < MIDA_MOVIL || (ample < MIDA_TAULETA_APAISADA_MIN && alt < ample));
  const isPortraitTablet = !isMobile && ample > 0 && ample <= MIDA_TAULETA_VERTICAL_MAX && alt > ample;
  // LA MATEIXA REGLA QUE `layoutMetrics` (esTauletaApaisada), i no una copia: si
  // les dues divergeixen, la mateixa finestra te dues classes i es veu com un
  // salt (ho diu el comentari de `layoutMetrics.js`).
  const isLandscapeTablet = !isMobile && !isPortraitTablet && esTauletaApaisada({ ample, alt });
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
export function siteFrameForViewport({ vw, _vh, rulerInset = 0, maxAmple = 1350 } = {}) {
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
  _teCapcaleraDev = false,
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
    // L'ALÇADA DE LA FILA DEL LOGO (la primera de les dues de la vertical). La
    // fa servir l'overlay de l'administració, que va ancorat a la punta esquerra
    // del header i s'ha de centrar amb AQUESTA fila, no amb el header sencer
    // (a la vertical el header tambe conte el megaslide).
    filaCapcaleraPx: ALCADA_CAPCALERA_ESCRIPTORI,
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
    if (model.filaCapcaleraPx) root.style.setProperty('--capcalera-fila', `${model.filaCapcaleraPx}px`);
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

/**
 * LES DUES VERSIONS DEL MEGASLIDE DEL MODEL (04/10/2026).
 *
 * En Marc: «La versio iPad Pro 13 actual es quedarà als altres grups. Cal
 * canviar-li el nom, és clar. En farem una altra per a la mida de l'iPad Pro 13,
 * 1376» i, en triar-ne el nom i l'abast, «megaslide 1100» i «Nome s 1376»; i
 * «Ara vull que portis el megaslide de l'iPad Pro 13 fins a 1200. Nome s l'iPad
 * Pro 13».
 *
 * O sigui que hi ha DUES VERSIONS, i el nom de cadascuna es el seu carril:
 *
 *   - `megaslide-1100`: la versio de sempre, la que es va fer per a l'iPad Pro
 *     13 i que ara es queda per als altres grups (1032 vertical, 1180 i 1200).
 *     Carril 1100.
 *   - `ipad-pro-13`: la versio NOVA, nome s per a la mida de l'iPad Pro 13
 *     (1376). Carril 1200, que es el canvi que ha demanat l'amo.
 *
 * LES DUES SON COPIES: avui nome s es diferencien en el carril, i a partir d'aqui
 * es poden divergir sense tocar-se. Per allo els parametres de cada versio viuen
 * junts a `MEGASLIDE_VERSIONS` i qui els necessita els demana amb
 * `paramsMegaslide()`.
 *
 * LES AMPLADES, PER AMPLADA I NO PER PARELLA (03/10/2026). En Marc: «Aplica el
 * megaslide de l'iPad Pro 13 a 1180x820 i 1200x800» i, en veure que no sortia,
 * «No veig cap canvi a 1180x820 ni a 1200x800»: una FINESTRA de 1180x820 dona un
 * viewport de ~1180x742 (el navegador se'n menja ~78 px, com al model: 1032 ->
 * 954) i la de 1200x800, ~1200x722. Lligar-ho a la parella exacta volia dir que
 * qui redimensiona la finestra no veia mai el canvi, i per allo mana l'amplada
 * (amb 2 px de marge per si el navegador arrodoneix) mes la classe de tauleta,
 * que es qui diu l'orientacio.
 *
 * @param {{ample?: number, alt?: number}} [mides]
 * @returns {boolean}
 */
export const IPAD_PRO_13_AMPLADES = [1032, 1376];
export const MEGASLIDE_1100_AMPLADES = [1032, 1180, 1200];

/**
 * LA LLARGADA 939 (05/10/2026).
 *
 * En Marc: «Avui tanim la 900 (confirma'm la mida per posar-li el nom correcte),
 * la 1100 i la 1200. Pero seran variacions i no construccions noves». La que ell
 * en deia «la 900» es aquesta: 939 px, el carril de la banda estreta de paisatge
 * (l'iPad Air 13 de 1366 i els apaissats de 1051 a 1366), que fins ara s'escrivia
 * `939,2` escampat pels components. Amb la 1100 i la 1200, doncs, nome s hi ha
 * TRES llargades en us.
 *
 * Els enters son una premisa de treball seva: «Fes servir nombres enters. Evita
 * els decimals. No aporten res, visualment parlant, i nome s compliquen les mides
 * (a mi)». Aquest es el valor unic dels components que dibuixen aquest carril; la
 * resta de decimals de geometria que venen del disseny de 1350 es queden com son.
 */
export const CARRIL_MEGASLIDE_939_PX = 939;
export const MEGASLIDE_VERSIONS = {
  // LA VARIANT 939, DECLARADA (05/10/2026). En Marc: «la meva idea es que totes
  // els megaslides siguin iguals i tinguin variacions. No un megaslide per cada
  // versio. [...] Pero seran variacions i no construccions noves».
  //
  // Fins ara la 939 no era cap versio: era el fallback que cada component es
  // feia quan `carrilMegaslide()` tornava null. Ara es una variant mes, amb els
  // SEUS numeros, i els components ja no han d'endevinar la banda.
  'megaslide-939': {
    nom: 'Megaslide 939',
    carril: CARRIL_MEGASLIDE_939_PX,
    // Es tria per la CLASSE i la banda (`versioMegaslide`), no per una llista
    // d'amplades: es la variant dels apaissats de mes de 1050 px.
    amplades: [],
    // Els valors son els que aquesta banda ja tenia pels seus propis fallbacks:
    // declarar-los no mou res (mesurat a 1366: 0 px).
    aireStripeColumna: 4,
    extraAireSota: 0,
    // L'aire de sota el bloc de la p1 (`MegaStripePanelP1`) i el de dalt del
    // bloc de la p2 (`MegaslidePagina2`). Eren 10 i 15 en aquesta banda i 20 i
    // 20 a la 1100: fins ara els components ho endevinaven amb un `!= null`; ara
    // ho diu la variant.
    aireSotaBloc: 10,
    aireDaltBlocP2: 15,
    // L'aire de dalt de la p1 (`MegaMenuPanel`): els 1,4 px que falten per fer
    // els 20 px del disseny. Aquesta banda no els porta.
    margeTopBlocP1: 0,
    // La composicio de la construccio unica que li toca: la del model, la
    // mateixa que la 1100 i la 1200 (vegeu `composicioMegaslide`).
    composicio: 'estreta',
  },
  'megaslide-1100': {
    nom: 'Megaslide 1100',
    carril: 1100,
    // Les amplades que la porten. La 1032 es la vertical de l'iPad Pro 13, que
    // te el seu tauler de 992 i nome s hi rep la resta d'adaptacions del model.
    amplades: MEGASLIDE_1100_AMPLADES,
    // L'aire de la cintura a la columna (`AIRE_STRIPE_COLUMNA_PX`): la constant
    // que fa que la cintura acabi a 5 px de la columna. Depen del carril, o
    // sigui que es de cada versio.
    aireStripeColumna: 3.6,
    // L'AIRE DE SOTA EL PANELL (04/10/2026). En Marc: «Fem un canvi al megaslide
    // 1100. L'aire de sota, en lloc de 40 px que en siguin 20». Es el que se suma
    // al `P1_STRIPE_BOTTOM_GAP` de `MegaMenuPanel` per fer la guarda de l'alcada:
    // amb 26 l'aire de sota fa 40,5 px i amb 6 en fa 20,5 (mesurat).
    extraAireSota: 6,
    aireSotaBloc: 20,
    aireDaltBlocP2: 20,
    margeTopBlocP1: 1.4,
    composicio: 'estreta',
  },
  // LA VERSIO DE L'ESCRIPTORI (04/10/2026). En Marc: «Vull provar una cosa al
  // desktop. Crec que em carregare el carril original. Canvia el megaslide de la
  // desktop pel megaslide 1200». Es una PROVA: l'escriptori deixa el carril
  // proporcional (3/5 de la finestra: 1143 a 1920, 855 a 1440) i passa a tenir
  // el carril fix de 1200, com l'iPad Pro 13.
  //
  // Nomes canvia el CARRIL: `aireStripeColumna` es posa al valor del carril de
  // 1200 (3,7, vegeu la versio de l'iPad Pro 13) i l'aire de sota es queda al
  // que te l'escriptori avui (0), perque la prova es vegi neta.
  //
  // `amplades: []` es volgut: aquesta versio NO es tria per amplada com les de
  // tauleta, sino per la CLASSE (`isDesktop`), i una llista buida fa que el
  // bucle de les tauletes no la trobi mai.
  'megaslide-1200': {
    nom: 'Megaslide 1200',
    carril: 1200,
    amplades: [],
    aireStripeColumna: 3.7,
    extraAireSota: 0,
    aireSotaBloc: 20,
    aireDaltBlocP2: 20,
    margeTopBlocP1: 1.4,
    composicio: 'estreta',
  },
  'ipad-pro-13': {
    nom: 'iPad Pro 13',
    // «Ara vull que portis el megaslide de l'iPad Pro 13 fins a 1200»: aquesta
    // versio va amb el carril de 1200, nome s a la mida de l'iPad Pro 13.
    carril: 1200,
    amplades: [1376],
    // 3,7 i no 3,6: amb el carril de 1200 la cintura quedava a 4,9 de la
    // columna (mesurat) i amb 3,7 torna a quedar a 5,0. Cada unitat de la
    // constant mou la cintura 1 px.
    aireStripeColumna: 3.7,
    // L'aire de sota el panell es queda als 40 px de sempre.
    extraAireSota: 26,
    aireSotaBloc: 20,
    aireDaltBlocP2: 20,
    margeTopBlocP1: 1.4,
    composicio: 'estreta',
  },
};

/**
 * Quina versio del megaslide li toca a aquesta vista, o `null` si no n'hi toca
 * cap.
 *
 * A LES TAU LETES es miren les AMPLADES (i nome s elles): la 1032, 1180 i 1200
 * porten el megaslide 1100 i la 1376 l'iPad Pro 13.
 *
 * A L'ESCRIPTORI, LA CLASSE (04/10/2026): en Marc vol provar-hi el carril de
 * 1200, i alla la versio es tria per `isDesktop`, no per amplada.
 *
 * I LA RESTA D'APAISSATS SON LA 939 (05/10/2026): els de mes de 1050 px que no
 * porten cap versio per amplada (l'iPad Air 13 de 1366 i els de 1133, 1194...).
 * El tall dels 1050 es el mateix que fa servir el header per al carril de la
 * pagina: per sota seu mana l'ajust de 1024, que es una altra feina.
 *
 * @param {{ample?: number, alt?: number}} [mides]
 * @returns {'megaslide-939'|'megaslide-1100'|'megaslide-1200'|'ipad-pro-13'|null}
 */
export function versioMegaslide({ ample, alt } = {}) {
  const w = ample ?? (typeof window !== 'undefined' ? window.innerWidth : 0);
  const h = alt ?? (typeof window !== 'undefined' ? window.innerHeight : 0);
  const es = deviceLayoutFromViewport(w, h);
  if (es.isDesktop) return 'megaslide-1200';
  if (!(es.isPortraitTablet || es.isLandscapeTablet)) return null;
  const marge = 2;
  const clau = Object.keys(MEGASLIDE_VERSIONS)
    .find((k) => MEGASLIDE_VERSIONS[k].amplades.some((a) => Math.abs(w - a) <= marge));
  if (clau) return clau;
  if (es.isLandscapeTablet && w > 1050) return 'megaslide-939';
  return null;
}

/** Els parametres de la versio que li toca a aquesta vista, o `null`. */
export function paramsMegaslide(mides) {
  const clau = versioMegaslide(mides);
  return clau ? MEGASLIDE_VERSIONS[clau] : null;
}

/**
 * L'iPAD PRO 13, COM A DISPOSITIU (04/10/2026).
 *
 * `versioMegaslide` tambe diu que si les amplades de 1180 i 1200, que porten el
 * megaslide 1100 pero NO son l'iPad Pro 13. Qui hagi de distingir el DISPOSITIU
 * —la hero, que a l'iPad Pro 13 va un 50 % mes alta (04/10/2026)— ha de fer
 * servir aquesta: les dues amplades del maquinari, 1032 i 1376.
 *
 * @param {{ample?: number, alt?: number}} [mides]
 * @returns {boolean}
 */
export function esIPadPro13Estricte({ ample, alt } = {}) {
  const w = ample ?? (typeof window !== 'undefined' ? window.innerWidth : 0);
  const h = alt ?? (typeof window !== 'undefined' ? window.innerHeight : 0);
  const es = deviceLayoutFromViewport(w, h);
  const marge = 2;
  return IPAD_PRO_13_AMPLADES.some((a) => Math.abs(w - a) <= marge)
    && (es.isPortraitTablet || es.isLandscapeTablet);
}

/**
 * EL CARRIL D'AQUESTA VISTA, SI PORTa MEGASLIDE DEL MODEL (03/10/2026).
 *
 * El carril es el nom de la versio (1100 i 1200): el de la versio que li toca a
 * la vista. Nome s a les vistes APAÏSSADES (la vertical te el seu tauler de 992 i
 * es una altra feina) i mai no passa de la finestra menys 80 px, que es la regla
 * del segon carril.
 *
 * @param {{ample?: number, alt?: number}} [mides]
 * @returns {number|null}
 */
export function carrilMegaslide({ ample, alt } = {}) {
  const w = ample ?? (typeof window !== 'undefined' ? window.innerWidth : 0);
  const h = alt ?? (typeof window !== 'undefined' ? window.innerHeight : 0);
  const params = paramsMegaslide({ ample: w, alt: h });
  if (!params) return null;
  const es = deviceLayoutFromViewport(w, h);
  // A L'ESCRIPTORI TAMBE (04/10/2026). En Marc vol provar-hi el carril de 1200,
  // i aquesta funcio nome's el deixava passar a les tauletes apaissades.
  if (!es.isLandscapeTablet && !es.isDesktop) return null;
  return Math.min(params.carril, Math.max(320, w - 80));
}
