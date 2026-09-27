// TEMPORAL — no es comiteja. Que canvia als primers 3 s?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'first_contact';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const vist = [];
for (let k = 0; k < 40; k++) {
  const s = await p.evaluate(() => {
    const st = window.__HG_STRIP__ || null;
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2?.querySelector('[data-stripe-visual-content="2"]');
    const opac = franja ? [...franja.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile'))).map((el) => {
      const img = el.querySelector('img');
      return img && img.parentElement ? getComputedStyle(img.parentElement).opacity : '?';
    }).join(',') : null;
    return st ? { active: st.active, n: st.n, offset: st.offset, colls: st.colls.join(''), srcs: st.srcs.join(','), opac } : null;
  }).catch(() => null);
  if (s) vist.push(s);
  await p.waitForTimeout(75);
}
let previ = null;
for (const s of vist) {
  const clau = `${s.active}|${s.n}|${s.offset}|${s.colls}|${s.srcs}|${s.opac}`;
  if (clau !== previ) { console.log(`active=${s.active} n=${s.n} offset=${s.offset}\n   colls=${s.colls}\n   srcs =${s.srcs}\n   opac =${s.opac}`); previ = clau; }
}
console.log('--- fi');
await ctx.close();
await b.close();
