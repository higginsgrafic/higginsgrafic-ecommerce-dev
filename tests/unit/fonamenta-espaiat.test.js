import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Aquestes proves fixen L'ESCALA D'ESPAIAT de la fonamenta, no el codi que la
 * fa servir.
 *
 * PER QUÈ EXISTEIXEN. L'escala va estar mesos sense cap consumidor, i quan el
 * primer consumidor hi va arribar (l'esquelet de l'inici nou) es van destapar
 * dues errades de cop:
 *
 *   1. Els multiplicadors estaven invertits: `--esp-3` es definia com
 *      `var(--u) * 2.5` quan el seu comentari deia 40 unitats.
 *   2. `--u` tenia un terra de 0,6667 pensat per al TEXT, i el terra aplicat a
 *      la GEOMETRIA feia que a 768 `--esp-4` valgués 1.280 px en comptes de 48.
 *
 * Les dues es veien a 1920 i a 1280 i no es veien a 1024 ni a 768, o sigui que
 * una prova que només mirés una mida no hauria atrapat res.
 *
 * El que es fixa aquí és la RELACIÓ, que és el que no pot derivar: els
 * multiplicadors i el fet que la geometria no tingui terra.
 *
 * Referència: `docs/informes/PLA-arquitectura-nova.md` §3 i §2 ter.
 */
const FONAMENTA = readFileSync(path.resolve('src/foundation.css'), 'utf8');

/** El valor declarat d'una propietat dins d'un bloc de `:root`. */
function declaracio(nom) {
  const re = new RegExp(`${nom}\\s*:\\s*([^;]+);`);
  const m = FONAMENTA.match(re);
  return m ? m[1].trim() : null;
}

/** Els multiplicadors de `--esp-*`, en l'ordre de l'escala. */
function multiplicadorsEspaiat() {
  const o = {};
  for (const n of [1, 2, 3, 4]) {
    const valor = declaracio(`--esp-${n}`);
    const m = valor && valor.match(/var\(--u\)\s*\*\s*([0-9.]+)/);
    o[n] = m ? Number(m[1]) : null;
  }
  return o;
}

describe("l'escala d'espaiat de la fonamenta", () => {
  it('les quatre mesures existeixen i surten de --u', () => {
    const esp = multiplicadorsEspaiat();
    for (const n of [1, 2, 3, 4]) {
      expect(esp[n], `--esp-${n} ha de ser var(--u) multiplicat`).not.toBeNull();
    }
  });

  it('els multiplicadors son les unitats del comentari: 8, 16, 40 i 120', () => {
    // Aquesta es l'errada que hi havia: 0.5, 1, 2.5 i 7.5.
    expect(multiplicadorsEspaiat()).toEqual({ 1: 8, 2: 16, 3: 40, 4: 120 });
  });

  it("l'escala creix: cada grao es mes gran que l'anterior", () => {
    const esp = multiplicadorsEspaiat();
    expect(esp[1]).toBeLessThan(esp[2]);
    expect(esp[2]).toBeLessThan(esp[3]);
    expect(esp[3]).toBeLessThan(esp[4]);
  });

  it("el marge lateral son 40 unitats, les mateixes que l'aire entre seccions", () => {
    // Es el que fa que el marge i l'aire de seccio siguin el mateix ritme.
    const marge = declaracio('--marge-lateral');
    expect(marge).toMatch(/var\(--u\)\s*\*\s*40/);
  });

  it('la unitat surt del CARRIL, no de la finestra', () => {
    // Eren `finestra / 1920`, i la finestra i el carril nomes son proporcionals
    // fins a 1920: a partir d'alla el carril te un sostre de 1350 px, i a
    // tauleta s'eixampla mes que la finestra. Amb la unitat lligada a la
    // finestra, l'espaiat i el titol NO creixien quan creixia el carril
    // (mesurat: la hero passava de 508x214 a 677x285 a 1024 i el titol es
    // quedava igual).
    expect(declaracio('--u')).toBe('calc(var(--contingut-max) / 1350)');
  });

  it('la unitat NO te terra', () => {
    // El terra de 0,6667 es del TEXT. Aplicat a la unitat, a 768 feia que
    // `--esp-4` valgues 1.280 px en comptes de 48.
    expect(FONAMENTA).not.toMatch(/--u:\s*10\.6667px/);
    expect(declaracio('--u')).not.toMatch(/max\(|min\(/);
  });

  it("el carril es declara ABANS de la unitat, perque la unitat en surt", () => {
    const iCarril = FONAMENTA.indexOf('--contingut-max:');
    const iU = FONAMENTA.indexOf('--u: calc(var(--contingut-max)');
    expect(iCarril).toBeGreaterThan(-1);
    expect(iU).toBeGreaterThan(iCarril);
  });

  it("el carril s'eixampla a tauleta NOMES a la pagina nova", () => {
    // El carril es compartit amb la pagina vella, i alla la mida de la FITXA en
    // surt: eixamplar-lo a tot el lloc li canviava les fitxes (mesurat, de
    // 259x418 a 720x917 a 768). La regla ha d'anar abastida.
    expect(FONAMENTA).toMatch(/@media \(min-width: 768px\) and \(max-width: 1279px\)/);
    expect(FONAMENTA).toMatch(/\[data-inici-nou="1"\] +\.hg-carril/);
  });

  it('el terra del text viu a --escala, no a --u', () => {
    // `--escala` es la que porta el terra i encara no te cap consumidor.
    expect(declaracio('--escala')).toBe('0.6667');
  });

  it('el carril no te terra (es el model que la geometria ha de seguir)', () => {
    const carril = declaracio('--contingut-max');
    expect(carril).toMatch(/70\.3125vw/);
    expect(carril).toMatch(/1350px/);
  });
});
