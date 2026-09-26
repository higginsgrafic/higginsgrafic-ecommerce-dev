import { describe, it, expect } from 'vitest';
import { STRIPE_DRAWING_CALIBRATIONS } from '../../src/config/stripeCalibrations.js';
import {
  DIBUIXOS_FRANJA_AMPLADA,
  DIBUIXOS_FRANJA_AMPLADA_NATURAL,
  DIBUIXOS_FRANJA_FRACCIO_COS,
  escalaDibuixFranja,
} from '../../src/components/megaslide/geometriaMegaslide.js';

// Les 244 calibracions per dibuix no son 244 decisions: son una AMPLADA BASE i
// una llista curta d'excepcions. Aquesta prova ho fixa i, de passada, llista les
// excepcions que queden per declarar.
//
// Mesurat el 26/09/2026: tots els fitxers de dibuix fan 256 px d'amplada i
// l'escala calibrada dona una amplada renderitzada de 74 a 88 unitats a la gran
// majoria d'entrades.

const entrades = Object.entries(STRIPE_DRAWING_CALIBRATIONS)
  .filter(([url]) => url.includes('images_stripe'))
  .map(([url, c]) => ({ url: url.split('/').pop(), ...c, renderitzada: c.scale * DIBUIXOS_FRANJA_AMPLADA_NATURAL }));

describe('els dibuixos de la franja', () => {
  it('al mapa NOME\'S hi queden les excepcions: cap entrada dins la banda base', () => {
    // Des del 26/09/2026 les entrades de la banda (189 de 224) ja no son al
    // mapa: les serveix la regla declarada. Si algu n'hi torna a posar una,
    // aquesta prova ho diu.
    const dins = entrades.filter((e) => e.renderitzada >= 70 && e.renderitzada <= 90);
    console.log(`entrades al mapa: ${entrades.length}; de la banda base: ${dins.length}`);
    for (const e of dins) console.log(`  TORNA A LA BANDA ${e.url} scale ${e.scale} -> ${e.renderitzada.toFixed(1)}`);
    expect(dins.length).toBe(0);
  });

  it("l'amplada base es el 41 % del cos de la samarreta", () => {
    // 2740 unitats de cossos / 14 samarretes = 195,7 unitats per cos.
    expect(DIBUIXOS_FRANJA_FRACCIO_COS).toBeCloseTo(0.409, 2);
  });

  it('diu quant canviaria cada entrada si s\'aplica la regla', () => {
    // Aixo es el que l'amo ha de veure abans d'esborrar el mapa: la regla no
    // reprodueix exactament les calibracions, nome's la banda. Aqui es compta
    // quant canvia la mida de cada dibuix, en percentatge.
    const regla = escalaDibuixFranja(256) * DIBUIXOS_FRANJA_AMPLADA_NATURAL; // 80
    const deltes = entrades.map((e) => ((regla - e.renderitzada) / e.renderitzada) * 100);
    const abs = deltes.map(Math.abs);
    const trams = { 'exacte (0 %)': 0, 'fins a 2 %': 0, 'fins a 5 %': 0, 'fins a 10 %': 0, 'mes de 10 %': 0 };
    for (const d of abs) {
      if (d < 0.01) trams['exacte (0 %)'] += 1;
      else if (d <= 2) trams['fins a 2 %'] += 1;
      else if (d <= 5) trams['fins a 5 %'] += 1;
      else if (d <= 10) trams['fins a 10 %'] += 1;
      else trams['mes de 10 %'] += 1;
    }
    console.log('canvi de mida si s\'aplica la regla:', JSON.stringify(trams));
    console.log(`desviacio maxima: ${Math.max(...abs).toFixed(1)} % (${entrades[abs.indexOf(Math.max(...abs))].url})`);
  });

  it("l'escala declarada reprodueix les calibracions d'amplada de la majoria", () => {
    // Un dibuix de 256 px amb la regla: 80/256 = 0,3125, que es el que porten
    // les entrades mes comunes (0,31 i 0,32).
    expect(escalaDibuixFranja(256)).toBeCloseTo(0.3125, 4);
    expect(DIBUIXOS_FRANJA_AMPLADA / DIBUIXOS_FRANJA_AMPLADA_NATURAL).toBeCloseTo(0.3125, 4);
  });
});
