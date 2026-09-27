// TEMPORAL — no es comiteja. Les 244 calibracions obeeixen una regla?
import fs from 'node:fs';
import sharp from 'sharp';
const src = fs.readFileSync('src/config/stripeCalibrations.js', 'utf8');
const RE = /'([^']+)':\s*\{\s*dx:\s*(-?[\d.]+),\s*dy:\s*(-?[\d.]+),\s*scale:\s*([\d.]+)\s*\}/g;
const entrades = [];
let m;
while ((m = RE.exec(src)) !== null) entrades.push({ url: m[1], dx: +m[2], dy: +m[3], scale: +m[4] });
const files = entrades.filter((e) => e.url.startsWith('/custom_logos/drawings/images_stripe/'));
console.log(`entrades: ${entrades.length}  (de la franja: ${files.length})`);
const mostres = [];
for (const e of files.slice(0, 26)) {
  const disc = `public${e.url}`;
  if (!fs.existsSync(disc)) { mostres.push({ ...e, error: 'sense fitxer' }); continue; }
  const meta = await sharp(disc).metadata();
  mostres.push({ ...e, nw: meta.width, nh: meta.height, ample: +(meta.width * e.scale).toFixed(1), alt: +(meta.height * e.scale).toFixed(1) });
}
console.log('mostra (px de la franja, en unitats del fitxer base):');
for (const x of mostres) {
  if (x.error) { console.log(`  ${x.url.split('/').pop()}  ${x.error}`); continue; }
  console.log(`  ${x.url.split('/').pop().padEnd(42)} nat ${String(x.nw).padStart(4)}x${String(x.nh).padStart(4)}  scale ${x.scale}  ->  ample ${String(x.ample).padStart(5)}  alt ${String(x.alt).padStart(5)}  dy ${x.dy}`);
}
const ok = mostres.filter((x) => x.ample);
const amples = ok.map((x) => x.ample);
const alts = ok.map((x) => x.alt);
const min = (a) => Math.min(...a); const max = (a) => Math.max(...a);
console.log(`\nAMPLE: ${min(amples)} .. ${max(amples)}  (mitjana ${(amples.reduce((s, v) => s + v, 0) / amples.length).toFixed(1)})`);
console.log(`ALT:   ${min(alts)} .. ${max(alts)}  (mitjana ${(alts.reduce((s, v) => s + v, 0) / alts.length).toFixed(1)})`);
