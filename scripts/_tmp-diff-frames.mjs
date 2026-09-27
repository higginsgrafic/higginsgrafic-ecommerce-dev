// TEMPORAL — no es comiteja. Quins fotogrames pintats son diferents i on?
import sharp from 'sharp';
import fs from 'node:fs';
const noms = fs.readdirSync('scripts').filter((f) => f.startsWith('_tmp-frame-')).sort();
const imgs = [];
for (const n of noms) {
  const { data, info } = await sharp(`scripts/${n}`).greyscale().raw().toBuffer({ resolveWithObject: true });
  imgs.push({ n, data, w: info.width, h: info.height });
}
console.log(`${imgs.length} fotogrames`);
for (let i = 1; i < imgs.length; i += 1) {
  const A = imgs[i - 1]; const B = imgs[i];
  let n = 0; let minX = 1e9; let maxX = -1; let minY = 1e9; let maxY = -1;
  for (let y = 0; y < A.h; y += 3) {
    for (let x = 0; x < A.w; x += 3) {
      if (Math.abs(A.data[y * A.w + x] - B.data[y * B.w + x]) > 18) {
        n += 1;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (n > 30) console.log(`  ${A.n} -> ${B.n}: ${n} punts canvien, caixa x ${minX}..${maxX} y ${minY}..${maxY}`);
}
