import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [fitxer, sx, sy, sw, sh, factor, desti] = process.argv.slice(2);
const png = PNG.sync.read(readFileSync(fitxer));
const x0 = Math.round(Number(sx)); const y0 = Math.round(Number(sy));
const w = Math.round(Number(sw)); const h = Math.round(Number(sh));
const f = Number(factor);
const out = new PNG({ width: w * f, height: h * f });
for (let y = 0; y < h * f; y++) {
  for (let x = 0; x < w * f; x++) {
    const srcX = Math.min(png.width - 1, x0 + Math.floor(x / f));
    const srcY = Math.min(png.height - 1, y0 + Math.floor(y / f));
    const i = (srcY * png.width + srcX) * 4;
    const o = (y * w * f + x) * 4;
    out.data[o] = png.data[i]; out.data[o + 1] = png.data[i + 1]; out.data[o + 2] = png.data[i + 2]; out.data[o + 3] = 255;
  }
}
writeFileSync(desti, PNG.sync.write(out));
console.log(`${desti} ${w * f}x${h * f} (de ${png.width}x${png.height}, origen ${x0},${y0})`);
