// TEMPORAL — no es comiteja. El cobriment del vel (trams amb vel), sense navegador.
// Comprova que la mascara no talla el vel de les cases velades.
import { readFileSync } from 'node:fs';
const svg = readFileSync('_tmp-vel.svg', 'utf8');
const svgSense = svg.replace(/ mask="url\(#[^"]*\)"/g, '');
const { chromium } = await import('@playwright/test');
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 800, height: 200 } })).newPage();
const trams = async (t) => p.evaluate(async (text) => {
  const c = document.createElement('canvas');
  c.width = 2866; c.height = 307;
  const g = c.getContext('2d');
  const img = new Image();
  img.src = `data:image/svg+xml,${encodeURIComponent(text)}`;
  await img.decode();
  g.drawImage(img, 0, 0, 2866, 307);
  const d = g.getImageData(0, 0, 2866, 307).data;
  const files = [];
  for (let x = 0; x < 2866; x++) {
    let n = 0;
    for (let y = 0; y < 307; y++) if (d[(y * 2866 + x) * 4 + 3] > 8) n++;
    files.push(n > 0 ? 1 : 0);
  }
  const out = []; let dins = false; let ini = 0;
  for (let x = 0; x < 2866; x++) {
    if (files[x] && !dins) { dins = true; ini = x; } else if (!files[x] && dins) { dins = false; out.push([ini, x - 1]); }
  }
  if (dins) out.push([ini, 2865]);
  return out;
}, t);
const amb = await trams(svg);
const sense = await trams(svgSense);
console.log('AMB MASCARA  :', amb.map(([a, b2]) => `${a}..${b2}`).join('  '));
console.log('SENSE MASCARA:', sense.map(([a, b2]) => `${a}..${b2}`).join('  '));
// El que la mascara treu del vel, en unitats
let treu = 0;
for (let x = 0; x < 2866; x++) {
  const a = amb.some(([i, f]) => x >= i && x <= f);
  const s = sense.some(([i, f]) => x >= i && x <= f);
  if (s && !a) treu++;
}
console.log(`la mascara treu ${treu} columnes de vel (de 2866)`);
await b.close();
