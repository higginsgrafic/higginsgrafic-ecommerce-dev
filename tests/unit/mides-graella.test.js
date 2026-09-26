import { describe, it, expect } from 'vitest';
import {
  midesGraellaCompacta, midaDibuix, gapHorizontal, colorPas,
  GRAELLA_COLUMNES, GRAELLA_FILES, GRAELLA_MARGE_FRANJA,
  BLOC_DRETA_DIBUIXOS_ESCRIPTORI_PX, MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX,
  MARGE_DRET_FILERA_ESCRIPTORI_PX,
} from '../../src/components/fullwide/midesGraella.js';
import { deltaObjectiuPageLift, alcadaPanellMegaslide, desplacamentFranjaEscriptori } from '../../src/utils/mesuraMegaslide.js';

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

  it("si la columna és més estreta que la referència, primer s'encongeixen les separacions", () => {
    // 798 px és el que té la columna de la graella a 1280x706. El dibuix es
    // queda a la seva mida de disseny escalada amb el carril (30) i el que es
    // comprimeix són els gaps: és el que evita que, a 1440/1280, la columna de
    // col·leccions caigui sobre la graella de colors.
    const m = midesGraellaCompacta({ ampleAmple: 798, sostre: 400, daltGraella: 100 });
    expect(m.dibuix).toBeCloseTo(30, 5);
    expect(m.gapH).toBeCloseTo((798 - GRAELLA_COLUMNES * 30) / (GRAELLA_COLUMNES - 1), 5);
    // El pas vertical no pot ser més gran que la separació horitzontal.
    expect(m.gapV).toBeLessThanOrEqual(m.gapH);
  });

  it("si l'alçada no hi cap, primer es redueix el pas vertical (fins a 0)", () => {
    const ample = 798;
    // Amb els dibuixos a 30, les quatre files fan 120 px i el pas dels cercles
    // (3) en demana 9 més. Amb 126 px d'espai el pas s'ha d'encongir, però el
    // dibuix no s'ha de tocar.
    const m = midesGraellaCompacta({ ampleAmple: ample, sostre: 228, daltGraella: 100 });
    expect(m.gapV).toBeGreaterThanOrEqual(0);
    expect(m.gapV).toBeLessThan(3);
    expect(alçadaGraella(m)).toBeLessThanOrEqual(228 - 100 - GRAELLA_MARGE_FRANJA + 0.001);
    // El dibuix no s'ha de tocar: és el mateix que sense límit d'alçada.
    const senseLimit = midesGraellaCompacta({ ampleAmple: ample, sostre: 400, daltGraella: 100 });
    expect(m.dibuix).toBeCloseTo(senseLimit.dibuix, 5);
  });

  it("si encara no hi cap, es redueix el dibuix i el pas queda a 0", () => {
    const m = midesGraellaCompacta({ ampleAmple: 798, sostre: 150, daltGraella: 100 });
    expect(m.gapV).toBe(0);
    expect(alçadaGraella(m)).toBeLessThanOrEqual(150 - 100 - GRAELLA_MARGE_FRANJA + 0.001);
  });

  it('sense sostre (franja no mesurada) el pas vertical ja és el dels cercles', () => {
    // El pas alineat (`dibuix + gapV` = el pas dels cercles) NO depèn de cap
    // mesura de la pantalla, o sigui que es pot declarar des del primer pintat.
    // Abans, sense sostre, queia al pas de reserva (3 × 30/50 = 1,8): la graella
    // naixia amb el retall 23 px curt i la segona filera de dibuixos i la tira de
    // colors feien un salt en obrir el megaslide (mesurat a 1920 el 25/09/2026).
    // El que SÍ que necessita la franja és la DEDUCCIÓ (les proves de dalt).
    const m = midesGraellaCompacta({ ampleAmple: 798, sostre: null, daltGraella: 100 });
    expect(m.dibuix).toBeCloseTo(30, 5);
    expect(m.gapV).toBeCloseTo(colorPas(false, false) - m.dibuix, 5);
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

describe('centratge del conjunt de la pagina 2', () => {
  // El que ha de quedar centrat dins el carril es el conjunt (selector ->
  // llista de col·leccions), no els dibuixos: a la dreta dels dibuixos hi ha la
  // columna de colors i la llista, que sumen 240 px.
  it('la filera i el bloc de la dreta deixen el carril quadrat', () => {
    expect(MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX + BLOC_DRETA_DIBUIXOS_ESCRIPTORI_PX
      + MARGE_DRET_FILERA_ESCRIPTORI_PX).toBeLessThanOrEqual(1350);
  });

  it('el bloc de la dreta és la columna de colors i la llista més les separacions', () => {
    // 78 de cercles + 10 + 142 de llista + 10.
    expect(BLOC_DRETA_DIBUIXOS_ESCRIPTORI_PX).toBe(78 + 10 + 142 + 10);
  });

  it('al carril de 1350 la composicio encaixa a la franja central del header', () => {
    const carril = 1350;
    const ampleDibuixos = carril - MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX
      - BLOC_DRETA_DIBUIXOS_ESCRIPTORI_PX - MARGE_DRET_FILERA_ESCRIPTORI_PX;
    // La columna dels dibuixos queda una mica mes estreta que el contingut de
    // la graella (875 px): els dibuixos no s'encongirien perque el factor
    // d'amplada esta limitat a 1.
    expect(ampleDibuixos).toBeCloseTo(894.5, 1);
    expect(ampleDibuixos).toBeGreaterThanOrEqual(875);
    // El marge esquerre de la filera es mes gran que el de la franja: qui
    // arrenca a la franja del header es el selector (40 px de disseny).
    expect(MARGE_ESQUERRA_DIBUIXOS_ESCRIPTORI_PX).toBeGreaterThan(40);
    // La llista s'enrasa a la dreta de la seva columna, aixi que el marge dret
    // de la composicio es exactament el de la filera: el coixi del header.
    expect(MARGE_DRET_FILERA_ESCRIPTORI_PX).toBe(40);
  });
});

describe('deltaObjectiuPageLift', () => {
  // El càlcul vivia dins de l'efecte de MegaStripePanelP1. La regla: el
  // selector ha de quedar `desplaçament` px sota el capdamunt del panell
  // (10 px a la banda estreta i a les tauletes; 20 px mes de marge demanat,
  // nomes a la banda estreta de desktop).
  it("a la banda estreta de desktop l'objectiu és 20 px (els 20 del marge)", () => {
    const delta = deltaObjectiuPageLift({ selectorTop: 200, panelTop: 140, ample: 1280, alt: 706 });
    expect(delta).toBe(60 - 20);
  });

  it("a la banda estreta, si s'hi passa esTauleta, es queda amb el desplaçament de 10", () => {
    // 1024x768 compleix «ample >= alt» com la banda estreta, pero es tauleta:
    // no ha de portar el marge extra de 20 px.
    const delta = deltaObjectiuPageLift({ selectorTop: 200, panelTop: 140, ample: 1024, alt: 768, esTauleta: true });
    expect(delta).toBe(60 - 10);
  });

  it('a desktop ample el desplaçament també és 20', () => {
    // El contingut baixa els mateixos 20 px a tot l'escriptori.
    const delta = deltaObjectiuPageLift({ selectorTop: 200, panelTop: 140, ample: 1440, alt: 900 });
    expect(delta).toBe(60 - 20);
  });

  it('la tauleta vertical tambe es queda amb 10', () => {
    const delta = deltaObjectiuPageLift({ selectorTop: 200, panelTop: 140, ample: 768, alt: 1024, esTauleta: true });
    // 768x1024 no compleix «ample >= alt», aixi que bandaEstreta es falsa; pero
    // el desplacament de les tauletes es 10.
    expect(delta).toBe(60 - 10);
  });

  it('retorna el desnivell menys el desplaçament', () => {
    // selector 10 px sota el panell: a tot l'escriptori el desplaçament és 20.
    expect(deltaObjectiuPageLift({ selectorTop: 150, panelTop: 140, ample: 1440, alt: 900 })).toBe(-10);
    expect(deltaObjectiuPageLift({ selectorTop: 150, panelTop: 140, ample: 1280, alt: 706 })).toBe(-10);
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

describe('desplacamentFranjaEscriptori', () => {
  // La franja baixa els 20 px del marge afegit a la pestanya, a tot
  // l'escriptori; a les tauletes i al mobil, 0.
  it('a la banda estreta també és 20', () => {
    // La franja baixa els mateixos 20 px que la resta del contingut.
    expect(desplacamentFranjaEscriptori({ ample: 1280, alt: 768 })).toBe(20);
    expect(desplacamentFranjaEscriptori({ ample: 1366, alt: 768 })).toBe(20);
  });

  it("a l'escriptori ample és 20", () => {
    expect(desplacamentFranjaEscriptori({ ample: 1440, alt: 900 })).toBe(20);
    expect(desplacamentFranjaEscriptori({ ample: 1920, alt: 1080 })).toBe(20);
  });

  it('a les tauletes és 0', () => {
    expect(desplacamentFranjaEscriptori({ ample: 1024, alt: 768, esTauleta: true })).toBe(0);
    expect(desplacamentFranjaEscriptori({ ample: 768, alt: 1024, esTauleta: true })).toBe(0);
  });

  it('al mobil és 0', () => {
    expect(desplacamentFranjaEscriptori({ ample: 500, alt: 800 })).toBe(0);
  });
});
