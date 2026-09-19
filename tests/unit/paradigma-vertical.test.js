import { describe, it, expect } from 'vitest';
import {
  CARRIL_TAULETA_PX,
  COIXI_CARRIL_PX,
  FRANJA_COLUMNES,
  FRANJA_FILES,
  FRANJA_TILES,
  GAP_COLUMNES_PX,
  GAP_FRANJA_PX,
  GAP_FRANJA_VERTICAL_PX,
  GRAELLA_FILES_VERTICAL,
  alcadaFilaGraella,
  alcadaFranjaVertical,
  alcadaGraellaVertical,
  ampladaCarrilVertical,
  casellaFranjaVertical,
  columnesVertical,
  midesVertical,
} from '../../src/components/fullwide/paradigmaVertical.js';

/**
 * Aquesta prova existeix perquè les mides de la composició vertical del
 * megaslide (seccions 29-32 del testimoni) són el contracte amb l'amo:
 *   - la graella de dibuixos fa CINC files (una per col·lecció);
 *   - la franja són 14 samarretes en 2 x 7, totes quadrades i sense scroll;
 *   - tot surt de l'amplada del carril, que a 768 és 768 - 2 x 40 = 688.
 *
 * Sense això, qualsevol canvi de proporcions tornaria a ser a cegues.
 */
describe('paradigma vertical: el carril', () => {
  it("a 768 la finestra no dona els 992 de la tauleta i el carril es queda amb els coixos", () => {
    expect(ampladaCarrilVertical(768)).toBe(768 - 2 * COIXI_CARRIL_PX);
    expect(ampladaCarrilVertical(768)).toBe(688);
  });

  it('mai no passa de la referencia de tauleta ni de la finestra', () => {
    expect(ampladaCarrilVertical(1024)).toBeCloseTo(CARRIL_TAULETA_PX, 6);
    expect(ampladaCarrilVertical(1600)).toBeCloseTo(CARRIL_TAULETA_PX, 6);
    expect(ampladaCarrilVertical(400)).toBe(400 - 2 * COIXI_CARRIL_PX);
    expect(ampladaCarrilVertical(0)).toBeGreaterThanOrEqual(0);
  });

  it('les tres columnes reparteixen el carril descomptant les separacions', () => {
    const carril = 688;
    const { colleccions, botons, franja } = columnesVertical(carril);
    expect(colleccions + botons + franja + 2 * GAP_COLUMNES_PX).toBeCloseTo(carril, 6);
    // 19 / 15 / 63 de la maqueta: la llista de colleccions es mes ampla que la
    // columna dels botons, i la franja s'emporta mes de la meitat del carril.
    expect(colleccions).toBeGreaterThan(botons);
    expect(botons).toBeLessThan(franja);
    expect(franja / carril).toBeGreaterThan(0.55);
  });
});

describe('paradigma vertical: la graella de dibuixos', () => {
  it('te cinc files, una per colleccio', () => {
    expect(GRAELLA_FILES_VERTICAL).toBe(5);
  });

  it("cada fila fa l'amplada del carril en 16 caselles quadrades", () => {
    const carril = 688;
    const alcadaFila = alcadaFilaGraella(carril);
    const alcadaGraella = alcadaGraellaVertical(carril);
    expect(alcadaGraella).toBeCloseTo(alcadaFila * GRAELLA_FILES_VERTICAL, 6);
    // 16 caselles + 15 separacions = carril, i la casella es quadrada.
    const casella = (carril - 15 * 6) / 16;
    expect(casella).toBeCloseTo(alcadaFila - 6, 6);
  });

  it("la fila creix amb el carril i no te cap numero fix", () => {
    expect(alcadaFilaGraella(688)).toBeGreaterThan(alcadaFilaGraella(500));
    expect(alcadaFilaGraella(0)).toBe(0);
  });
});

describe('paradigma vertical: la franja', () => {
  it('son 14 samarretes en 2 files de 7', () => {
    expect(FRANJA_FILES).toBe(2);
    expect(FRANJA_COLUMNES).toBe(7);
    expect(FRANJA_TILES).toBe(14);
  });

  it('la casella es quadrada i les set caben a la columna', () => {
    const ampleFranja = 439;
    const casella = casellaFranjaVertical(ampleFranja);
    expect(casella * FRANJA_COLUMNES + (FRANJA_COLUMNES - 1) * GAP_FRANJA_PX).toBeCloseTo(ampleFranja, 6);
    const alcada = alcadaFranjaVertical(ampleFranja);
    expect(alcada).toBeCloseTo(casella * 2 + GAP_FRANJA_VERTICAL_PX, 6);
  });
});

describe('paradigma vertical: el conjunt a 768', () => {
  it('dona les mides que s’han comprovat al navegador', () => {
    const m = midesVertical(768);
    expect(m.carril).toBe(688);
    expect(Math.round(m.alcadaFranja)).toBe(123);
    expect(m.alcadaGraella).toBeGreaterThan(200);
    expect(m.alcadaGraella).toBeLessThan(260);
  });
});
