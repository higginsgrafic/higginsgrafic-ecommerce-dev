import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * L'estructura del SQL que s'ha d'executar a mà.
 *
 * PER QUÈ CAL
 *
 * Les migracions s'executen al SQL Editor de Supabase, no en un entorn de
 * proves. Si una porta un delimitador desquadrat o un bloc sense tancar, el
 * propietari s'hi troba un error que no pot interpretar, i la feina s'atura.
 *
 * Aquesta comprovació no valida la semàntica (això només ho pot fer Postgres):
 * valida l'ESTRUCTURA. I no és una precaució teòrica: mentre s'escrivia això,
 * un `BEGIN` va quedar sense el seu `END IF` en un fitxer, i es va detectar
 * llegint-lo. Aquest test és perquè no torni a passar en silenci.
 *
 * Què comprova:
 *   * que cada `$$` o `$etiqueta$` tingui parella i en el mateix ordre
 *   * que cada `BEGIN;` de transacció tingui el seu `COMMIT;`
 *   * que el fitxer no acabi a mitges (sense punt i coma final)
 *
 * Què NO comprova, i és important saber-ho:
 *   * que els `IF` i els `BEGIN` de PL/pgSQL estiguin ben niats. Això només ho
 *     pot dir Postgres. De fet, la primera versió d'aquest test ho intentava i
 *     era equivocada: en PL/pgSQL un `DO $$ BEGIN ... END $$;` no acaba amb
 *     `END;`, i migracions que funcionen perfectament petaven aquí.
 *   * que les columnes i les taules citades existeixin.
 */

const CARPETA = resolve(process.cwd(), 'supabase/migrations');

/** Compta els delimitadors de dòlar i comprova que estiguin aparellats. */
function comprovaDelimitadors(sql) {
  const oberts = [];
  const re = /\$([a-zA-Z_][a-zA-Z0-9_]*)?\$/g;
  let m;
  while ((m = re.exec(sql)) !== null) {
    const etiqueta = m[1] || '';
    if (oberts.length && oberts[oberts.length - 1] === etiqueta) oberts.pop();
    else oberts.push(etiqueta);
  }
  return oberts;
}

/** Treu els comentaris perquè no falsegin els comptatges. */
function senseComentaris(sql) {
  return sql
    .split('\n')
    .map((línia) => línia.replace(/--.*$/, ''))
    .join('\n');
}

function fitxersDeMigracio() {
  return readdirSync(CARPETA).filter((f) => f.endsWith('.sql')).sort();
}

describe('Les migracions, comprovades com a text', () => {
  const fitxers = fitxersDeMigracio();

  it('n’hi ha, de migracions', () => {
    expect(fitxers.length).toBeGreaterThan(10);
  });

  for (const fitxer of fitxersDeMigracio()) {
    describe(fitxer, () => {
      const sql = readFileSync(join(CARPETA, fitxer), 'utf8');
      const net = senseComentaris(sql);

      it('té els delimitadors de dòlar aparellats', () => {
        expect(comprovaDelimitadors(net)).toEqual([]);
      });

      it('no té cap transacció BEGIN; sense el seu COMMIT;', () => {
        // `BEGIN;` és una transacció i ha d'anar amb `COMMIT;`. (Els blocs
        // PL/pgSQL no es poden comprovar així: vegeu la nota del capdamunt.)
        const comencenTransaccio = (net.match(/^\s*BEGIN\s*;/gim) || []).length;
        const commits = (net.match(/^\s*COMMIT\s*;/gim) || []).length;
        expect(commits).toBe(comencenTransaccio);
      });

      it('acaba amb un punt i coma', () => {
        expect(net.trimEnd().endsWith(';')).toBe(true);
      });
    });
  }
});

describe('El fitxer que executa el propietari', () => {
  const sql = readFileSync(resolve(process.cwd(), 'docs/sql-pas1/EXECUTA-LES-MIGRACIONS.sql'), 'utf8');
  const net = senseComentaris(sql);

  it('té els blocs quadrats', () => {
    expect(comprovaDelimitadors(net)).toEqual([]);
    const comencenTransaccio = (net.match(/^\s*BEGIN\s*;/gim) || []).length;
    const commits = (net.match(/^\s*COMMIT\s*;/gim) || []).length;
    expect(commits).toBe(comencenTransaccio);
  });

  it('porta les quatre migracions, i cap de més', () => {
    // Els marcadors són en comentaris, així que es miren al fitxer original.
    const blocs = sql.match(/BLOC \d+ de \d+/g) || [];
    expect(blocs).toHaveLength(4);
    expect(blocs[0]).toContain('BLOC 1 de 4');
    expect(blocs[3]).toContain('BLOC 4 de 4');
  });

  it('acaba dient com comprovar-ho', () => {
    expect(sql).toContain('npm run verifica:proves');
  });
});
