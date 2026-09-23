import { describe, it, expect } from 'vitest';
import {
  SECCIONS_INICI,
  RUTA_INICI_NOU,
  HERO_AMPLADA,
  HERO_ALCADA,
  HERO_ALCADA_VERTICAL,
  HERO_AIRE_CARRIL,
} from '@/config/iniciNou.js';

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
      // `alcada` es `null` a la hero, que ja te la seva propia caixa.
      if (seccio.alcada !== null) {
        expect(seccio.alcada, `la seccio ${seccio.id}`).toMatch(/^--esp-[0-9]+$/);
      }
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

/**
 * La hero: la seva GEOMETRIA, que es el que s'ha mesurat de la pagina vella.
 *
 * El que es fixa aqui no es un valor en pixels sino la RELACIO, perque es el
 * que la pagina vella te constant a les quatre mides d'escriptori (2,3728 /
 * 2,3722 / 2,3719 / 2,3711) i el que fa que la caixa nova reprodueixi la vella
 * amb menys de mig pixel.
 */
describe("la hero de l'inici nou", () => {
  it("l'amplada es el 70,5 % del carril, que era el `scale(0.705)`", () => {
    // 952 / 1350 = 0,70519. El `scale` era 0,705: la diferencia es de 0,0002,
    // que son 0,25 px sobre un carril de 1350 i es el que el mesurament te.
    expect(HERO_AMPLADA / 1350).toBeCloseTo(0.705, 2);
  });

  it("l'aire es el complement de l'amplada", () => {
    // 1 − 952/1350 = 0,29481, i es el que dona el mesurament (224,3 px d'aire
    // a cada costat amb un carril de 1350).
    expect(HERO_AIRE_CARRIL).toBeCloseTo(1 - HERO_AMPLADA / 1350, 6);
    expect(HERO_AIRE_CARRIL).toBeCloseTo(0.2948, 3);
  });

  it("la proporcio de la caixa es la mesurada a la pagina vella", () => {
    // 952 / 401 = 2,37406. El mesurament dona 2,3728 / 2,3722 / 2,3719 /
    // 2,3711 a les quatre mides d'escriptori: la diferencia es de 0,0013, o
    // sigui mig pixel d'alcada sobre 401. La relacio es la bona.
    for (const mesurat of [2.3728, 2.3722, 2.3719, 2.3711]) {
      expect(HERO_AMPLADA / HERO_ALCADA).toBeCloseTo(mesurat, 2);
    }
  });

  it('a la vista vertical tambe es una proporcio, no un numero fix', () => {
    // 541 x 430 a la caixa de disseny: la relacio es 952 / 430 = 2,2140.
    expect(HERO_AMPLADA / HERO_ALCADA_VERTICAL).toBeCloseTo(2.214, 3);
  });
});
