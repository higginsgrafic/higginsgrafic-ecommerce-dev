import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * El fitxer SQL que executa el propietari ha d'estar al dia.
 *
 * `docs/sql-pas1/EXECUTA-LES-MIGRACIONS.sql` es genera a partir dels fitxers de
 * `supabase/migrations/`. Si algú canvia una migració i no torna a passar el
 * guió, el propietari executaria una versió vella i el codi nou fallaria
 * d'una manera que semblaria un altre problema.
 *
 * Aquest test ho atura. La manera d'arreglar-lo quan peta és:
 *
 *     node scripts/genera-sql-mode-de-proves.mjs
 */

const MIGRACIONS = [
  '20260916120000_la_validacio_dimports_endarrerida.sql',
  '20260916130000_mode_de_proves.sql',
  '20260916140000_rectificatives_del_mateix_tipus.sql',
  '20260916150000_el_mur_tracta_null_com_a_de_debo.sql',
];

describe('El SQL que executa el propietari', () => {
  it('conté les quatre migracions, senceres i en ordre', () => {
    const generat = readFileSync(resolve(process.cwd(), 'docs/sql-pas1/EXECUTA-LES-MIGRACIONS.sql'), 'utf8');

    MIGRACIONS.forEach((nom, i) => {
      // Cada migració hi ha de ser, amb el seu bloc numerat.
      expect(generat).toContain(`BLOC ${i + 1} de ${MIGRACIONS.length}: ${nom}`);
    });

    // I el contingut de cadascuna ha de ser-hi sencer: es comprova amb la
    // darrera línia de cada fitxer, que és la seva comprovació final.
    for (const nom of MIGRACIONS) {
      const original = readFileSync(resolve(process.cwd(), 'supabase/migrations', nom), 'utf8').trimEnd();
      const darreres = original.split('\n').slice(-3).join('\n').trim();
      expect(generat).toContain(darreres);
    }
  });

  it('no s’ha quedat enrere respecte de les migracions', () => {
    const generat = readFileSync(resolve(process.cwd(), 'docs/sql-pas1/EXECUTA-LES-MIGRACIONS.sql'), 'utf8');
    for (const nom of MIGRACIONS) {
      const original = readFileSync(resolve(process.cwd(), 'supabase/migrations', nom), 'utf8').trimEnd();
      // El contingut sencer, sense la capçalera del bloc, ha de ser-hi.
      expect(generat.includes(original)).toBe(true);
    }
  });
});
