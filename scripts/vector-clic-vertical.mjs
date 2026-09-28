// FA EL FULL DE CLIC DE LA VISTA VERTICAL (28/09/2026)
// ---------------------------------------------------------------------------
// Les arees de clic de la franja son un SVG amb les catorze siluetes de
// samarreta. N'hi havia nome's un, `full-clic-area-5.svg`, que es el de la
// franja APAISADA: catorze samarretes en UNA filera (viewBox 2866x307).
//
// A la vista VERTICAL la franja son DUES fileres de set, i aquell full no hi
// encaixa: amb `preserveAspectRatio` per defecte (`meet`) les catorze
// samarretes s'encongeixen i queden totes en una filera, de manera que les
// arees de clic no cauen sobre les samarretes i els clics salten de colleccio
// (ho va veure l'amo: «els clics fan el burro i salten de colleccio»).
//
// Aquest guio escriu el full que hi falta a partir del VECTOR de la franja
// (`src/config/vectorFranja.js`), que ja porta les catorze siluetes a la seva
// casella en les dues fileres:
//
//   public/placeholders/cercador/full-clic-area-vertical.svg
//
// I porta `preserveAspectRatio="none"` perque s'estiri exactament igual que el
// vector de la franja (que tambe el porta): aixi les arees de clic cauen sobre
// les mateixes cases que les siluetes.
//
// Us: node scripts/vector-clic-vertical.mjs
import { writeFileSync } from 'node:fs';
import {
  VECTOR_FRANJA_SAMARRETES,
  VECTOR_FRANJA_VIEWBOX_OBERT,
} from '../src/config/vectorFranja.js';

const DESTI = 'public/placeholders/cercador/full-clic-area-vertical.svg';
const viewBox = `0 0 ${VECTOR_FRANJA_VIEWBOX_OBERT.width} ${VECTOR_FRANJA_VIEWBOX_OBERT.height}`;

const cos = VECTOR_FRANJA_SAMARRETES
  .map((d, k) => `  <path id="_${k + 1}" d="${d}" />`)
  .join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="none">
${cos}
</svg>
`;

writeFileSync(DESTI, svg, 'utf8');
console.log(`desat ${DESTI}: ${VECTOR_FRANJA_SAMARRETES.length} camins, viewBox ${viewBox}`);
