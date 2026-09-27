// TEMPORAL — no es comiteja. La franja canvia sola despres d'obrir?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'first_contact';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1200);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const mostres = [];
for (let k = 0; k < 60; k++) {
  const s = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2?.querySelector('[data-stripe-visual-content="2"]');
    if (!franja) return null;
    const cases = [...franja.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
    return cases.map((el) => {
      const img = el.querySelector('img');
      const pop = img && img.parentElement ? getComputedStyle(img.parentElement).opacity : null;
      const src = (el.getAttribute('data-stripe-src') || '').split('/').pop().replace('-stripe.webp', '').slice(0, 12);
      return `${src}|${pop}`;
    }).join(' ');
  }).catch(() => null);
  if (s) mostres.push({ t: k * 500, s });
  await p.waitForTimeout(500);
}
let previ = null;
for (const m of mostres) {
  if (m.s !== previ) { console.log(`t=${String(m.t).padStart(6)}ms  ${m.s}`); previ = m.s; }
}
console.log(`mostres ${mostres.length}, estats diferents ${mostres.filter((m, i) => i === 0 || m.s !== mostres[i - 1].s).length}`);
await ctx.close();
await b.close();
