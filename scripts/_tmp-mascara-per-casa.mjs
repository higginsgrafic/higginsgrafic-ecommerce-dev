// TEMPORAL — experiment: la mascara del vel amb el retall PER CASA (avui el
// `clipPath` te els catorze rectangles i, per tant, el retall es la UNIO: la
// silueta d'una casa activa esborra el vel del COS de la casa velada del
// costat). Compara amb el retall actual.
import { chromium } from '@playwright/test';
const ACT = process.argv[2] || 'cube';
const COLOR = Number(process.argv[3] ?? 6);
const MODE = process.argv[4] || 'per-casa';
const DSF = Number(process.argv[5] || 3);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: DSF });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${ACT}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
if (COLOR >= 0) {
  const c = await p.evaluate((i) => {
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const g = v.querySelector('[data-p2-color-grid]');
    const btns = g ? [...g.querySelectorAll('button')] : [];
    if (!btns[i]) return null;
    const r = btns[i].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  }, COLOR);
  if (c) { await p.mouse.click(c.x, c.y); await p.waitForTimeout(1500); }
}
const res = await p.evaluate((mode) => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  const img = [...franja.querySelectorAll('img')].find((i) => (i.getAttribute('src') || '').startsWith('data:image/svg+xml'));
  if (!img) return 'sense vel';
  const text = decodeURIComponent(img.getAttribute('src').replace(/^data:image\/svg\+xml,/, ''));
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svg = doc.documentElement;
  const NS = 'http://www.w3.org/2000/svg';
  const clip = svg.querySelector('clipPath[id$="Cos"]');
  if (!clip) return 'sense clipPath del cos';
  const rects = [...clip.querySelectorAll('rect')].map((r) => ({
    x: +r.getAttribute('x'), y: +r.getAttribute('y'), w: +r.getAttribute('width'), h: +r.getAttribute('height'),
  }));
  if (mode === 'per-casa') {
    // un clipPath per casa, amb NOME'S el seu rectangle
    const gs = [...svg.querySelectorAll('g[clip-path]')];
    gs.forEach((g) => {
      const path = g.querySelector('path');
      const tr = path ? (path.getAttribute('transform') || '') : '';
      const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(tr);
      const tx = m ? Number(m[1]) : null;
      // la casa: el centre de la casa 0 es a 152,78 i el pas es 196,9
      const casa = tx === null ? -1 : Math.round((tx - 152.780) / 196.9);
      if (casa < 0 || casa >= rects.length) return;
      const id = `hgCosCasa-${casa}`;
      if (!svg.querySelector(`#${id}`)) {
        const cp = doc.createElementNS(NS, 'clipPath');
        cp.setAttribute('id', id);
        cp.setAttribute('clipPathUnits', 'userSpaceOnUse');
        const r = doc.createElementNS(NS, 'rect');
        const rr = rects[casa];
        r.setAttribute('x', String(rr.x));
        r.setAttribute('y', String(rr.y));
        r.setAttribute('width', String(rr.w));
        r.setAttribute('height', String(rr.h));
        cp.appendChild(r);
        svg.insertBefore(cp, svg.firstChild);
      }
      g.setAttribute('clip-path', `url(#${id})`);
    });
  }
  img.setAttribute('src', `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`);
  return `${rects.length} finestres; ${svg.querySelectorAll('g[clip-path]').length} siluetes negres`;
}, MODE);
console.log('patxi:', res);
const rect = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const r = v.querySelector('[data-stripe-visual-content="2"]').getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
});
await p.waitForTimeout(500);
await p.screenshot({ path: `_tmp-rombe-${ACT}-${COLOR}-${MODE}.png`, clip: rect });
console.log(`desat _tmp-rombe-${ACT}-${COLOR}-${MODE}.png`);
await ctx.close();
await b.close();
