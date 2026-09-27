// TEMPORAL — diferencia dues captures de la franja (ple vs nomes-tinta) i en
// fa un mapa: on el vel afegeix mes (doble vel) i on n'afegeix menys.
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const [f1, f2, sx, sy, sw, sh, pas] = process.argv.slice(2);
const a = PNG.sync.read(readFileSync(f1));
const b = PNG.sync.read(readFileSync(f2));
const x0 = Math.round(Number(sx || 0)); const y0 = Math.round(Number(sy || 0));
const w = Math.round(Number(sw || a.width)); const h = Math.round(Number(sh || a.height));
const P = Math.max(1, Math.round(Number(pas || 4)));
const lum = (p, x, y) => { const i = (y * p.width + x) * 4; return 0.2126 * p.data[i] + 0.7152 * p.data[i + 1] + 0.0722 * p.data[i + 2]; };
let cap = '';
for (let y = y0; y < y0 + h && y < a.height; y += P) {
  let linia = '';
  for (let x = x0; x < x0 + w && x < a.width; x += P) {
    const d = lum(b, x, y) - lum(a, x, y);
    if (d > 6.5) linia += '@';
    else if (d > 3.5) linia += '#';
    else if (d > 1.5) linia += '+';
    else if (d < -1.5) linia += 'o';
    else linia += ' ';
  }
  cap += linia + '\n';
}
console.log(`diff ${f2} - ${f1}  regio ${x0},${y0} ${w}x${h} pas ${P}`);
console.log('  @ mes de +6.5 (doble vel) · # +3.5..6.5 (vel) · + +1.5..3.5 · o negatiu');
console.log(cap);
