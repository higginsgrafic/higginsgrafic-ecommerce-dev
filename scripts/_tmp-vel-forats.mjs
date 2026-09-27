// TEMPORAL — no es comiteja. Els forats (columnes sense vel) dins de cada casa.
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const fitxer = process.argv[2] || '_tmp-vel-img-miscellania.png';
const png = PNG.sync.read(readFileSync(fitxer));
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
  let dins = false; let ini = 0; const trams = [];
  for (let x = x0; x < x1; x++) {
    if (c[x] > 0 && !dins) { dins = true; ini = x; }
    else if (c[x] === 0 && dins) { dins = false; trams.push(`${ini}..${x - 1}`); }
  }
  if (dins) trams.push(`${ini}..${x1 - 1}`);
  console.log(`casa ${String(i).padStart(2)} [${x0}..${x1 - 1}]: ${trams.join('  ')}`);
}
