import { describe, it, expect } from 'vitest';
import { FRACCIO_COSSOS_FRANJA, STRIPE_LAYOUT_DEFAULTS } from '@/config/stripeCalibrations.js';
import { factorFranjaCarril, cossosFranja } from '@/utils/franjaCarril.js';

/**
 * LA FRANJA DE SAMARRETES, DINS DEL CARRIL.
 *
 * La franja era un numero calibrat (1.2125) que la deixava a lloc amb el regle
 * de 1350. Amb el carril de 3/5 aquell numero ja no volia dir res: a 1920 la
 * franja feia 1324 px amb un carril de 1152, o sigui 86 px per banda. Ara el
 * que mana es el carril: la filera de cossos de les catorze samarretes ha de
 * fer exactament l'amplada del carril, i les manigues hi queden a fora.
 *
 * Aquestes proves fixen la regla i les mides mesurades a la pantalla.
 */

// Mides reals mesurades amb `scripts/compara-vistes.mjs` (amplada del carril i
// amplada de la filera a mida de disseny) i l'amplada visible que en surt.
const CASOS = [
  { nom: '1920', carril: 1152, dibuix: 1092, visible: 1205.25 },
  { nom: '2560', carril: 1536, dibuix: 1456, visible: 1607 },
  { nom: '1366', carril: 820, dibuix: 784, visible: 856.18 },
  { nom: '1280', carril: 768, dibuix: 784, visible: 801.89 },
  { nom: '1024', carril: 614, dibuix: 784, visible: 641.09 },
];

describe('franja de samarretes al carril', () => {
  it('la filera de cossos dels catorze dibuixos es el 95,6% de la imatge', () => {
    // 2740 px dels 2866 de la imatge (primera filera de cossos al 65, ultima
    // al 2804), mesurat amb la tinta sobre full-white-stripe.webp.
    expect(FRACCIO_COSSOS_FRANJA).toBeCloseTo(0.9560, 4);
  });

  it('el factor es calcula contra el calibratge, no com una escala absoluta', () => {
    // Amb el carril i la filera de 1920, el factor es 0,91 del calibratge:
    // 1,2125 x 0,9101 = 1,1035.
    const factor = factorFranjaCarril(1152, 1092);
    expect(factor * STRIPE_LAYOUT_DEFAULTS.stripe.scale).toBeCloseTo(1.1035, 3);
  });

  for (const c of CASOS) {
    it(`a ${c.nom} els cossos fan el carril`, () => {
      const factor = factorFranjaCarril(c.carril, c.dibuix);
      const visible = c.dibuix * factor * STRIPE_LAYOUT_DEFAULTS.stripe.scale;
      // L'amplada visible calculada i la mesurada a la pantalla han de
      // coincidir. La mesurada porta l'arrodoniment de la filera (offsetWidth
      // es enter) i el factor d'alcada de la finestra, per aixo el marge.
      expect(Math.abs(visible - c.visible)).toBeLessThan(2);
      // I els cossos, que son el 95,6% de l'amplada visible, han de fer el carril.
      expect(cossosFranja(visible)).toBeCloseTo(c.carril, 0);
    });
  }

  it('les manigues surten a fora del carril, a la mida del dibuix', () => {
    // Les manigues arriben al 4 i al 2861 dels 2866: 2858 px, o sigui 24,9 px
    // per banda a 1920 amb un carril de 1152.
    const factor = factorFranjaCarril(1152, 1092);
    const visible = 1092 * factor * STRIPE_LAYOUT_DEFAULTS.stripe.scale;
    const manigues = visible * (2858 / 2866);
    expect((manigues - 1152) / 2).toBeCloseTo(24.9, 0);
  });

  it("sense carril o sense dibuix no s'ajusta res", () => {
    expect(factorFranjaCarril(0, 1092)).toBe(1);
    expect(factorFranjaCarril(1152, 0)).toBe(1);
    expect(factorFranjaCarril(Number.NaN, 1092)).toBe(1);
    expect(factorFranjaCarril(1152, 1092, 0)).toBe(1);
    expect(cossosFranja(Number.NaN)).toBe(0);
  });
});
