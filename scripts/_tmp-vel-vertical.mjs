// TEMPORAL — no es comiteja. El SVG del vel a la vista vertical.
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
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const svgs = [...franja.querySelectorAll('svg')];
  const paths = svgs.map((svg, si) => [...svg.querySelectorAll('path')].map((x) => ({
    si,
    fill: x.getAttribute('fill'),
    fo: x.getAttribute('fill-opacity'),
    st: x.getAttribute('stroke'),
    id: x.getAttribute('id'),
    tr: (x.getAttribute('transform') || '').slice(0, 30),
  })));
  const imgs = [...franja.querySelectorAll('img')].map((im) => ({ z: getComputedStyle(im).zIndex, src: (im.getAttribute('src') || '').slice(0, 40) }));
  const vels = [...franja.querySelectorAll('img')].filter((im) => (im.getAttribute('src') || '').startsWith('data:')).map((im) => {
    const s = decodeURIComponent(im.getAttribute('src'));
    return { z: getComputedStyle(im).zIndex, np: (s.match(/<path/g) || []).length, fos: [...s.matchAll(/fill-opacity="([^"]*)"/g)].map((m) => m[1]).join(',') };
  });
  const rects = svgs.map((svg) => { const r = svg.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
  return { sonde: window.__HG_VEL__ || null, nSvgs: svgs.length, paths, rects, imgs, vels,
    franjaRect: (() => { const r = franja.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`; })(),
    imgsRects: [...franja.querySelectorAll('img')].map((im) => { const r = im.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} ${(im.getAttribute('src')||'').slice(0,26)}`; }) };
});
console.log('SONDA:', JSON.stringify(r.sonde && { n: r.sonde.n, offset: r.sonde.offset, active: r.sonde.active, idx: r.sonde.idx }));
console.log('franja', r.franjaRect, '| svgs:', r.nSvgs, r.rects);
for (const [si, ps] of r.paths.entries()) {
  const ambFill = ps.filter((x) => x.fo || x.fill);
  console.log(`  svg ${si}: ${ps.length} paths, amb fill/fill-opacity: ${ambFill.length}`);
  for (const x of ambFill.slice(0, 16)) console.log('     ', JSON.stringify(x));
}
console.log('rects imgs:'); for (const x of r.imgsRects) console.log('   ', x);
console.log('imatges:', JSON.stringify(r.imgs));
console.log('imatges data:', JSON.stringify(r.vels));
await ctx.close();
await b.close();
