import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [a, b, out, guany] = process.argv.slice(2);
const A = PNG.sync.read(readFileSync(a));
const B = PNG.sync.read(readFileSync(b));
const g = Number(guany || 8);
const o = new PNG({ width: A.width, height: A.height });
for (let i = 0; i < A.width * A.height; i++) {
  const k = i * 4;
  const d = Math.max(Math.abs(A.data[k] - B.data[k]), Math.abs(A.data[k + 1] - B.data[k + 1]), Math.abs(A.data[k + 2] - B.data[k + 2]));
  const v = Math.min(255, d * g);
  o.data[k] = v; o.data[k + 1] = v; o.data[k + 2] = v; o.data[k + 3] = 255;
}
writeFileSync(out, PNG.sync.write(o));
console.log(`${out} (${A.width}x${A.height}) guany ${g}`);
