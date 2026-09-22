#!/usr/bin/env node
/**
 * Compara pixel a pixel dues carpetes de captures (PNG del mateix nom).
 *
 *   node scripts/compara-captures.mjs docs/comparacio/abans docs/comparacio/despres
 *
 * Serveix per verificar que un canvi de layout (o la fusio de l'Etapa B) no ha
 * mogut res: cada pas de la fusio s'ha de poder comprovar contra la referencia
 * que es va desar amb `scripts/captures-colleccions.mjs`.
 *
 * Sortida: una linia per imatge amb el nombre de pixels diferents i la primera
 * fila on difereixen, i un resum. Surt amb 1 si alguna imatge difereix.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [dirA, dirB] = process.argv.slice(2);
if (!dirA || !dirB) {
  console.error('Us: node scripts/compara-captures.mjs <carpeta-abans> <carpeta-despres>');
  process.exit(2);
}

// Llindar per pixel i canal: per sota es considera soroll de renderitzat.
const TOLERANCIA = 2;

const carrega = (path) => PNG.sync.read(readFileSync(path));

const fitxers = readdirSync(dirA).filter((f) => f.endsWith('.png')).sort();
let ambDiferencies = 0;

for (const f of fitxers) {
  let a;
  let b;
  try {
    a = carrega(`${dirA}/${f}`);
    b = carrega(`${dirB}/${f}`);
  } catch {
    console.log(`${f.padEnd(30)} FALTA a ${dirB}`);
    ambDiferencies++;
    continue;
  }
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`${f.padEnd(30)} MIDES DIFERENTS (${a.width}x${a.height} vs ${b.width}x${b.height})`);
    ambDiferencies++;
    continue;
  }
  let dif = 0;
  let maxDelta = 0;
  let primeraFila = null;
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * 4;
      const d = Math.max(
        Math.abs(a.data[i] - b.data[i]),
        Math.abs(a.data[i + 1] - b.data[i + 1]),
        Math.abs(a.data[i + 2] - b.data[i + 2]),
      );
      if (d > TOLERANCIA) {
        dif++;
        if (d > maxDelta) maxDelta = d;
        if (primeraFila === null) primeraFila = y;
      }
    }
  }
  if (dif > 0) ambDiferencies++;
  const total = a.width * a.height;
  console.log(
    `${f.padEnd(30)} diferents=${String(dif).padStart(7)} (${(100 * dif / total).toFixed(3)}%) maxDelta=${String(maxDelta).padStart(3)} primeraFila=${primeraFila ?? '-'}`,
  );
}

console.log(
  ambDiferencies === 0
    ? `\nOK: les ${fitxers.length} captures son identiques (tolerancia ${TOLERANCIA}/canal).`
    : `\n${ambDiferencies} de ${fitxers.length} captures difereixen.`,
);
process.exit(ambDiferencies === 0 ? 0 : 1);
