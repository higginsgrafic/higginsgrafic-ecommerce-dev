import { describe, it, expect } from 'vitest';
import {
  carrilDeFinestra,
  ampladaFilaFranja,
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
