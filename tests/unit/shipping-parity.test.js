import { describe, expect, it } from 'vitest';

// El client i el servidor han de calcular el transport IDÈNTICAMENT: el client
// és el que ensenya el preu al comprador i el servidor el que el cobra. Si les
// dues taules divergeixen, el comprador veu un import i se li'n cobra un altre.
//
// Aquest test és el guardià d'aquesta paritat: si algú canvia una de les dues
// taules i no l'altra, falla.
import {
  SHIPPING_RATES as CLIENT_RATES,
  normalizeCountry as clientNormalize,
} from '../../src/hooks/useShippingCosts.js';
import {
  SHIPPING_RATES as SERVER_RATES,
  normalizeCountry as serverNormalize,
  quoteShipping,
} from '../../netlify/functions/_shipping.js';

// Rèplica exacta de calculate() de src/hooks/useShippingCosts.js
function clientShipping(country, quantity, subtotal) {
  const code = clientNormalize(country);
  const rate = CLIENT_RATES[code] || CLIENT_RATES.EU || CLIENT_RATES.ES;
  if (rate.free_threshold != null && subtotal >= rate.free_threshold) return 0;
  const qty = Math.max(1, Math.round(quantity || 1));
  return Math.round((rate.first + (qty - 1) * rate.additional) * 100) / 100;
}

describe('Paritat de tarifes d\'enviament client/servidor', () => {
  it('les dues taules de tarifes són idèntiques', () => {
    expect(SERVER_RATES).toEqual(CLIENT_RATES);
  });

  it('normalizeCountry dona el mateix resultat a les dues bandes', () => {
    const casos = [
      'Espanya', 'França', 'Andorra', 'Alemanya', 'Itàlia', 'Regne Unit',
      'Portugal', 'Suïssa', 'Estats Units', 'Japó',
      'ES', 'FR', 'AD', 'DE', 'PT', 'CH', 'US',
      'es_peninsula', 'es_canarias', 'eu', 'international',
      'unknown_zone', 'XX', '', null, undefined,
    ];
    for (const c of casos) {
      expect(serverNormalize(c), `normalizeCountry(${JSON.stringify(c)})`).toBe(clientNormalize(c));
    }
  });

  it('quoteShipping replica el càlcul del client', () => {
    const casos = [
      ['Espanya', 1, 20],
      ['Espanya', 3, 20],
      ['Espanya', 1, 49.99],
      ['Espanya', 1, 50],
      ['Espanya', 5, 120],
      ['França', 1, 30],
      ['França', 5, 30],
      ['Andorra', 2, 10],
      ['Alemanya', 1, 49.99],
      ['Alemanya', 1, 50],
      ['Estats Units', 3, 10],
      ['', 1, 10],
      [null, 2, 10],
      ['unknown_zone', 1, 10],
    ];
    for (const [country, qty, subtotal] of casos) {
      const esperat = clientShipping(country, qty, subtotal);
      expect(
        quoteShipping(country, qty, subtotal),
        `quoteShipping(${country}, ${qty}, ${subtotal})`
      ).toBe(esperat);
    }
  });

  it('els països del formulari es resolen a una tarifa real', () => {
    // Regressió: el formulari envia 'Espanya' i abans s'usava com a clau de
    // zona de shipping_config, on no existeix. El resultat era que la consulta
    // no retornava res i sempre s'aplicava el preu de fallback.
    for (const pais of ['Espanya', 'França', 'Andorra']) {
      const code = serverNormalize(pais);
      expect(SERVER_RATES[code], `tarifa per a ${pais}`).toBeDefined();
      expect(quoteShipping(pais, 1, 10)).toBeGreaterThan(0);
    }
  });

  it('el llindar d\'enviament gratuït s\'aplica igual a les dues bandes', () => {
    // Espanya: free_threshold = 50
    expect(quoteShipping('Espanya', 1, 49.99)).toBe(4.29);
    expect(quoteShipping('Espanya', 1, 50)).toBe(0);
    expect(clientShipping('Espanya', 1, 50)).toBe(0);
  });
});
