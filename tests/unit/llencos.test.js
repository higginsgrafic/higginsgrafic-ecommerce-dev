import { describe, it, expect } from 'vitest';
import {
  LLENC_AMPLADA,
  LLENC_GAP_Y,
  LLENCOS,
  filaEnUnitats,
  filaAlcadaCoef,
  filaGapCoef,
  MEGASLIDE_ALCADA_REFERENCIA,
  CERCADOR_MOCKUP_PX,
  CALIBRADORS_PENDENTS,
} from '@/config/llencos.js';

/**
 * Aquestes proves fixen EL LLENÇ, no el codi.
 *
 * Els coeficients que governen la geometria del lloc s'han escrit a mà durant
 * mesos, i cada còpia ha derivat una mica. Aquí es fixa el valor derivat del
 * llenç, que és l'únic que no pot derivar, i es comprova contra els números
 * que el codi té escrits avui, perquè la diferència quedi a la vista.
 *
 * Referència: `docs/informes/MAPA-calibratges.md`.
 */
describe('els llenços de disseny', () => {
  it("l'amplada és la mateixa a tots els llenços", () => {
    expect(LLENC_AMPLADA).toBe(2642);
  });

  it('el gap vertical de la graella és de 3 px', () => {
    expect(LLENC_GAP_Y).toBe(3);
  });

  describe('la fila del llenç', () => {
    it("una fila és l'alçada entre el nombre de files", () => {
      expect(filaEnUnitats(6708, 90)).toBeCloseTo(74.5333, 3);
      expect(filaEnUnitats(1780, 24)).toBeCloseTo(74.1667, 3);
    });

    it('el coeficient és la fila dividida per amplada del llenç', () => {
      expect(filaAlcadaCoef(6708, 90)).toBeCloseTo(0.0282109, 6);
      expect(filaAlcadaCoef(1780, 24)).toBeCloseTo(0.0280722, 6);
      expect(filaAlcadaCoef(3950, 53)).toBeCloseTo(0.0282091, 6);
    });

    it('coincideix amb el que el navegador PINTA, mesurat', () => {
      // Mesurat a 1920 amb carril de 1350 (docs/informes/MAPA-calibratges.md).
      const carril = 1350;
      expect(filaAlcadaCoef(1780, 24) * carril).toBeCloseTo(37.897, 2);
      expect(filaAlcadaCoef(6708, 90) * carril).toBeCloseTo(38.085, 2);
      expect(filaAlcadaCoef(3950, 53) * carril).toBeCloseTo(38.082, 2);
    });
  });

  describe('el gap', () => {
    it('amb 24 files hi ha 23 gaps, i en toquen 2,875 a cada fila', () => {
      expect(filaGapCoef(24)).toBeCloseTo(2.875, 6);
    });

    it('el 2,875 que el codi escriu surt de la mateixa aritmètica', () => {
      expect((24 - 1) * 3 / 24).toBe(filaGapCoef(24));
    });

    it('amb 90 files en toquen 2,9667', () => {
      expect(filaGapCoef(90)).toBeCloseTo(2.96667, 5);
    });
  });

  describe('els coeficients escrits a mà', () => {
    it('el 0,3385 del marginTop és 12 files, i té deriva', () => {
      // 12 files / 2642 = 0,338531..., i el codi n'escriu 0,3385.
      const exacte = 12 * LLENCOS.colleccio.coef;
      expect(exacte).toBeCloseTo(0.338531, 6);
      const escrit = 0.3385;
      const carril1440 = 1012.5;
      // La deriva en px a 1440: menys de 2 px, i amb el signe que allunya.
      expect(Math.abs(exacte - escrit) * carril1440).toBeLessThan(2);
    });

    it('el 0,0280625 del hero es desvia 0,013 px del derivat', () => {
      const derivat = LLENCOS.hero.coef;
      const escrit = LLENCOS.hero.coefEscrit;
      expect(derivat).toBeCloseTo(0.0280722, 6);
      expect(Math.abs(derivat - escrit) * 1350).toBeCloseTo(0.013, 3);
    });
  });

  describe('les referències del megaslide', () => {
    it("l'artboard fa 800 i el mockup del cercador 4512", () => {
      expect(MEGASLIDE_ALCADA_REFERENCIA).toBe(800);
      expect(CERCADOR_MOCKUP_PX).toBe(4512);
    });
  });

  describe('els calibradors que encara no tenen origen', () => {
    it('queden comptats, perquè no es perdin', () => {
      expect(CALIBRADORS_PENDENTS.galeriaDescomptePx).toBe(231);
      expect(CALIBRADORS_PENDENTS.heroAlcadaVerticalPx).toBe(430);
      expect(CALIBRADORS_PENDENTS.iniciGraellaVerticalPx).toBe(752);
    });
  });
});
