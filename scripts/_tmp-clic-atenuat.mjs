// TEMPORAL — no es comiteja. El clic a una samarreta ATENUADA de la franja.
// Us: node scripts/_tmp-clic-atenuat.mjs <indexDeCasella>
import { chromium } from '@playwright/test';

const idx = Number(process.argv[2] ?? 7);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);

const r = await p.evaluate((i) => {
  const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${i}"]`);
  if (!t) return null;
  const bb = t.getBoundingClientRect();
  const img = t.querySelector('img');
  return { x: bb.left + bb.width / 2, y: bb.top + bb.height / 2, op: getComputedStyle(t).opacity, dibuix: (img.currentSrc || '').split('/').pop() };
}, idx);
if (!r) { console.log(`casella ${idx}: no hi es`); }
else {
  await p.mouse.click(r.x, r.y);
  await p.waitForTimeout(3000);
  const res = await p.evaluate(() => ({
    url: location.pathname,
    titol: (document.title || '').slice(0, 44),
    noTro: /no trobat/i.test(document.body.innerText || ''),
  }));
  console.log(`casella ${idx} (${r.dibuix}, op ${r.op}):`, JSON.stringify(res));
}
console.log('errors:', errs.length, errs.slice(0, 2));
await b.close();
