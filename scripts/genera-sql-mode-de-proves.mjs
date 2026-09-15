/**
 * Genera un sol fitxer SQL amb totes les migracions del mode de proves.
 *
 * PER QUÈ
 *
 * El propietari ha d'executar les migracions a mà al SQL Editor de Supabase. Si
 * són quatre fitxers, és fàcil deixar-se'n un — i una migració que no s'executa
 * és pitjor que no tenir-ne, perquè el codi nou falla i sembla que el problema
 * sigui una altra cosa.
 *
 * Aquest guió les ajunta en l'ordre correcte en un sol fitxer, amb les
 * instruccions al capdamunt.
 *
 * PER QUÈ ES GENERA I NO S'ESCRIU A MÀ
 *
 * Si el fitxer junt es mantingués a mà, hi hauria dues veritats i divergirien.
 * Aquí la font són els fitxers de `supabase/migrations/`, i aquest guió només
 * els copia. Si divergeixen, es torna a passar el guió.
 *
 *     node scripts/genera-sql-mode-de-proves.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// En ordre d'execució. L'ordre importa: la validació d'imports primer, el mode
// de proves després, i les dues correccions al final.
const MIGRACIONS = [
  '20260916120000_la_validacio_dimports_endarrerida.sql',
  '20260916130000_mode_de_proves.sql',
  '20260916140000_rectificatives_del_mateix_tipus.sql',
  '20260916150000_el_mur_tracta_null_com_a_de_debo.sql',
];

const arrel = process.cwd();
const carpeta = resolve(arrel, 'supabase/migrations');
const eixida = resolve(arrel, 'docs/sql-pas1/EXECUTA-LES-MIGRACIONS.sql');

const capcalera = `-- ============================================================
-- MODE DE PROVES — TOTES LES MIGRACIONS, EN ORDRE
-- ============================================================
--
-- AQUEST FITXER ES GENERA TOT SOL. No l'editis a mà.
--   node scripts/genera-sql-mode-de-proves.mjs
-- La font són els fitxers de supabase/migrations/.
--
-- COM S'EXECUTA
--
--   1. Supabase → SQL Editor
--   2. Enganxa AQUEST FITXER SENCER
--   3. Run
--   4. Després, al terminal:  npm run verifica:proves
--
-- CADA BLOC VA DINS D'UNA TRANSACCIÓ: o s'aplica, o no s'aplica. Si un falla,
-- no queda res a mitges. És segur tornar-lo a passar sencer.
--
-- QUÈ FA, EN ORDRE
--
--   1. La validació d'imports de les factures (que no s'havia executat mai).
--   2. El mode de proves: is_test, comptador PROVA- i els murs.
--   3. Les rectificatives no poden creuar el mur de les proves.
--   4. El mur tracta NULL com a «de debò» (abans hauria aturat factures reals).
--
-- QUÈ NO FA
--
--   * No esborra cap factura ni cap comanda.
--   * No toca la sèrie FO/FS/FR: el comptador de proves és una taula a part.
--   * No envia res a Gelato ni cap correu.
--

`;

const parts = MIGRACIONS.map((nom, i) => {
  const cami = resolve(carpeta, nom);
  const contingut = readFileSync(cami, 'utf8').trimEnd();
  return `-- ############################################################################
-- BLOC ${i + 1} de ${MIGRACIONS.length}: ${nom}
-- ############################################################################

${contingut}
`;
});

const capçaleraFinal = `

-- ============================================================
-- FI. Ara comprova-ho:
--
--     npm run verifica:proves
--
-- Si tot surt verd, el mode de proves està instal·lat. Si surt vermell,
-- passa el resultat a qui mantingui el projecte.
-- ============================================================
`;

writeFileSync(eixida, capcalera + parts.join('\n') + capçaleraFinal);
console.log(`Generat: ${eixida}`);
console.log(`Blocs: ${MIGRACIONS.length}`);
for (const nom of MIGRACIONS) console.log(`  - ${nom}`);
