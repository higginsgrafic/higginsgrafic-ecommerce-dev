import { describe, it, expect } from 'vitest';
import { SECCIONS_INICI, RUTA_INICI_NOU } from '@/config/iniciNou.js';

/**
 * Aquestes proves fixen L'ESQUELET de la pàgina d'inici nova, no el seu
 * aspecte: que les seccions siguin les que toca, en ordre, i que cap d'elles
 * porti un número de píxels.
 *
 * El motiu és el que el pla diu a §3: la pàgina actual està feta de 61
 * posicions `top` en píxels fixos i 10 marges negatius, i per això cada
 * arranjament en trenca dos. L'esquelet nou no pot tornar a començar així, i
 * una prova és la manera de saber que no ho ha fet.
 *
 * Referència: `docs/informes/PLA-arquitectura-nova.md` §3 i §6.
 */
describe("l'esquelet de l'inici nou", () => {
  it('es prova en una ruta pròpia i no a la de la botiga', () => {
    expect(RUTA_INICI_NOU).toBe('/nova/inici');
    expect(RUTA_INICI_NOU).not.toBe('/');
  });

  it('te les set seccions de l\'inici, en ordre', () => {
    expect(SECCIONS_INICI.map((s) => s.id)).toEqual([
      'hero',
      'colleccio-1',
      'colleccio-2',
      'colleccio-3',
      'colleccio-4',
      'colleccio-5',
      'poster',
    ]);
  });

  it('cap identificador no es repeteix', () => {
    const ids = SECCIONS_INICI.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tots els aires surten de l'escala de la fonamenta", () => {
    for (const seccio of SECCIONS_INICI) {
      if (seccio.esp !== null) {
        expect(seccio.esp, `la seccio ${seccio.id}`).toMatch(/^--esp-[0-9]+$/);
      }
      expect(seccio.alcada, `la seccio ${seccio.id}`).toMatch(/^--esp-[0-9]+$/);
    }
  });

  it('cap seccio no porta un número de píxels', () => {
    // Els números de píxels són el que el pla vol fora de la composició. Si
    // algú n'hi afegeix un, aquesta prova ha de caure i obligar-lo a dir per
    // què no hi cap un `--esp-*`.
    const serialitzat = JSON.stringify(SECCIONS_INICI);
    expect(serialitzat).not.toMatch(/\d+px/);
    expect(serialitzat).not.toMatch(/"top"|"marginTop"|"position"/);
  });

  it('la primera seccio no porta aire a sobre: la pàgina comença on comença', () => {
    expect(SECCIONS_INICI[0].esp).toBeNull();
  });

  it('totes les seccions son visibles a l\'esquelet, amb nom', () => {
    for (const seccio of SECCIONS_INICI) {
      expect(seccio.label, `la seccio ${seccio.id}`).toBeTruthy();
    }
  });
});
