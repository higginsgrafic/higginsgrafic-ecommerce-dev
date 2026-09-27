// TEMPORAL — no es comiteja. Els primers 1,2 s, amb la sonda del strip.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1000);
await p.evaluate(() => { window.__mostres = []; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
const vist = [];
for (let k = 0; k < 70; k++) {
  const s = await p.evaluate(() => {
    const st = window.__HG_STRIP__ || null;
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2?.querySelector('[data-stripe-visual-content="2"]');
    if (!franja) return { n: st ? st.n : 'sonde?', srcs: '(sense franja)', opac: '' };
    const cases = [...franja.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
    const srcs = cases.map((el) => (el.getAttribute('data-stripe-src') || '').split('/').pop().replace('-stripe.webp', '').slice(0, 8)).join(',');
    const opac = cases.map((el) => { const img = el.querySelector('img'); return img && img.parentElement ? Number(getComputedStyle(img.parentElement).opacity).toFixed(2) : '?'; }).join(',');
    return { n: st ? st.n : 'sense sonda', offset: st ? st.offset : null, colls: st ? st.colls.join('').slice(0, 30) : '', srcs, opac };
  });
  vist.push(s);
  await p.waitForTimeout(16);
}
let previ = null;
for (const s of vist) {
  const clau = JSON.stringify(s);
  if (clau !== previ) { console.log(`n=${s.n} offset=${s.offset} colls=${s.colls}\n   srcs=${s.srcs}\n   opac=${s.opac}`); previ = clau; }
}
console.log('--- fi');
await ctx.close();
await b.close();
