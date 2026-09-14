import { describe, it, expect } from 'vitest';
import { rngDelDia, buildOtherCollectionsImages } from '../../src/components/home/homeDrawings.js';

// "ALTRES HISTÒRIES" ha de ser el mateix tot el dia i canviar l'endemà.
describe('rngDelDia', () => {
  it('dona sempre la mateixa sequencia per al mateix dia', () => {
    const a = rngDelDia(new Date(2026, 8, 14));
    const b = rngDelDia(new Date(2026, 8, 14));
    const un = [a(), a(), a(), a()];
    const dos = [b(), b(), b(), b()];
    expect(un).toEqual(dos);
  });

  it('canvia de sequencia d-un dia a l-altre', () => {
    const avui = rngDelDia(new Date(2026, 8, 14));
    const dema = rngDelDia(new Date(2026, 8, 15));
    const un = [avui(), avui(), avui(), avui()];
    const dos = [dema(), dema(), dema(), dema()];
    expect(un).not.toEqual(dos);
  });

  it('dona numeros entre 0 i 1', () => {
    const r = rngDelDia(new Date(2026, 8, 14));
    for (let i = 0; i < 20; i += 1) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('les recomanacions de ALTRES HISTORIES son iguals dins del mateix dia', () => {
    const un = buildOtherCollectionsImages('austen', { rng: rngDelDia(new Date(2026, 8, 14)) });
    const dos = buildOtherCollectionsImages('austen', { rng: rngDelDia(new Date(2026, 8, 14)) });
    expect(un.map((x) => x && x.href)).toEqual(dos.map((x) => x && x.href));
  });
});
