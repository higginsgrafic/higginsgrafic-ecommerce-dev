import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [inp, out, x0s, x1s, escs] = process.argv.slice(2);
const src = PNG.sync.read(readFileSync(inp));
const x0 = Number(x0s); const x1 = Number(x1s); const esc = Number(escs || 3);
const w = x1 - x0; const h = src.height;
const dst = new PNG({ width: w * esc, height: h * esc });
for (let y = 0; y < h * esc; y++) {
  for (let x = 0; x < w * esc; x++) {
    const sx = x0 + Math.floor(x / esc); const sy = Math.floor(y / esc);
    const k = (sy * src.width + sx) * 4; const d = (y * w * esc + x) * 4;
    dst.data[d] = src.data[k]; dst.data[d + 1] = src.data[k + 1]; dst.data[d + 2] = src.data[k + 2]; dst.data[d + 3] = 255;
  }
}
writeFileSync(out, PNG.sync.write(dst));
console.log(`${out} ${w * esc}x${h * esc}`);
