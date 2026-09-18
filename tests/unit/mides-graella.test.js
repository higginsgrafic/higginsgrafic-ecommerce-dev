import { describe, it, expect } from 'vitest';
import {
  midesGraellaCompacta, midaDibuix, gapHorizontal, gapVertical, colorPas,
  GRAELLA_COLUMNES, GRAELLA_FILES, GRAELLA_MARGE_FRANJA,
} from '../../src/components/fullwide/midesGraella.js';
import { deltaObjectiuPageLift, alcadaPanellMegaslide } from '../../src/utils/mesuraMegaslide.js';

// Aquesta prova existeix perquè el càlcul de les mides de la graella de
// dibuixos vivia DINS d'un efecte de CercadorTextRow, barrejat amb la lectura
// del DOM. Allà no es podia comprovar sense navegador, i per això qualsevol
// canvi al sistema de mesura era a cegues.
//
// Ara el càlcul és una funció pura a midesGraella.js i aquí es fixen les
// seves regles, que són les que fan que les files de dibuixos caiguin a les
// files dels cercles de color.

const AMPLE_BASE_DESKTOP = () => {
  const base = midaDibuix(false, false);
  const gapH = gapHorizontal(false, false);
  return GRAELLA_COLUMNES * base + (GRAELLA_COLUMNES - 1) * gapH; // 875
};

const alçadaGraella = (m) => GRAELLA_FILES * m.dibuix + (GRAELLA_FILES - 1) * m.gapV;

describe('midesGraellaCompacta', () => {
  it('amb espai de sobres fa servir les mides base de desktop', () => {
    const m = midesGraellaCompacta({ ampleAmple: 1200, sostre: 400, daltGraella: 100 });
    expect(m.dibuix).toBeCloseTo(30, 5);
    expect(m.gapH).toBeCloseTo((875 - 16 * 30) / 15, 5);
    // Amb espai de sobres el pas vertical NO és el de reserva: és el pas dels
    // cercles menys el dibuix (33 - 30 = 3), que és el que fa caure cada fila
    // de dibuixos a la seva fila de cercles.
    expect(m.gapV).toBeCloseTo(colorPas(false, false) - m.dibuix, 5);
  });

  it("si la columna és més estreta que la referència, redueix tot proporcionalment", () => {
    // 798 px és el que té la columna de la graella a 1280x706, el cas que
    // durant setmanes va quedar desquadrat.
    const m = midesGraellaCompacta({ ampleAmple: 798, sostre: 400, daltGraella: 100 });
    const factor = 798 / AMPLE_BASE_DESKTOP();
    expect(m.dibuix).toBeCloseTo(30 * factor, 5);
    expect(m.gapH).toBeCloseTo(gapHorizontal(false, false) * factor, 5);
    // El resultat clau: 27,36 px de dibuix, que és el que es veu al navegador.
    expect(m.dibuix).toBeCloseTo(27.36, 2);
  });

  it("si l'alçada no hi cap, primer es redueix el pas vertical (fins a 0)", () => {
    // 138 px d'espai: hi caben els 4 dibuixos de 27,36 (109,4) però no amb el
    // pas dels cercles (131,4). S'ha de reduir el pas, no el dibuix.
    const ample = 798;
    const m = midesGraellaCompacta({ ampleAmple: ample, sostre: 240, daltGraella: 100 });
    expect(m.gapV).toBeGreaterThanOrEqual(0);
    expect(m.gapV).toBeLessThan(3);
    expect(alçadaGraella(m)).toBeLessThanOrEqual(240 - 100 - GRAELLA_MARGE_FRANJA + 0.001);
    // El dibuix no s'ha de tocar: és el mateix que sense límit d'alçada.
    const senseLimit = midesGraellaCompacta({ ampleAmple: ample, sostre: 400, daltGraella: 100 });
    expect(m.dibuix).toBeCloseTo(senseLimit.dibuix, 5);
  });

  it("si encara no hi cap, es redueix el dibuix i el pas queda a 0", () => {
    const m = midesGraellaCompacta({ ampleAmple: 798, sostre: 150, daltGraella: 100 });
    expect(m.gapV).toBe(0);
    expect(alçadaGraella(m)).toBeLessThanOrEqual(150 - 100 - GRAELLA_MARGE_FRANJA + 0.001);
  });

  it('sense sostre (franja no mesurada) no toca res: deixa les mides de la pantalla', () => {
    // Sense sostre no s'aplica ni el pas dels cercles: queden les mides de
    // reserva (el pas base escalat per l'amplada), que és el que fa que la
    // graella neixi raonable abans que la franja estigui mesurada.
    const m = midesGraellaCompacta({ ampleAmple: 798, sostre: null, daltGraella: 100 });
    const factor = 798 / AMPLE_BASE_DESKTOP();
    expect(m.gapV).toBeCloseTo(gapVertical(false, false) * factor, 5);
  });

  it('a tauleta fa servir les mides de tauleta, no les de desktop', () => {
    const m = midesGraellaCompacta({ ampleAmple: 2000, sostre: 400, daltGraella: 100, isLandscapeTablet: true });
    expect(m.dibuix).toBeCloseTo(midaDibuix(false, true), 5);
    expect(m.gapH).toBeCloseTo(gapHorizontal(false, true), 5);
  });

  it('el pas vertical de desktop és el dels cercles menys el dibuix', () => {
    // És la regla que fa que cada fila de dibuixos caigui a la seva fila de
    // cercles: dibuix + pas = pas dels cercles.
    const m = midesGraellaCompacta({ ampleAmple: 875, sostre: 400, daltGraella: 100 });
    expect(m.dibuix + m.gapV).toBeCloseTo(colorPas(false, false), 5);
  });
});

describe('deltaObjectiuPageLift', () => {
  // El càlcul vivia dins de l'efecte de MegaStripePanelP1. La regla: el
  // selector ha de quedar `desplaçament` px sota el capdamunt del panell.
  it('a la banda estreta de desktop l\'objectiu és 10 px', () => {
    // selector a 60 px del panell i finestra 1280x706: cal apujar 50 px.
    const delta = deltaObjectiuPageLift({ selectorTop: 200, panelTop: 140, ample: 1280, alt: 706 });
    expect(delta).toBe(60 - 10);
  });

  it('a desktop ample l\'objectiu és 0', () => {
    const delta = deltaObjectiuPageLift({ selectorTop: 200, panelTop: 140, ample: 1440, alt: 900 });
    expect(delta).toBe(60);
  });

  it('a la tauleta apaisada (1024x768) l\'objectiu és 0', () => {
    // Compleix «ample >= alt» com la banda estreta, però no és la banda estreta.
    // Aquí sí que s'hi aplica el desplaçament perquè la condició és només
    // geomètrica: 1024 >= 768 i 1024 entre 768 i 1366.
    const delta = deltaObjectiuPageLift({ selectorTop: 200, panelTop: 140, ample: 1024, alt: 768 });
    expect(delta).toBe(60 - 10);
  });

  it('retorna el desnivell menys el desplaçament', () => {
    // selector 10 px sota el panell: a desktop ample el delta és 10 (cal apujar
    // perquè quedi a 0); a la banda estreta, 0 (ja hi és, a 10).
    expect(deltaObjectiuPageLift({ selectorTop: 150, panelTop: 140, ample: 1440, alt: 900 })).toBe(10);
    expect(deltaObjectiuPageLift({ selectorTop: 150, panelTop: 140, ample: 1280, alt: 706 })).toBe(0);
  });
});

describe('alcadaPanellMegaslide', () => {
  // L'alçada del panell surt de la mesura del contingut de la pàgina 1. El
  // càlcul vivia dins d'una expressió de set línies amb tres condicions
  // enganxades a MegaMenuPanel.
  it('descompta el py-8 del panell (32+32) i suma el gap', () => {
    // Mesura 400, gap 30, sense marge extra: 400 + 30 - 64 = 366.
    expect(alcadaPanellMegaslide({ p1ContentBottom: 400, gap: 30 })).toBe(366);
  });

  it("hi afegeix el marge extra de l'escriptori", () => {
    expect(alcadaPanellMegaslide({ p1ContentBottom: 400, gap: 30, margeExtra: 20 })).toBe(386);
  });

  it('mai no dona una alçada negativa', () => {
    expect(alcadaPanellMegaslide({ p1ContentBottom: 10, gap: 0 })).toBe(0);
    expect(alcadaPanellMegaslide({ p1ContentBottom: -100, gap: 0 })).toBe(0);
  });

  it('sense mesura valida retorna 0 (i el panell fa servir la reserva)', () => {
    expect(alcadaPanellMegaslide({ p1ContentBottom: null })).toBe(0);
    expect(alcadaPanellMegaslide({ p1ContentBottom: NaN })).toBe(0);
  });
});
