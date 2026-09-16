/**
 * Genera la llista de dibuixos de la graella.
 *
 * PER QUÈ CAL
 *
 * El navegador no pot llistar una carpeta de `public/`: només sap demanar
 * fitxers per nom. Per pintar una graella de dibuixos cal saber quins hi ha,
 * i això només es pot saber des del sistema de fitxers.
 *
 * Aquest guió llegeix `public/custom_logos/drawings/images_grid/` i deixa la
 * llista a `public/drawings.grid.json`, que la web sí que pot llegir.
 *
 * QUAN CAL TORNAR-LO A PASSAR
 *
 * Cada cop que s'afegeixin o es treguin dibuixos de la graella:
 *
 *     node scripts/genera-llista-dibuixos.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE = 'public/custom_logos/drawings/images_grid';
const EIXIDA = 'public/drawings.grid.json';
const EXTENSIONS = /\.(webp|png|jpg|jpeg)$/i;

function dibuixosDe(carpeta) {
  const trobats = [];
  for (const entrada of fs.readdirSync(carpeta)) {
    const ple = path.join(carpeta, entrada);
    if (fs.statSync(ple).isDirectory()) {
      for (const fitxer of fs.readdirSync(ple)) {
        if (EXTENSIONS.test(fitxer)) trobats.push(ple + '/' + fitxer);
      }
    } else if (EXTENSIONS.test(entrada)) {
      trobats.push(ple);
    }
  }
  // El navegador els demana com a ruta pública, sense el prefix `public`.
  return trobats.map((f) => '/' + f.replace(/^public\//, '')).sort();
}

const colleccions = fs.readdirSync(BASE).filter((d) => fs.statSync(path.join(BASE, d)).isDirectory());
const manifest = {};
for (const col of colleccions) manifest[col] = dibuixosDe(path.join(BASE, col));

fs.writeFileSync(EIXIDA, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Generat ${EIXIDA}`);
for (const [col, llista] of Object.entries(manifest)) console.log(`  ${col.padEnd(18)} ${llista.length}`);
console.log(`  TOTAL              ${Object.values(manifest).flat().length}`);
