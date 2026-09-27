// TEMPORAL — imatge de la diferencia entre dues captures (per veure el vel).
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [f1, f2, desti, guany] = process.argv.slice(2);
const a = PNG.sync.read(readFileSync(f1));
const b = PNG.sync.read(readFileSync(f2));
const G = Number(guany || 12);
const out = new PNG({ width: a.width, height: a.height });
for (let i = 0; i < a.width * a.height; i++) {
  const j = i * 4;
  const la = 0.2126 * a.data[j] + 0.7152 * a.data[j + 1] + 0.0722 * a.data[j + 2];
  const lb = 0.2126 * b.data[j] + 0.7152 * b.data[j + 1] + 0.0722 * b.data[j + 2];
  const v = Math.max(0, Math.min(255, Math.round(128 + (lb - la) * G)));
  out.data[j] = v; out.data[j + 1] = v; out.data[j + 2] = v; out.data[j + 3] = 255;
}
writeFileSync(desti, PNG.sync.write(out));
console.log(`${desti} (${f2} - ${f1}) x${G}`);
