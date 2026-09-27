// TEMPORAL — no es comiteja. Els DOS panells de la p2 en vertical: vel imatge i vel paths.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=miscellania', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franjas = [...v2.querySelectorAll('[data-stripe-visual-content="2"]')];
  const te = (el) => el.getAttribute('data-stripe-visual-content') === '2';
  const out = franjas.map((franja, i) => {
    const cs = getComputedStyle(franja);
    const par = franja.parentElement ? getComputedStyle(franja.parentElement) : null;
    const rr = franja.getBoundingClientRect();
    const svgs = [...franja.querySelectorAll('svg')].map((svg) => {
      const sr = svg.getBoundingClientRect();
      const ps = [...svg.querySelectorAll('path')];
      return {
        rect: `${Math.round(sr.left)},${Math.round(sr.top)} ${Math.round(sr.width)}x${Math.round(sr.height)}`,
        z: getComputedStyle(svg).zIndex,
        n: ps.length,
        ambVel: ps.filter((x) => x.getAttribute('fill-opacity') !== null).length,
        velPaths: ps.filter((x) => x.getAttribute('fill-opacity') !== null).slice(0, 4).map((x) => ({ fo: x.getAttribute('fill-opacity'), fill: x.getAttribute('fill'), tr: (x.getAttribute('transform') || '').slice(0, 46) })),
      };
    });
    const imgs = [...franja.querySelectorAll('img')].map((im) => {
      const ir = im.getBoundingClientRect();
      const s = im.getAttribute('src') || '';
      return { rect: `${Math.round(ir.left)},${Math.round(ir.top)} ${Math.round(ir.width)}x${Math.round(ir.height)}`, z: getComputedStyle(im).zIndex, op: getComputedStyle(im).opacity, vis: getComputedStyle(im).visibility, data: s.startsWith('data:'), src: s.slice(0, 30) };
    });
    return {
      i,
      rect: `${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}`,
      op: cs.opacity,
      vis: cs.visibility,
      overflow: cs.overflow,
      pareVis: par ? par.visibility : null,
      pareTransform: par ? par.transform : null,
      svgs,
      imgsVel: imgs.filter((x) => x.data),
      nImgs: imgs.length,
    };
  });
  return { n: franjas.length, out };
});
console.log('franjas amb data-stripe-visual-content=2:', r.n);
for (const f of r.out) {
  console.log(`\n--- franja ${f.i}: ${f.rect} op=${f.op} vis=${f.vis} overflow=${f.overflow} pare(vis=${f.pareVis} tf=${f.pareTransform}) imgs=${f.nImgs}`);
  for (const s of f.svgs) console.log(`    svg ${s.rect} z${s.z} paths=${s.n} ambVel=${s.ambVel}`, JSON.stringify(s.velPaths));
  for (const im of f.imgsVel) console.log(`    img VEL ${im.rect} z${im.z} op${im.op} vis${im.vis} ${im.src}`);
}
await ctx.close();
await b.close();
