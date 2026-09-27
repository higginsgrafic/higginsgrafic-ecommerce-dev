// TEMPORAL — no es comiteja. Comprova la mascara al SVG del vel generat.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
const svg = readFileSync('_tmp-vel.svg', 'utf8').replace(/^data:image\/svg\+xml,/, '');
const r = await p.evaluate(async (svg) => {
  const img = new Image();
  img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
  await img.decode();
  const c = document.createElement('canvas');
  c.width = 2866; c.height = 307;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 2866, 307);
  g.drawImage(img, 0, 0, 2866, 307);
  const d = g.getImageData(0, 0, 2866, 307).data;
  const a = (x, y) => d[(y * 2866 + x) * 4 + 3];
  return {
    silueta3: a(700, 150),
    solapament: a(870, 150),
    fora: a(1000, 150),
    final3: a(890, 150),
  };
}, svg);
console.log(JSON.stringify(r));
await b.close();
