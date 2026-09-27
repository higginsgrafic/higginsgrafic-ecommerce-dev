// TEMPORAL — mapa de to (foscor) d'una captura PNG, en ASCII. Per veure la
// forma del rombe i on cau exactament.
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const [fitxer, sx, sy, sw, sh, pas] = process.argv.slice(2);
const png = PNG.sync.read(readFileSync(fitxer));
const x0 = Math.round(Number(sx)); const y0 = Math.round(Number(sy));
const w = Math.round(Number(sw)); const h = Math.round(Number(sh));
const P = Math.max(1, Math.round(Number(pas || 4)));
const X = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
let cap = '';
for (let y = y0; y < y0 + h; y += P) {
  let linia = '';
  for (let x = x0; x < x0 + w; x += P) {
    const i = (y * png.width + x) * 4;
    const l = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
    const k = Math.min(9, Math.max(0, Math.round((255 - l) / 255 * 9 * 3)));
    linia += X[k];
  }
  cap += linia + '\n';
}
console.log(`regio ${x0},${y0} ${w}x${h} pas ${P} (foscor: espai=blanc, @=fosc)`);
console.log(cap);
