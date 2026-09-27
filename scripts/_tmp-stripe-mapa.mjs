// TEMPORAL — no es comiteja. Per cada casa de la franja: quin dibuix ensenya i a
// quin producte porta el clic.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);

for (let casa = 0; casa <= 13; casa++) {
  const q = await p.evaluate((c) => {
    const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${c}"]`);
    if (!t) return null;
    const bb = t.getBoundingClientRect();
    const img = t.querySelector('img');
    return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), src: (img?.currentSrc || '').split('/').pop(), op: getComputedStyle(t).opacity };
  }, casa);
  if (!q) { console.log(`casa ${casa}: NO TROBADA`); continue; }
  await p.evaluate(() => { window.__hit = null; });
  await p.mouse.click(q.x, q.y);
  await p.waitForTimeout(900);
  const res = await p.evaluate(() => ({ url: location.pathname }));
  console.log(`casa ${String(casa).padStart(2)}  ensenya ${String(q.src).padEnd(32)} op=${q.op.padEnd(5)} -> ${res.url}`);
  if (res.url !== '/nova/inici') { await p.goBack({ waitUntil: 'commit' }); await p.waitForTimeout(1200); }
}
await b.close();
