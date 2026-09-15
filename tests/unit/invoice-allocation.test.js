import { describe, it, expect } from 'vitest';
// El repartiment viu amb el full de factura: la pàgina de debò i l'editor el
// fan servir tots dos, i així no n'hi ha dues versions.
import { reparteixTransport } from '@/components/invoice/InvoiceSheet';

const suma = (a) => Math.round(a.reduce((x, y) => x + y, 0) * 100) / 100;

describe('Repartiment del transport entre les unitats', () => {
  it('una sola peça paga la tarifa sencera', () => {
    const t = reparteixTransport([1], 3.55);
    expect(t).toEqual([3.55]);
  });

  it('la primera peça paga més i les altres menys', () => {
    const t = reparteixTransport([1, 1, 1], 5.85);
    expect(t[0]).toBeGreaterThan(t[1]);
    expect(t[1]).toBe(t[2]);
    expect(suma(t)).toBe(5.85);
  });

  it('la suma de les línies sempre dona el total desat', () => {
    for (const [quants, total] of [
      [[1, 1], 4.70], [[1, 1, 1], 5.85], [[2], 7.10],
      [[1, 1, 1, 1, 1], 9.28], [[3, 2], 10.52], [[1], 3.63],
    ]) {
      const t = reparteixTransport(quants, total);
      expect(suma(t)).toBeCloseTo(total, 2);
    }
  });

  it('si l’enviament és gratuït, totes les línies van a zero', () => {
    expect(reparteixTransport([1, 1, 1], 0)).toEqual([0, 0, 0]);
  });

  it('amb una tarifa desconeguda reparteix a parts iguals i quadra', () => {
    const t = reparteixTransport([1, 1, 1], 9.99);
    expect(suma(t)).toBe(9.99);
  });
});
