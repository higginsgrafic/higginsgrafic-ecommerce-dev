import { describe, it, expect } from 'vitest';
import {
  carrilDeFinestra,
  ampladaFilaFranja,
  ampladaRetallGraella,
  alcadaSelector,
  alcadaCellaSelector,
  alcadaCarruselGraella,
  centratgeSelectorY,
  desplacTopSelector,
  desnivellsLiniesGraella,
  desnivellColorsGraella,
  margeBaixFletxesGraella,
  ampladaColumnaGraella,
  GRAELLA_DRETA_FLETXES_CARRIL_PX,
  FRANJA_FITXER_AMPLADA,
  FRANJA_FITXER_ALCADA,
  FRANJA_FITXER_ASPECTE,
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
  it('quadra amb el retall mesurat a les quatre finestres d\'escriptori', () => {
    // Mesurat al navegador (`getBoundingClientRect` del retall): 863,94 /
    // 674,36 / 641,17 / 1160,89. El component en consumeix el `clientWidth`
    // (enter), que es el que ha de coincidir exactament.
    expect(ampladaRetallGraella(1905, 946)).toBe(864);
    expect(ampladaRetallGraella(1497, 900)).toBe(674);
    expect(ampladaRetallGraella(1425, 800)).toBe(641);
    expect(ampladaRetallGraella(2545, 1306)).toBe(1161);
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

  it("a 1920 dona 8,76 (el DOM n'aplicava 8,78)", () => {
    expect(colorsA(1143, 120, 1339 / 1350, 29.7556, 2.9756, true, 8 * (29.7556 / 30))).toBeCloseTo(8.76, 1);
  });

  it("a 1440 dona 9,03 (el DOM, 9,02)", () => {
    expect(colorsA(855, 120, 1002 / 1350, 22.2667, 2.2267, true, 8 * (22.2667 / 30))).toBeCloseTo(9.03, 1);
  });

  it("a 2560 dona 8,42 (el DOM, 8,44)", () => {
    expect(colorsA(1527, 120, 1789 / 1350, 39.7556, 3.9756, true, 8 * (39.7556 / 30))).toBeCloseTo(8.42, 1);
  });

  it("a 1366x768 (tauleta) dona 1,44 (el DOM, 1,45)", () => {
    expect(colorsA(811, 112.8, 1, 31.343 / 1.5, 3.98, false, 6 * 0.995)).toBeCloseTo(1.44, 1);
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
