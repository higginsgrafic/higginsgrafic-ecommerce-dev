// TEMPORAL — no es comiteja. Renderitza l'SVG del vel (de _tmp-vel.svg) i en treu l'alfa.
import { chromium } from '@playwright/test';
import { writeFileSync, readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const svg = readFileSync('_tmp-vel.svg', 'utf8');
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1200, height: 200 } })).newPage();
await p.setContent('<body style="margin:0;background:#000"></body>');
const dataUrl = await p.evaluate(async (text) => {
  const c = document.createElement('canvas');
  c.width = 2866; c.height = 307;
  const g = c.getContext('2d');
  const url = `data:image/svg+xml,${encodeURIComponent(text)}`;
  const img = new Image();
  img.src = url;
  await img.decode();
  g.drawImage(img, 0, 0, 2866, 307);
  return c.toDataURL('image/png');
}, svg);
writeFileSync('_tmp-vel-render.png', Buffer.from(dataUrl.split(',')[1], 'base64'));
const png = PNG.sync.read(Buffer.from(dataUrl.split(',')[1], 'base64'));
const { width: W, height: H, data } = png;
const c = [];
for (let x = 0; x < W; x++) {
  let n = 0;
  for (let y = 0; y < H; y++) if (data[(y * W + x) * 4 + 3] > 8) n++;
  c.push(n);
}
const casa = W / 14;
for (let i = 0; i < 14; i++) {
  const x0 = Math.round(i * casa); const x1 = Math.round((i + 1) * casa);
  let n = 0; let a = -1; let bb = -1;
  for (let x = x0; x < x1; x++) if (c[x] > 0) { n++; if (a < 0) a = x; bb = x; }
  console.log(`casa ${String(i).padStart(2)} [${x0}..${x1 - 1}]: vel ${a}..${bb} ample ${n} (de ${x1 - x0})`);
}
await b.close();
