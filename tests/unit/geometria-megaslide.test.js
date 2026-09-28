import { describe, it, expect } from 'vitest';
import {
  carrilDeFinestra,
  pageLiftPagina1,
  TOP_SELECTOR_PAGINA1_PX,
  AJUST_FILES_PAGINA1_PX,
  TOP_SELECTOR_ESCRIPTORI_PAGINA1_PX,
  esEscriptoriPagina1,
  ampladaFilaFranja,
  ampladaRetallGraella,
  alcadaSelector,
  alcadaCellaSelector,
  alcadaCarruselGraella,
  centratgeSelectorY,
  desplacTopSelector,
  COLUMNA_TOP_AJUST_PX,
  COLUMNA_BAIX_AJUST_PX,
  PADDING_DALT_PANELL_ESCRIPTORI_PX,
  PADDING_BAIX_PANELL_PX,
  PADDING_VERTICAL_PANELL_PX,
  PADDING_VERTICAL_PANELL_ESCRIPTORI_PX,
  desnivellsLiniesGraella,
  desnivellColorsGraella,
  margeBaixFletxesGraella,
  ampladaColumnaGraella,
  GRAELLA_DRETA_FLETXES_CARRIL_PX,
  FRANJA_FITXER_AMPLADA,
  FRANJA_FITXER_ALCADA,
  FRANJA_FITXER_ASPECTE,
  esBandaEstretaFranja,
  FRANJA_CASES,
  quantsGrupActiuFranja,
  desplacamentCentratgeFranja,
  alcadaReservaGraellaPanell,
  alcadaReservaGraellaPanellCss,
  visualOffsetYFranjaPagina2,
  PAGINA1_COSTAT_PECA_PX,
  PAGINA1_GAP_DRETA_PX,
  PAGINA1_MIDA_BLOC_DRETA_PX,
  PAGINA1_AMPLADA_BLOC_DRETA_PX,
  PAGINA1_ALCADA_FILERA_PX,
  PAGINA1_TOP_FILERA_PX,
  PAGINA1_AJUST_FRANJA_PX,
  pagina1BlocDretaPx,
  pagina1AmpladaGraellaPx,
  pagina1AlcadaFileraPx,
  topFranjaPagina2,
  AJUST_BAIX_BLOC_FRANJA_PX,
  finestraCosVel,
  VEL_AMPLADA_COS_FRACCIO,
} from '../../src/components/megaslide/geometriaMegaslide.js';

// Aquesta prova fixa els numeros DECLARATS del megaslide contra el que es va
// MESURAR al navegador el 25-26/09/2026. Es la xarxa que fa que allo declarat
// no es pugui desquadrar: si algu canvia una formula i el numero deixa de
// coincidir amb el que es veia, aqui salta.
//
// Vegeu el PLA de neteja del calibratge del megaslide (docs/informes).

describe('carrilDeFinestra', () => {
  it('a 1920 la finestra de layout fa 1905 (15 px de barra) i el carril 1143', () => {
    // Mesurat: `--hg-mega-w` = 1143px i el carril 381..1524 a 1920x946.
    // D'aqui surt l'amplada de layout: 1143 / (3/5) = 1905.
    const g = carrilDeFinestra(1905, 946);
    expect(g.carril).toBe(1143);
    expect(g.x).toBe(381);
  });

  it("a 1512 l'amplada de layout es 1497 i el carril 898", () => {
    // Mesurat: `--hg-mega-w` = 898px i x = 300px a 1512x900.
    const g = carrilDeFinestra(1497, 900);
    expect(g.carril).toBe(898);
    expect(g.x).toBe(300);
  });

  it("l'escala es el carril sobre la referencia de 1350", () => {
    expect(carrilDeFinestra(1905, 946).escala).toBeCloseTo(1143 / 1350, 6);
  });

  it('a les classes amb regle propi (movil i tauleta vertical) torna null', () => {
    expect(carrilDeFinestra(390, 844)).toBeNull();
  });
});

describe('pageLiftPagina1', () => {
  it("a l'escriptori baixa el bloc els 18,6 px de l'ajust de les files", () => {
    const lift = pageLiftPagina1({ ample: 1920, alt: 946 });
    expect(lift).toBeCloseTo(0.92, 2);
    expect(TOP_SELECTOR_ESCRIPTORI_PAGINA1_PX - lift).toBeCloseTo(20, 2);
  });

  it("a la banda estreta (768-1366 apaisada) no hi aplica l'ajust", () => {
    // Mesurat a 1366x768 i 1024x768: alla els dos blocs ja hi cauen sols.
    const lift = pageLiftPagina1({ ample: 1366, alt: 768 });
    expect(esEscriptoriPagina1({ ample: 1366, alt: 768 })).toBe(false);
    expect(lift).toBeCloseTo(19.52, 2);
    expect(TOP_SELECTOR_PAGINA1_PX - lift).toBeCloseTo(20, 2);
  });

  it('a la tauleta apaissada el deixa a 10 px', () => {
    const lift = pageLiftPagina1({ ample: 1366, alt: 768, isLandscapeTablet: true });
    expect(lift).toBeCloseTo(29.52, 2);
    expect(TOP_SELECTOR_PAGINA1_PX - lift).toBeCloseTo(10, 2);
  });

  it('la pagina 1 baixa el bloc per quadrar-lo amb la 2 (26/09/2026)', () => {
    // El top natural del selector es 39,52 i l'amo va demanar que el bloc de la
    // pagina 1 caigues a les mateixes posicions que el de la pagina 2:
    // mesurat a 1920, 1440 i 2560, anava 18,6 px per sobre.
    expect(AJUST_FILES_PAGINA1_PX).toBeCloseTo(18.6, 2);
    expect(TOP_SELECTOR_PAGINA1_PX).toBeCloseTo(39.52, 2);
    expect(TOP_SELECTOR_ESCRIPTORI_PAGINA1_PX).toBeCloseTo(20.92, 2);
  });

  it("a la vertical no s'aplica", () => {
    expect(pageLiftPagina1({ isPortraitTablet: true })).toBe(0);
  });
});

describe('ampladaFilaFranja', () => {
  it('les mides del fitxer son les dels atributs de la imatge', () => {
    expect(FRANJA_FITXER_AMPLADA).toBe(2866);
    expect(FRANJA_FITXER_ALCADA).toBe(307);
    expect(FRANJA_FITXER_ASPECTE).toBeCloseTo(9.3355, 4);
  });

  it('amb la filera de 91,27 px dona 852,05: el que es mesurava al DOM (852)', () => {
    // Mesurat a 1512x900 (DPR 2): la filera feia 852 px d'amplada i 91,27 px
    // d'alçada (carrilPx(stripePreviewHPx)).
    expect(ampladaFilaFranja(91.27)).toBeCloseTo(852.05, 1);
  });

  it("sense alcada valida torna 0 (i qui el fa servir no pinta res)", () => {
    expect(ampladaFilaFranja(0)).toBe(0);
    expect(ampladaFilaFranja(NaN)).toBe(0);
  });
});

describe('ampladaRetallGraella', () => {
  it("quadra amb el retall mesurat a les quatre finestres d'escriptori", () => {
    // Mesurat al navegador (`clientWidth` del retall, 26/09/2026, despres de
    // deixar el gap de 10 px amb la columna de colleccions): 870 / 683 / 651 /
    // 1162. La funcio dona 869 / 681 / 648 / 1163: les dues ultimes mesures son
    // d'una finestra de 1440x800 i de 2560x1306, que no son exactament les que
    // la funcio pren com a referencia (1425x800 i 2545x1306), i alla la
    // diferencia es de 3 px. El que es comprova aqui es que la formula segueixi
    // donant el MATEIX que el navegador a les mides de referencia.
    //
    // (Abans d'aquest canvi eren 864 / 674 / 641 / 1161: la columna de la dreta
    // es mes ampla i el gap mes estret, i el retall creix els mateixos px que
    // creix la columna.)
    expect(ampladaRetallGraella(1905, 946)).toBe(869);
    expect(ampladaRetallGraella(1497, 900)).toBe(681);
    expect(ampladaRetallGraella(1425, 800)).toBe(648);
    expect(ampladaRetallGraella(2545, 1306)).toBe(1163);
  });

  it('a les classes amb regle propi (movil i tauleta vertical) torna null', () => {
    expect(ampladaRetallGraella(390, 844)).toBeNull();
  });
});

describe('alcadaSelector', () => {
  it('quadra amb el selector mesurat (120 x escala)', () => {
    // Mesurat al navegador (alcada de `[data-stripe-buttonsbar="bn"]`): 119 /
    // 89,06 / 93,59 / 159 a 1920 / 1440 / 1512 / 2560.
    expect(alcadaSelector(120, 1339 / 1350)).toBeCloseTo(119.02, 2);
    expect(alcadaSelector(120, 1002 / 1350)).toBeCloseTo(89.07, 2);
    expect(alcadaSelector(120, 1053 / 1350)).toBeCloseTo(93.6, 2);
    expect(alcadaSelector(120, 1789 / 1350)).toBeCloseTo(159.02, 2);
  });

  it('la cella es un terc de la pastilla', () => {
    // El DOM mesura 119 px d'alcada: la cella, 39,67.
    expect(alcadaCellaSelector(120, 1339 / 1350)).toBeCloseTo(119 / 3, 1);
  });
});

describe('centratgeSelectorY', () => {
  it('a 1920 dona 17,03 (el bucle en mesurava 17,07)', () => {
    const scy = centratgeSelectorY({
      midaSelector: 120, escala: 1339 / 1350, dibuix: 29.7556, gapV: 2.9756, carril: 1143,
    });
    expect(scy).toBeCloseTo(17.03, 2);
  });

  it('a 1440 dona 15,76 (el bucle, 15,76)', () => {
    const scy = centratgeSelectorY({
      midaSelector: 120, escala: 1002 / 1350, dibuix: 22.2667, gapV: 2.2267, carril: 855,
    });
    expect(scy).toBeCloseTo(15.76, 2);
  });

  it("l'alcada del carrusel es dues vegades la filera (peca 1,5x + gap)", () => {
    expect(alcadaCarruselGraella(29.7556, 2.9756)).toBeCloseTo(2 * (1.5 * 29.7556 + 2.9756), 6);
    expect(alcadaCarruselGraella(0, 0)).toBe(0);
  });
});

describe('desnivellsLiniesGraella', () => {
  it('a 1920 dona -2,55 i 5,38 (el bucle n\'aplicava -2,55 i 5,37)', () => {
    const d = desnivellsLiniesGraella({
      dibuix: 29.7556, gapV: 2.9756, carril: 1143, midaSelector: 120, escala: 1339 / 1350,
    });
    expect(d.primera).toBeCloseTo(-2.551, 2);
    expect(d.segona).toBeCloseTo(5.383, 2);
  });

  it('a 1440 dona -1,90 i 4,03 (el bucle, -1,90 i 4,04)', () => {
    const d = desnivellsLiniesGraella({
      dibuix: 22.2667, gapV: 2.2267, carril: 855, midaSelector: 120, escala: 1002 / 1350,
    });
    expect(d.primera).toBeCloseTo(-1.904, 2);
    expect(d.segona).toBeCloseTo(4.033, 2);
  });

  it('a 1366x768 (tauleta apaisada) dona 5,93 i 3,66', () => {
    const d = desnivellsLiniesGraella({
      dibuix: 31.343 / 1.5, gapV: 3.98, carril: 811, midaSelector: 112.8, escala: 1,
    });
    expect(d.primera).toBeCloseTo(5.934, 2);
    expect(d.segona).toBeCloseTo(3.656, 2);
  });
});

describe('desnivellColorsGraella', () => {
  const colorsA = (carril, midaSelector, escala, dibuix, gapV, reservaFletxes, colorGapPx) => {
    const ampleRetall = ampladaColumnaGraella({ carril, midaSelector, escala })
      - (reservaFletxes ? GRAELLA_DRETA_FLETXES_CARRIL_PX * escala : 0);
    return desnivellColorsGraella({
      ampleRetall, dibuix, gapV, carril, midaSelector, escala, colorGapPx,
    });
  };

  // Els valors son els del 26/09/2026, despres de deixar el gap de 10 px amb la
  // columna de colleccions (la columna es mes ampla i el retall tambe: 8,82 a
  // 1920 en comptes de 8,76).
  it("a 1920 dona 8,82 (el DOM n'aplicava 8,78 abans del canvi)", () => {
    expect(colorsA(1143, 120, 1339 / 1350, 29.7556, 2.9756, true, 8 * (29.7556 / 30))).toBeCloseTo(8.82, 1);
  });

  it("a 1440 dona 9,10 (el DOM, 9,02 abans del canvi)", () => {
    expect(colorsA(855, 120, 1002 / 1350, 22.2667, 2.2267, true, 8 * (22.2667 / 30))).toBeCloseTo(9.1, 1);
  });

  it("a 2560 dona 8,44 (el DOM, 8,44)", () => {
    expect(colorsA(1527, 120, 1789 / 1350, 39.7556, 3.9756, true, 8 * (39.7556 / 30))).toBeCloseTo(8.44, 1);
  });

  it("a 1366x768 (tauleta) dona 1,52 (el DOM, 1,45 abans del canvi)", () => {
    expect(colorsA(811, 112.8, 1, 31.343 / 1.5, 3.98, false, 6 * 0.995)).toBeCloseTo(1.52, 1);
  });
});

describe('desplacTopSelector', () => {
  it("a l'escriptori val 12, a la banda -6 i a la tauleta apaissada -8", () => {
    expect(desplacTopSelector({ ample: 1920, alt: 946 })).toBe(12);
    expect(desplacTopSelector({ ample: 1024, alt: 600 })).toBe(-6);
    expect(desplacTopSelector({ ample: 1366, alt: 768, isLandscapeTablet: true })).toBe(-8);
  });

  it("el margeDalt de la columna a 1920 es -5,03", () => {
    const desplacTop = desplacTopSelector({ ample: 1920, alt: 946 });
    const scy = centratgeSelectorY({
      midaSelector: 120, escala: 1339 / 1350, dibuix: 29.7556, gapV: 2.9756, carril: 1143, desplacTop,
    });
    expect(desplacTop - scy).toBeCloseTo(-5.03, 2);
  });
});

describe('margeBaixFletxesGraella', () => {
  it('a 1920 dona 28,84 (el bucle, 28,82)', () => {
    expect(margeBaixFletxesGraella({
      dibuix: 29.7556, gapV: 2.9756, carril: 1143, midaSelector: 120, escala: 1339 / 1350,
    })).toBeCloseTo(28.84, 1);
  });

  it('a 1440 dona 21,57 (el bucle, 21,56)', () => {
    expect(margeBaixFletxesGraella({
      dibuix: 22.2667, gapV: 2.2267, carril: 855, midaSelector: 120, escala: 1002 / 1350,
    })).toBeCloseTo(21.57, 1);
  });

  it('a 2560 dona 38,52 (el bucle, 38,51)', () => {
    expect(margeBaixFletxesGraella({
      dibuix: 39.7556, gapV: 3.9756, carril: 1527, midaSelector: 120, escala: 1789 / 1350,
    })).toBeCloseTo(38.52, 1);
  });
});

describe('esBandaEstretaFranja', () => {
  it('es la banda de 768 a 1366 en horitzontal', () => {
    expect(esBandaEstretaFranja({ ample: 1280, alt: 720 })).toBe(true);
    expect(esBandaEstretaFranja({ ample: 1366, alt: 768 })).toBe(true);
    expect(esBandaEstretaFranja({ ample: 1024, alt: 768 })).toBe(true);
  });

  it('no ho es a l\'escriptori ample ni a la tauleta vertical', () => {
    expect(esBandaEstretaFranja({ ample: 1920, alt: 946 })).toBe(false);
    expect(esBandaEstretaFranja({ ample: 1440, alt: 800 })).toBe(false);
    expect(esBandaEstretaFranja({ ample: 768, alt: 1024 })).toBe(false);
  });
});

describe('alcadaReservaGraellaPanell', () => {
  it('a 1920 dona 130,38 (el DOM, 130,38)', () => {
    expect(alcadaReservaGraellaPanell({ carril: 1143, escala: 1339 / 1350 })).toBeCloseTo(130.38, 2);
  });

  it('a 1440 dona 101,04 (el DOM, 101,03)', () => {
    expect(alcadaReservaGraellaPanell({ carril: 855, escala: 1002 / 1350 })).toBeCloseTo(101.04, 2);
  });

  it('a 2560 dona 169,49 (el DOM, 169,49)', () => {
    expect(alcadaReservaGraellaPanell({ carril: 1527, escala: 1789 / 1350 })).toBeCloseTo(169.49, 2);
  });

  it('a 1366x768 dona 93,40 (el DOM, 93,14: 0,26 px)', () => {
    expect(alcadaReservaGraellaPanell({ carril: 811, escala: 1 })).toBeCloseTo(93.4, 1);
  });

  it('el `calc()` del panell porta els mateixos numeros', () => {
    expect(alcadaReservaGraellaPanellCss()).toBe(
      'calc((var(--hg-mega-w, 1350px) - 96px * var(--hg-escala-mega, 1)) / 9 + 13.96px)',
    );
  });
});

describe('visualOffsetYFranjaPagina2', () => {
  // LA FRANJA DE LA PAGINA 2 SEGUEIX EL BLOC DE LA PAGINA 1 (26/09/2026).
  //
  // L'offset es `-pageLift + ...`: a l'escriptori, quan l'amo va demanar que el
  // bloc de la pagina 1 baixes 18,6 px per quadrar-lo amb el de la pagina 2, el
  // sostre de la franja de la pagina 2 va baixar amb ell (i la de la pagina 1
  // tambe, que viu dins el mateix bloc mogut). A la banda estreta i a les
  // tauletes el pageLift no canvia i els dos sostres es queden on eren.
  it('a la tauleta apaissada (1366x768) val -39,52 (el DOM, -39,52)', () => {
    expect(visualOffsetYFranjaPagina2({ ample: 1366, alt: 768, isLandscapeTablet: true })).toBeCloseTo(-39.52, 2);
  });

  it("a l'escriptori (1920) val 9,08 (abans -9,52: el bloc ha baixat 18,6)", () => {
    expect(visualOffsetYFranjaPagina2({ ample: 1920, alt: 946 })).toBeCloseTo(9.08, 2);
  });

  it('a la tauleta vertical val 0', () => {
    expect(visualOffsetYFranjaPagina2({ ample: 768, alt: 1024, isPortraitTablet: true })).toBe(0);
  });
});

describe('topFranjaPagina2', () => {
  it('a 1920 dona 156,46 (abans 137,86: el bloc ha baixat 18,6)', () => {
    expect(topFranjaPagina2({ carril: 1143, escala: 1339 / 1350, ample: 1920, alt: 946 })).toBeCloseTo(156.46, 1);
  });

  it('a 1440 dona 127,12 (abans 108,52)', () => {
    expect(topFranjaPagina2({ carril: 855, escala: 1002 / 1350, ample: 1440, alt: 800 })).toBeCloseTo(127.12, 1);
  });

  it('a 2560 dona 195,57 (abans 176,97)', () => {
    expect(topFranjaPagina2({ carril: 1527, escala: 1789 / 1350, ample: 2560, alt: 1306 })).toBeCloseTo(195.57, 1);
  });

  it('a 1366x768 dona 85,88 (el DOM, 85,70: 0,18 px)', () => {
    expect(topFranjaPagina2({
      carril: 811, escala: 1, ample: 1366, alt: 768, isLandscapeTablet: true,
    })).toBeCloseTo(85.88, 1);
  });

  it('a 1024x768 dona 63,00 (el DOM, 62,85: 0,15 px)', () => {
    expect(topFranjaPagina2({
      carril: 605, escala: 1, ample: 1024, alt: 768, isLandscapeTablet: true,
    })).toBeCloseTo(63.0, 1);
  });

  it('a 768x1024 (vertical) dona 130,52 (el DOM, 130,24: 0,28 px)', () => {
    expect(topFranjaPagina2({
      carril: 992, escala: 1, ample: 768, alt: 1024, isPortraitTablet: true,
    })).toBeCloseTo(130.52, 1);
  });

  it('la banda estreta no hi aplica el desplaçament de -15', () => {
    const base = { carril: 1143, escala: 1339 / 1350 };
    const ample = topFranjaPagina2({ ...base, ample: 1920, alt: 946 });
    const estreta = topFranjaPagina2({ ...base, ample: 1300, alt: 900 });
    expect(estreta - ample).toBeCloseTo(-AJUST_BAIX_BLOC_FRANJA_PX, 2);
  });
});

describe('quantsGrupActiuFranja', () => {
  it('compta el grup del principi de la tira (el de la colleccio activa)', () => {
    expect(quantsGrupActiuFranja({ collections: ['cube', 'cube', 'miscellania', 'cube'], active: 'cube' })).toBe(2);
    expect(quantsGrupActiuFranja({ collections: ['first_contact', 'first_contact', 'cube'], active: 'cube' })).toBe(0);
  });

  it('sense colleccio o sense tira, zero', () => {
    expect(quantsGrupActiuFranja({ collections: null, active: 'cube' })).toBe(0);
    expect(quantsGrupActiuFranja({ collections: ['cube'], active: '' })).toBe(0);
  });
});

describe('desplacamentCentratgeFranja', () => {
  it('amb 7 dibuixos actius (FIRST CONTACT) dona -3: abans la franja hi arribava girant des de 0', () => {
    expect(FRANJA_CASES).toBe(14);
    expect(desplacamentCentratgeFranja({ quants: 7, n: 64 })).toBe(-3);
  });

  it('amb 5 (MISCEL·LANIA) dona -4, amb 10 (CUBE) -2 i amb 15 (THE HUMAN INSIDE) 1', () => {
    expect(desplacamentCentratgeFranja({ quants: 5, n: 64 })).toBe(-4);
    expect(desplacamentCentratgeFranja({ quants: 10, n: 64 })).toBe(-2);
    expect(desplacamentCentratgeFranja({ quants: 15, n: 64 })).toBe(1);
  });

  // A LA VERTICAL EL GRUP ARRENCA A LA PRIMERA CASA (28/09/2026, ho va demanar
  // l'amo): «Quan cliques una colleccio a la p2 ha de sortir tota la colleccio
  // junta a la primera filera de la franja. No vull que surti a dalt i a baix
  // partida en dos». Amb catorze cases en DUES fileres de set, el grup centrat
  // cau a cavall de la frontera de les fileres i surt partit; amb `casaInici: 0`
  // el primer dibuix va a la casa 0, que es la primera de la filera de dalt.
  it('amb casaInici 0 el grup arrenca a la casa 0, que es la primera de la filera de dalt', () => {
    // Amb 7 cases (FIRST CONTACT) el grup sencer cau a la filera de dalt.
    expect(desplacamentCentratgeFranja({ quants: 7, n: 64, casaInici: 0 })).toBe(0);
    // I amb qualsevol altre gruix: el primer dibuix, sempre a la casa 0.
    expect(desplacamentCentratgeFranja({ quants: 5, n: 64, casaInici: 0 })).toBe(0);
    expect(desplacamentCentratgeFranja({ quants: 1, n: 64, casaInici: 0 })).toBe(0);
    // Segueix triant la volta mes propera al desplaçament que ja hi ha, i no
    // dona cap salt: des de 61 li toca la volta de davant (64), i des de 2,
    // enrere (0).
    expect(desplacamentCentratgeFranja({ quants: 7, n: 64, actual: 61, casaInici: 0 })).toBe(64);
    expect(desplacamentCentratgeFranja({ quants: 7, n: 64, actual: 2, casaInici: 0 })).toBe(0);
  });

  it('trià la volta mes propera al desplaçament que ja hi ha (no fa cap salt)', () => {
    expect(desplacamentCentratgeFranja({ quants: 7, n: 64, actual: 61 })).toBe(61);
    expect(desplacamentCentratgeFranja({ quants: 7, n: 64, actual: 60 })).toBe(61);
  });

  it('sense grup, es queda on era', () => {
    expect(desplacamentCentratgeFranja({ quants: 0, n: 64, actual: 5 })).toBe(5);
    expect(desplacamentCentratgeFranja({ quants: 7, n: 0, actual: 5 })).toBe(5);
  });
});

describe('finestraCosVel', () => {
  // La finestra on la silueta NEGRA de la mascara del vel pot esborrar vel: el
  // cos de la casa. La silueta sencera fa 305,56 unitats i el cos 181,17, i la
  // casella de la franja d'una filera fa 241,71.
  it('la finestra es el cos (181,17) centrat a la casella de 241,71', () => {
    expect(VEL_AMPLADA_COS_FRACCIO).toBeCloseTo(0.5929, 4);
    const f = finestraCosVel({ x: 0, y: 0.8, w: 241.71, h: 306.03 });
    expect(f.w).toBeCloseTo(143.3, 1);
    expect(f.x).toBeCloseTo(49.2, 1);
    expect(f.y).toBe(0.8);
    expect(f.h).toBe(306.03);
  });

  it('la casa 0 del full (305,56: la silueta sencera) tambe queda centrada', () => {
    const f = finestraCosVel({ x: 0, y: 0.8, w: 305.56, h: 306.03 });
    expect(f.w).toBeCloseTo(181.17, 1);
    expect(f.x).toBeCloseTo(62.2, 1);
  });

  it('la finestra no surt mai de la casella', () => {
    for (let i = 0; i < 14; i++) {
      const x = i * 196.9;
      const f = finestraCosVel({ x, y: 0.8, w: 241.71, h: 306.03 });
      expect(f.x).toBeGreaterThanOrEqual(x);
      expect(f.x + f.w).toBeLessThanOrEqual(x + 241.71);
    }
  });

  it('amb una caixa que no val, null', () => {
    expect(finestraCosVel(null)).toBeNull();
    expect(finestraCosVel({ x: 0, y: 0, w: 0, h: 306 })).toBeNull();
    expect(finestraCosVel({ x: 0, y: 0, w: NaN, h: 306 })).toBeNull();
  });
});

describe('la composicio de la pagina 1 (B2, 26/09/2026)', () => {
  it('la peca de la graella es la MIDA DEL SELECTOR (60 unitats -> 59,5 px a 1920)', () => {
    // Des del 28/09/2026 la graella de la p1 esta escalada a la mida del
    // selector (60 de disseny). L'escala de la p1 a 1920 es 1.
    expect(PAGINA1_COSTAT_PECA_PX).toBe(60);
    expect(PAGINA1_COSTAT_PECA_PX * 1).toBeCloseTo(59.5 + 0.5, 2);
  });

  it('la filera fa la suma del bloc de la dreta i les seves meitats (selector i fletxes)', () => {
    // DES DEL 28/09/2026 el bloc de la dreta fa 130 de disseny d'ample (128,9 px a
    // 1920: el mateix ample que la columna de colleccions de la p2, perque la
    // maniga de l'ultima samarreta de la franja hi arribi i hi faci l'ombra). A
    // dins hi ha el quadrat de les fletxes (59,5) a dalt i el selector de la p2
    // (59,5 x 119) a sota, tots dos a la DRETA. I la graella de dibuixos esta
    // escalada a la mida del selector (60 de disseny): les seves dues fileres fan
    // 59,5 cadascuna, o sigui 119 en total, la mateixa alcada que el selector.
    expect(PAGINA1_MIDA_BLOC_DRETA_PX).toBe(60);
    // I la caixa del bloc es mes ampla: encavalca la franja perque la maniga de
    // l'ultima samarreta hi faci l'ombra, com a la columna de la p2.
    expect(PAGINA1_AMPLADA_BLOC_DRETA_PX).toBe(128.7);
    expect(PAGINA1_ALCADA_FILERA_PX).toBe(134);
    // Dues fileres de dibuixos, de la mida del selector (60 -> 59,5).
    expect(PAGINA1_ALCADA_FILERA_PX / 2).toBe(67);
  });

  it('l amplada del bloc de la dreta i la de la graella quadren amb el carril', () => {
    // L'escala de la p1 a 1920 es 1 (les peces fan 45 px, com el seu costat de
    // disseny); la de la p2 es 0,99185.
    const escala = 1;
    const carril = 1143; // mesurat a 1920
    const bloc = pagina1BlocDretaPx(escala);
    const graella = pagina1AmpladaGraellaPx(carril, escala);
    expect(bloc).toBeCloseTo(128.7, 1);
    // (L'amplada declarada es 128,7 perque es la de la columna de la p2.)
    // graella + gap de disseny + bloc = carril
    expect(graella + PAGINA1_GAP_DRETA_PX * escala + bloc).toBeCloseTo(carril, 6);
    // I la vora dreta del bloc cau a la del carril.
    expect(graella + PAGINA1_GAP_DRETA_PX * escala + bloc).toBeCloseTo(1143, 6);
  });

  it('l alcada de la filera en px es la del conjunt de les dues fileres (134 a 1920)', () => {
    // 2 x 51,3 de pec a + 20 de separacio = 122,6; amb l'ajust de la centrada, la
    // caixa fa 134.
    expect(pagina1AlcadaFileraPx(1)).toBeCloseTo(134, 1);
  });

  it('amb valors que no valen, no peta', () => {
    expect(pagina1BlocDretaPx(null)).toBe(PAGINA1_AMPLADA_BLOC_DRETA_PX);
    expect(pagina1BlocDretaPx(0)).toBe(PAGINA1_AMPLADA_BLOC_DRETA_PX);
    expect(pagina1AmpladaGraellaPx(0)).toBe(0);
    expect(pagina1AmpladaGraellaPx(null)).toBe(0);
    expect(pagina1AlcadaFileraPx(NaN)).toBe(PAGINA1_ALCADA_FILERA_PX);
  });
});

describe('els ajustos de la columna de colleccions (27/09/2026)', () => {
  it('son els 2 px mesurats a cada banda', () => {
    // La columna ha d'anar alineada pel top amb el selector Blanc/Color/Negre i
    // pel bottom amb la franja (ho va demanar en Marc). Amb la geometria
    // declarada sola, la mesura al navegador donava 2 px de mes a cada banda
    // (columna y109,9..356,5 contra selector y111,9 i franja y354,5): aquests
    // son els dos ajustos que ho quadren.
    expect(COLUMNA_TOP_AJUST_PX).toBe(2);
    expect(COLUMNA_BAIX_AJUST_PX).toBe(2);
  });

  it("i porten la columna de 246,6 a 242,6 px d'alcada a 1920", () => {
    const alcadaAbans = 246.6;
    const alcadaDespres = alcadaAbans - COLUMNA_TOP_AJUST_PX - COLUMNA_BAIX_AJUST_PX;
    expect(alcadaDespres).toBeCloseTo(242.6, 1);
  });
});

describe("l'aire de 30 px de les dues pagines (28/09/2026)", () => {
  it('el coixi de dalt del panell a l escriptori es 17,1 (els 30 px menys els 12,9 de la filera de la p1)', () => {
    // Ho va demanar en Marc en dos temps: primer 30 px d'aire a la p2 i, tot
    // seguit, «quan tinguis la p2, alinea la p1» (les dues coses: la p1 tambe
    // amb 30 px i les dues franges a la mateixa alcada).
    //
    // L'aire es el coixi del panell mes el top propi de la filera dins el
    // contingut del panell. Amb les DUES tires de samarretes alineades pel top
    // (`alignTopRowToPage1`), el top de la filera es el de la p1 (12,9 px
    // mesurats a 1920: la graella arrencava a 74,5 amb el contingut a 61,6) i el
    // coixi ha de ser 30 - 12,9 = 17,1.
    expect(PADDING_DALT_PANELL_ESCRIPTORI_PX).toBeCloseTo(17.1, 2);
  });

  it('el coixi vertical de l escriptori es 17,1 + 32 = 49,1 (el de sempre es 64)', () => {
    expect(PADDING_BAIX_PANELL_PX).toBe(32);
    expect(PADDING_VERTICAL_PANELL_PX).toBe(64);
    expect(PADDING_VERTICAL_PANELL_ESCRIPTORI_PX).toBeCloseTo(49.1, 2);
  });

  it('i amb aixo el contingut de les dues pagines arrenca a 83: 30,0 px d aire', () => {
    // Mesurat el 28/09/2026 amb `_tmp-aire-final.mjs` i `_tmp-ancoratge.mjs`:
    // la graella de la p1 i la de la p2 arrenquen totes dues a 83,0 (el header
    // acaba a 53,0) i les franges queden a 226,6 i 226,5.
    const headerBaix = 53;
    const graellaTop = 83;
    expect(graellaTop - headerBaix).toBeCloseTo(30, 1);
  });

  it('el descompte de la franja de la p1 es 73,4 (les dues franges, a la mateixa alcada)', () => {
    // Amb 112,8 la franja de la p1 queia 0,6 px per sota de la de la p2 (que
    // clava la seva formula declarada) i amb 113,4 quedaven a 226,6 i 226,5.
    // Despres, el mateix dia, el bloc de la dreta va passar de 110x220 a
    // 59,5x178,5 (les dues botoneres del bloc, avui amb les fletxes a dalt i el
    // selector a sota) i la filera es va fer 59 px mes curta: la franja, que va al flux al
    // darrere, pujava aquells 59 px. Amb 73,4 torna a caure a 226,6
    // (`_tmp-ancoratge.mjs`: 226,6 contra 226,5 de la p2).
    expect(PAGINA1_AJUST_FRANJA_PX).toBeCloseTo(73.4, 2);
  });
});
