// TEMPORAL — no es comiteja. Cobertura (alfa) de la imatge del vel, amb el
// resultat en text: per cada casa, on arrenca i on acaba el vel.
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const fitxer = process.argv[2] || '_tmp-vel-img-miscellania.png';
const png = PNG.sync.read(readFileSync(fitxer));
const { width: W, height: H, data } = png;
const coberts = [];
for (let x = 0; x < W; x++) {
  let n = 0;
  for (let y = 0; y < H; y++) if (data[(y * W + x) * 4 + 3] > 8) n++;
  coberts.push(n);
}
const casa = W / 14;
const linies = [`mida ${W}x${H}, casa ${casa.toFixed(1)}`];
for (let i = 0; i < 14; i++) {
  const x0 = Math.round(i * casa); const x1 = Math.round((i + 1) * casa);
  let a = -1; let b = -1; let n = 0;
  for (let x = x0; x < x1; x++) if (coberts[x] > 0) { if (a < 0) a = x; b = x; n++; }
  const centreCasa = (x0 + x1) / 2;
  linies.push(`casa ${String(i).padStart(2)}: casa ${x0}..${x1} (centre ${centreCasa.toFixed(1)}) | vel ${a}..${b} (centre ${((a + b) / 2).toFixed(1)}) | ample ${b - a + 1} | columnes ${n}`);
}
writeFileSync('_tmp-vel-cobertura.txt', linies.join('\n') + '\n');
console.log(linies.join('\n'));
// Imatge amb contrast (alfa x4) per poder-la mirar
const out = new PNG({ width: W, height: H });
for (let i = 0; i < W * H; i++) {
  const v = Math.min(255, data[i * 4 + 3] * 4);
  out.data[i * 4] = v; out.data[i * 4 + 1] = v; out.data[i * 4 + 2] = v; out.data[i * 4 + 3] = 255;
}
writeFileSync('_tmp-vel-alfa.png', PNG.sync.write(out));
console.log('desat _tmp-vel-alfa.png');
