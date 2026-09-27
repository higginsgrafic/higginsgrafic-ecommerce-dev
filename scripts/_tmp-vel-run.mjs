// TEMPORAL — no es comiteja. Els trams amb vel i sense, en cru.
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const png = PNG.sync.read(readFileSync(process.argv[2] || '_tmp-vel-img-miscellania.png'));
const { width: W, height: H, data } = png;
const c = [];
for (let x = 0; x < W; x++) {
  let n = 0;
  for (let y = 0; y < H; y++) if (data[(y * W + x) * 4 + 3] > 8) n++;
  c.push(n);
}
let dins = false; let ini = 0; const amb = []; const sense = [];
for (let x = 0; x < W; x++) {
  if (c[x] > 0 && !dins) { dins = true; ini = x; }
  else if (c[x] === 0 && dins) { dins = false; amb.push(`${ini}..${x - 1}`); }
}
if (dins) amb.push(`${ini}..${W - 1}`);
dins = false;
for (let x = 0; x < W; x++) {
  if (c[x] === 0 && !dins) { dins = true; ini = x; }
  else if (c[x] > 0 && dins) { dins = false; sense.push(`${ini}..${x - 1}`); }
}
if (dins) sense.push(`${ini}..${W - 1}`);
console.log('AMB VEL :', amb.join('  '));
console.log('SENSE   :', sense.join('  '));
