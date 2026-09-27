// TEMPORAL — no es comiteja. Segueix la sonda del vel i la imatge del DOM al llarg del temps.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await ctx.addInitScript(() => {});
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const samples = await p.evaluate(async () => {
  const out = [];
  const decode = (url) => {
    const svg = decodeURIComponent(url.replace(/^data:image\/svg\+xml,/, ''));
    const re = /<path[^>]*>/g;
    let m;
    const idxs = [];
    let i = 0;
    while ((m = re.exec(svg))) {
      if (/fill-opacity="0\.6"/.test(m[0])) idxs.push(i);
      i += 1;
    }
    return idxs.join(',');
  };
  const foto = (t) => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2?.querySelector('[data-stripe-visual-content="2"]');
    const img = franja ? [...franja.querySelectorAll('img')].find((im) => (im.getAttribute('src') || '').startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(im.getAttribute('src')))) : null;
    const s = window.__HG_VEL__ || null;
    const cases = franja ? [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => el.getAttribute('data-stripe-collection')).join(',') : '';
    out.push({
      t: Math.round(t),
      offset: s ? s.offset : null,
      idx: s ? s.idx.join(',') : null,
      dom: img ? decode(img.getAttribute('src')) : null,
      cases: cases.slice(0, 70),
    });
  };
  foto(0);
  for (let k = 1; k <= 24; k++) {
    await new Promise((r) => setTimeout(r, 250));
    foto(k * 250);
  }
  return out;
});
for (const s of samples) {
  console.log(`t=${String(s.t).padStart(5)} offset=${String(s.offset).padStart(4)} sonda=[${String(s.idx).padEnd(40)}] dom=[${String(s.dom).padEnd(40)}] ${s.offset !== null && String(s.idx) === String(s.dom) ? 'ok' : 'DIFERENT'}`);
}
await ctx.close();
await b.close();
