import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Retalla el marge transparent dels dibuixos de la graella.
 *
 * PER QUÈ
 *
 * Els fitxers de dibuix tenen el dibuix centrat amb un marge transparent al
 * voltant. Quan es mostren a 50 px amb `object-fit: contain`, el que fa 50 px
 * és el FITXER sencer, i el dibuix hi queda petit.
 *
 * L'amo vol que el que faci 50 px sigui el DIBUIX. Per això cal retallar el
 * marge transparent, i ho fem en una carpeta a part per no tocar els originals
 * (que altres llocs fan servir amb el marge, per calibracions i posicions).
 *
 * EIXIDA
 *
 * Es llegeix la llista de /tmp/rutes-grid.json i cada fitxer es retalla a
 * public/custom_logos/drawings/images_grid_trim/<mateixa-ruta>, amb el mateix
 * nom. Després el GRID_MAP de CercadorTextRow ha d'apuntar cap a aquesta
 * carpeta nova.
 */

const RUTES = JSON.parse(fs.readFileSync('/tmp/rutes-grid.json', 'utf8'));
const ARREL = 'public/custom_logos/drawings/images_grid';
const EIXIDA = 'public/custom_logos/drawings/images_grid_trim';

let fetes = 0;
for (const ruta of RUTES) {
  const origen = path.join(ARREL, path.relative('/custom_logos/drawings/images_grid', ruta));
  const desti = path.join(EIXIDA, path.relative('/custom_logos/drawings/images_grid', ruta));

  if (!fs.existsSync(origen)) {
    console.log('  NO existeix:', origen);
    continue;
  }

  fs.mkdirSync(path.dirname(desti), { recursive: true });
  // `trim()` treu els pixels transparents de les vores. El llindar 0 fa que
  // només es retalli allò completament transparent (els dibuixos són negres
  // sobre transparent, així que no es retalla cap tinta).
  await sharp(origen).trim({ threshold: 0 }).toFile(desti);
  fetes += 1;
}

console.log('  fetes:', fetes, 'de', RUTES.length);
