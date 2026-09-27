// TEMPORAL — no es comiteja. L'SVG del vel amb i sense el clipPath, aïllat.
import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync } from 'node:fs';
const svg = readFileSync('_tmp-vel.svg', 'utf8');
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1200, height: 200 } })).newPage();
for (const [nom, text] of [
  ['amb-clip', svg],
  ['sense-clip', svg.replace(/ clip-path="url\(#[^"]*\)"/g, '')],
  ['sense-mascara', svg.replace(/ mask="url\(#[^"]*\)"/g, '')],
]) {
  const dades = await p.evaluate(async (t) => {
    const c = document.createElement('canvas');
    c.width = 2866; c.height = 307;
    const g = c.getContext('2d');
    const img = new Image();
    img.src = `data:image/svg+xml,${encodeURIComponent(t)}`;
    await img.decode();
    g.drawImage(img, 0, 0, 2866, 307);
    const d = g.getImageData(0, 0, 2866, 307).data;
    const files = [];
    for (let x = 0; x < 2866; x++) {
      let n = 0;
      for (let y = 0; y < 307; y++) if (d[(y * 2866 + x) * 4 + 3] > 8) n++;
      files.push(n);
    }
    return files;
  }, text);
  const casa = 2866 / 14;
  const trams = [];
  let dins = false; let ini = 0;
  for (let x = 0; x < 2866; x++) {
    if (dades[x] > 0 && !dins) { dins = true; ini = x; } else if (dades[x] === 0 && dins) { dins = false; trams.push(`${ini}..${x - 1}`); }
  }
  if (dins) trams.push(`${ini}..2865`);
  console.log(`${nom}: ${trams.join('  ')}`);
}
await b.close();
