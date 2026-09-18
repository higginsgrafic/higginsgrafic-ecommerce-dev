/**
 * Geometria de la graella de dibuixos del megaslide.
 * -----------------------------------------------------------------------------
 * Aquests numeros son la font de veritat de les mides de la graella. Vivien dins
 * de CercadorTextRow, pero tambe els ha de poder fer servir el modul de mesura
 * unica (src/utils/mesuraMegaslide.js) per calcular les mides sense llegir el
 * DOM dues vegades. Per aixo son aqui.
 */

// ============================================================
// ESCALA DE LA GRAELLA DE DIBUIXOS
// ============================================================
// La mida base (escala 1:1) del dibuix és 50 px, que és la mida natural del
// fitxer de dibuix (la que surt a /constructor/megaslide-icons).
//
// TOTS els percentatges es calculen SOBRE aquesta base 1:1 de 50 px:
//   100% = 50 px | 55% = 27,5 px | 45% = 22,5 px | 43% = 21,5 px
// ============================================================
export const DIBUIX_BASE = 50;
export const DIBUIX_GAP_V_BASE = 3;

// La graella de dibuixos fa 16 columnes × 4 files.
export const GRAELLA_COLUMNES = 16;
export const GRAELLA_FILES = 4;
// Amplada de referència de la graella: la que ocupaven les 12 primeres
// columnes a escala 1:1 (12 × 50 + 11 × 25 = 875 px), o sigui que l'últim
// dibuix de la fila (col·lumna 16) acaba on acabava Cylon '78 (col·lumna 12) a
// escala 1:1, just abans de les columnes de color.
export const GRAELLA_AMPLADA = 875;
// Marge entre l'última fila de dibuixos i el capdamunt de la franja.
export const GRAELLA_MARGE_FRANJA = 2;
// A tauleta (horitzontal i vertical, que han de ser la mateixa pagina), la
// graella de dibuixos va 20 px mes a l'esquerra (les columnes de color i la
// llista es queden al seu lloc).
export const GRAELLA_ESQUERRA_LANDSCAPE = 20;
// Pas vertical de la graella de colors (la columna dels cercles): 25 px de
// cercle + 8 px de separació. La graella de dibuixos fa servir el mateix pas
// perquè cada fila de dibuixos quedi alineada amb la seva fila de colors.
export const GRAELLA_PAS_COLORS = 33;

// ============================================================
// CENTRATGE HORITZONTAL DEL BLOC DE DIBUIXOS (nomes escriptori)
// ============================================================
// La filera de la pagina 2 te, a la dreta dels dibuixos, la columna de colors
// i la llista de col·leccions, que sumen 240 px:
//
//   BLOC_DRETA = 78 (cercles) + 10 + 142 (llista) + 10 (separacio) = 240
//
// El que ha de quedar centrat dins el carril es el CONJUNT (selector -> llista),
// no els dibuixos: amb els dibuixos centrats, les 240 px de la dreta empenyien
// el conjunt cap a la dreta i la llista sortia del carril. La posicio de la
// filera es doncs la del disseny, amb la mateixa proporcio del carril a cada
// banda:
//
// El marge dret es el mateix coixi de 40 px que fa servir la fila del header:
// la llista s'enrasa a la dreta de la seva columna, de manera que el text acaba
// exactament on acaba la columna, que es on acaba la icona d'usuari.
//
//   13% (175,5 px) a l'esquerra i 40 px a la dreta.
//
// Son proporcions DEL CARRIL (1350 px de referencia): a CercadorTextRow es
// passen a `% del carril`.
export const BLOC_DRETA_DIBUIXOS_ESCRIPTORI_PX = 240;
export const MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX = 175.5;
export const MARGE_DRET_FILERA_ESCRIPTORI_PX = 40;

// Desktop: dibuix de 30 px (60% de la base 1:1). La separació horitzontal és
// la que fa que les 16 columnes continuïn ocupant els 875 px de referència:
//   16 × 30 + 15 × 26,33 = 875 px
// Com que el dibuix és més petit, la separació entre dibuixos és més gran.
// La separació vertical no és fixa: CercadorTextRow la calcula segons l'espai
// que hi hagi fins a la franja de samarretes (DIBUIX_GAP_V és el valor de
// reserva quan encara no s'ha pogut mesurar).
export const DIBUIX_PX = 30;
export const DIBUIX_GAP_H = (GRAELLA_AMPLADA - GRAELLA_COLUMNES * DIBUIX_PX) / (GRAELLA_COLUMNES - 1);
export const DIBUIX_GAP_V = DIBUIX_GAP_V_BASE * (DIBUIX_PX / DIBUIX_BASE);
// Tauleta (horitzontal i vertical, de moment iguals): 40% de la base 1:1.
export const ESCALA_TAULETA = 0.995; // 0,5% mes petit (ho demana el disseny)
export const DIBUIX_PX_LANDSCAPE = DIBUIX_BASE * 0.40 * ESCALA_TAULETA;
export const DIBUIX_PX_PORTRAIT = DIBUIX_BASE * 0.40 * ESCALA_TAULETA;
// Tauleta horitzontal: la separacio horitzontal va un 10% mes estreta que la
// base de 20 px, perque la graella no arribi tan endins de la columna de color.
export const DIBUIX_GAP_H_LANDSCAPE = 18 * ESCALA_TAULETA;
export const DIBUIX_GAP_H_PORTRAIT = DIBUIX_GAP_H_LANDSCAPE; // 18: el vertical es la mateixa pagina

/** La mida de dibuix que toca per a aquesta pantalla. */
export function midaDibuix(isPortraitTablet, isLandscapeTablet) {
  if (isPortraitTablet) return DIBUIX_PX_PORTRAIT;
  if (isLandscapeTablet) return DIBUIX_PX_LANDSCAPE;
  return DIBUIX_PX;
}

/** La separació horitzontal que toca per a aquesta pantalla. */
export function gapHorizontal(isPortraitTablet, isLandscapeTablet) {
  if (isPortraitTablet) return DIBUIX_GAP_H_PORTRAIT;
  if (isLandscapeTablet) return DIBUIX_GAP_H_LANDSCAPE;
  return DIBUIX_GAP_H;
}

/** Pas vertical de la graella de colors (cercle + separació), per pantalla. */
// És el que ha de fer la graella de dibuixos perquè cada fila caigui a
// l'alçada de la seva fila de cercles: 20 px a vertical (16 + 4), 25 a
// horitzontal (19 + 6) i 33 a desktop (25 + 8).
/** Diametre del cercle de color. */
export function colorMida(isPortraitTablet, isLandscapeTablet) {
  // Tauleta vertical i horitzontal: la mateixa mesura, perque son la mateixa
  // pagina; el vertical nomes s'hi desplaca.
  if (isPortraitTablet || isLandscapeTablet) return 19 * ESCALA_TAULETA;
  return 25;
}

/** Separacio entre cercles de color. */
export function colorGap(isPortraitTablet, isLandscapeTablet) {
  if (isPortraitTablet || isLandscapeTablet) return 6 * ESCALA_TAULETA;
  return 8;
}

/** Pas vertical de la graella de colors (cercle + separacio). */
export function colorPas(isPortraitTablet, isLandscapeTablet) {
  return colorMida(isPortraitTablet, isLandscapeTablet) + colorGap(isPortraitTablet, isLandscapeTablet);
}

/** La separació vertical que toca per a aquesta pantalla. */
export function gapVertical(isPortraitTablet, isLandscapeTablet) {
  // A les tauletes, les files de dibuixos s'alineen amb les files de la graella
  // de colors: el pas vertical és el de la graella de colors (cercle més
  // separació) menys la mida del dibuix, de manera que cada fila de dibuixos
  // cau exactament a l'alçada de la seva fila de cercles. A desktop aquest pas
  // el calcula el calibratge dins del component (que pot reduir la graella).
  if (isPortraitTablet || isLandscapeTablet) {
    return Math.max(0, colorPas(isPortraitTablet, isLandscapeTablet) - midaDibuix(isPortraitTablet, isLandscapeTablet));
  }
  return DIBUIX_GAP_V;
}


/**
 * Mides de la graella compacta perquè hi càpiga a l'espai disponible.
 *
 * Era el càlcul que vivia dins de l'efecte de CercadorTextRow, barrejat amb la
 * lectura del DOM. Aquí és una funció pura: les mateixes entrades donen sempre
 * la mateixa sortida, i per tant es pot comprovar sense navegador.
 *
 * @param {object} entrada
 * @param {number|null} entrada.ampleAmple  amplada disponible de la columna, en px
 * @param {number|null} entrada.sostre      `top` de la franja de samarretes, en px
 * @param {number|null} entrada.daltGraella `top` de la graella de dibuixos, en px
 * @param {boolean} entrada.isPortraitTablet
 * @param {boolean} entrada.isLandscapeTablet
 * @returns {{dibuix:number, gapH:number, gapV:number}}
 */
export function midesGraellaCompacta({ ampleAmple, sostre, daltGraella, isPortraitTablet = false, isLandscapeTablet = false, escala = 1 }) {
  const base = midaDibuix(isPortraitTablet, isLandscapeTablet);
  const gapHBase = gapHorizontal(isPortraitTablet, isLandscapeTablet);
  const gapVBase = gapVertical(isPortraitTablet, isLandscapeTablet);

  // 1) Amplada. El dibuix té la seva mida de disseny escalada amb el carril
  //    (`base x escala`) i el que s'encongeix PRIMER són les separacions: quan
  //    l'espai va just, els dibuixos mantenen la mida i els gaps es
  //    comprimeixen. Només si les separacions arriben a zero es redueix el
  //    dibuix. (Ho va demanar l'amo: a 1440/1280 la columna de col·leccions
  //    queia sobre la graella de colors i el que ha de cedir és el dibuix.)
  let dibuix = base * escala;
  let gapH = gapHBase * escala;
  let gapV = gapVBase * escala;
  if (ampleAmple > 0) {
    const ampleNecessari = GRAELLA_COLUMNES * dibuix + (GRAELLA_COLUMNES - 1) * gapH;
    if (ampleNecessari > ampleAmple) {
      const gapNecessari = (ampleAmple - GRAELLA_COLUMNES * dibuix) / (GRAELLA_COLUMNES - 1);
      if (gapNecessari >= 0) {
        gapH = gapNecessari;
        gapV = Math.min(gapV, gapH);
      } else {
        // Ni sense separacions: s'encongeix el dibuix.
        gapH = 0;
        gapV = 0;
        dibuix = ampleAmple / GRAELLA_COLUMNES;
      }
    }
  }
  const factorDibuixEff = base > 0 ? dibuix / base : 1;

  // 2) Alçada: les files de dibuixos han de quedar alineades amb les files de
  //    la graella de colors (mateix pas vertical). Si amb aquest pas la graella
  //    no hi cap fins a la franja de samarretes, es redueix la separació
  //    vertical i, si encara no hi cap, el dibuix (mantenint la proporció amb
  //    la separació horitzontal).
  if (sostre != null && daltGraella != null) {
    const altDisp = sostre - daltGraella - GRAELLA_MARGE_FRANJA;
    if (altDisp > 0) {
      gapV = Math.max(0, colorPas(isPortraitTablet, isLandscapeTablet) * factorDibuixEff - dibuix);
      const altNecessaria = GRAELLA_FILES * dibuix + (GRAELLA_FILES - 1) * gapV;
      if (altNecessaria > altDisp) {
        const altDibuixos = GRAELLA_FILES * dibuix;
        if (altDibuixos > altDisp) {
          const factorAlt = altDisp / altDibuixos;
          dibuix *= factorAlt;
          gapH *= factorAlt;
          gapV = 0;
        } else {
          gapV = (altDisp - altDibuixos) / (GRAELLA_FILES - 1);
        }
      }
    }
  }

  return { dibuix, gapH, gapV };
}
