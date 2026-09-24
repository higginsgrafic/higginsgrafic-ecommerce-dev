import { describe, it, expect } from 'vitest';
import { deviceLayoutFromViewport } from '@/utils/layoutModel.js';

/**
 * LA CLASSIFICACIO DE DISPOSITIU, FIXADA.
 *
 * Fins avui no hi havia cap prova d'aixo, i la regla estava escrita DUES
 * vegades (al hook i al model). Aquestes proves fixen la matriu nova i, sobretot,
 * fixen **els 48 formats del desplegament**: es la manera que cap aparell torni
 * a quedar-se sense classe, que es el forat que hi havia entre 600 i 767 px
 * d'amplada en apaïsat.
 *
 * Les finestres son les que veu la pagina (pantalla menys el navegador), les
 * mateixes de `scripts/mesura-formats.mjs` i de
 * `docs/informes/PLA-estructura-general-dispositius.md`.
 */

/** El nom de la classe d'una finestra. Canta si no n'hi ha exactament una. */
function classeDe(vw, vh) {
  const d = deviceLayoutFromViewport(vw, vh);
  const actives = [d.isMobile, d.isPortraitTablet, d.isLandscapeTablet, d.isDesktop].filter(Boolean);
  if (actives.length !== 1) return `ni una ni l'altra (${actives.length})`;
  if (d.isMobile) return 'mobil';
  if (d.isPortraitTablet) return 'tauleta vertical';
  if (d.isLandscapeTablet) return 'tauleta apaissada';
  return 'escriptori';
}

const FORMATS = [
  // Telefons, vertical
  ['Android 16:9 360', 360, 508, 'mobil'],
  ['Android 20:9 360', 360, 648, 'mobil'],
  ['iPhone SE/8', 375, 535, 'mobil'],
  ['Android 384', 384, 700, 'mobil'],
  ['iPhone 12/13/14', 390, 712, 'mobil'],
  ['iPhone 15/16', 393, 720, 'mobil'],
  ['iPhone 16 Pro/17', 402, 742, 'mobil'],
  ['Pixel 8/9/10', 412, 783, 'mobil'],
  ['iPhone 15 Plus/PM', 430, 800, 'mobil'],
  ['iPhone 16/17 PM', 440, 824, 'mobil'],
  // Telefons, apaïsat
  ['Android 16:9 apaïsat', 640, 310, 'mobil'],
  ['Android 20:9 apaïsat', 780, 310, 'tauleta apaissada'],
  ['iPhone SE/8 apaïsat', 667, 325, 'mobil'],
  ['Android 384 apaïsat', 832, 334, 'tauleta apaissada'],
  ['iPhone 12/13/14 apaïsat', 844, 340, 'tauleta apaissada'],
  ['iPhone 15/16 apaïsat', 852, 343, 'tauleta apaissada'],
  ['Pixel apaïsat', 915, 362, 'tauleta apaissada'],
  ['iPhone 15 Plus apaïsat', 932, 380, 'tauleta apaissada'],
  // Tauletes, vertical
  ['Galaxy Tab S9', 533, 781, 'mobil'],
  ['Galaxy Tab S9+', 584, 862, 'mobil'],
  ['Huawei MatePad Pro 12.2', 613, 909, 'tauleta vertical'],
  ['Galaxy Tab S9 Ultra', 616, 952, 'tauleta vertical'],
  ['Huawei MatePad Pro 13.2', 640, 952, 'tauleta vertical'],
  ['iPad mini 6', 744, 1061, 'tauleta vertical'],
  ['iPad 10.2', 768, 952, 'tauleta vertical'],
  ['iPad Air 11', 820, 1108, 'tauleta vertical'],
  ['iPad Pro 11', 834, 1122, 'tauleta vertical'],
  ['iPad Air 13', 1024, 1294, 'tauleta vertical'],
  ['iPad Pro 13', 1032, 1304, 'escriptori'],
  // Tauletes, apaïsat
  ['Galaxy Tab S9 apaïsada', 853, 455, 'tauleta apaissada'],
  ['Galaxy Tab S9+ apaïsada', 934, 506, 'tauleta apaissada'],
  ['MatePad 12.2 apaïsada', 981, 535, 'tauleta apaissada'],
  ['Tab S9 Ultra apaïsada', 1024, 538, 'tauleta apaissada'],
  ['MatePad 13.2 apaïsada', 1024, 562, 'tauleta apaissada'],
  ['iPad mini apaïsada', 1133, 666, 'tauleta apaissada'],
  ['iPad 10.2 apaïsada', 1024, 690, 'tauleta apaissada'],
  ['iPad Air 11 apaïsada', 1180, 742, 'tauleta apaissada'],
  ['iPad Pro 11 apaïsada', 1194, 756, 'tauleta apaissada'],
  ['iPad Air 13 apaïsada', 1366, 946, 'tauleta apaissada'],
  ['iPad Pro 13 apaïsada', 1376, 954, 'escriptori'],
  // Portàtils i escriptori
  ['Portàtil 1280', 1280, 666, 'tauleta apaissada'],
  ['Portàtil 1366', 1366, 634, 'tauleta apaissada'],
  ['Portàtil 1440', 1440, 766, 'escriptori'],
  ['Portàtil 1512', 1512, 848, 'escriptori'],
  ['Portàtil 1536', 1536, 890, 'escriptori'],
  ['Portàtil 1728', 1728, 983, 'escriptori'],
  ['Escriptori 1920', 1920, 946, 'escriptori'],
  ['Escriptori 2560', 2560, 1306, 'escriptori'],
];

describe('la classificació de dispositiu', () => {
  it('dona una classe als 48 formats del desplegament', () => {
    expect(FORMATS).toHaveLength(48);
    for (const [nom, w, h, esperada] of FORMATS) {
      expect(`${nom}: ${classeDe(w, h)}`).toBe(`${nom}: ${esperada}`);
    }
  });

  it('la matriu es total i disjunta a totes les mides', () => {
    for (let w = 240; w <= 2600; w += 7) {
      for (let h = 200; h <= 1700; h += 11) {
        const d = deviceLayoutFromViewport(w, h);
        const actives = [d.isMobile, d.isPortraitTablet, d.isLandscapeTablet, d.isDesktop]
          .filter(Boolean).length;
        expect({ w, h, actives }).toEqual({ w, h, actives: 1 });
      }
    }
  });

  it("un telefon girat de 600 a 767 px es mobil, no un forat", () => {
    // Eren els dos formats sense cap classe: la branca per defecte de
    // `headerHeightFor` els reservava 80 px i no eren res.
    expect(classeDe(640, 310)).toBe('mobil');
    expect(classeDe(667, 325)).toBe('mobil');
    expect(classeDe(767, 400)).toBe('mobil');
  });

  it('les fronteres son les que diu el paper', () => {
    expect(classeDe(599, 900)).toBe('mobil');
    expect(classeDe(600, 900)).toBe('tauleta vertical');
    expect(classeDe(768, 400)).toBe('tauleta apaissada');
    expect(classeDe(1024, 1300)).toBe('tauleta vertical');
    expect(classeDe(1025, 1300)).toBe('escriptori');
    expect(classeDe(1366, 800)).toBe('tauleta apaissada');
    expect(classeDe(1367, 800)).toBe('escriptori');
    // L'alcada de 1100 separa tauleta apaissada de monitor.
    expect(classeDe(1200, 1100)).toBe('tauleta apaissada');
    expect(classeDe(1200, 1101)).toBe('escriptori');
    // Una finestra quadrada (que no es dona) cau a escriptori.
    expect(classeDe(800, 800)).toBe('escriptori');
  });

  it('les dues tauletes que cauen a mobil ho fan per amplada', () => {
    // Documentat: el Tab S9 i el S9+ reben el disseny de telefon.
    expect(classeDe(533, 781)).toBe('mobil');
    expect(classeDe(584, 862)).toBe('mobil');
    // I el seu vein, el MatePad de 613, ja es tauleta vertical.
    expect(classeDe(613, 909)).toBe('tauleta vertical');
  });

  it('les mides impossibles no diuen que si', () => {
    for (const [w, h] of [[0, 0], [-100, 800], [800, 0], [NaN, NaN], [undefined, undefined]]) {
      const d = deviceLayoutFromViewport(w, h);
      expect(d.isMobile).toBe(false);
      expect(d.isPortraitTablet).toBe(false);
      expect(d.isLandscapeTablet).toBe(false);
      expect(d.isDesktop).toBe(true);
    }
  });
});
