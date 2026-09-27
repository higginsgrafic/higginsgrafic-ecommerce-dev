// TEMPORAL — no es comiteja. Una casa: que ensenya i a on porta, sense que res
// es mogui entremig (es llegeix abans i despres, i es comprova el desplacament).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
for (const casa of [0, 1, 5, 13]) {
  const q = await p.evaluate((c) => {
    const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${c}"]`);
    const bb = t.getBoundingClientRect();
    const img = t.querySelector('img');
    return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), src: (img?.currentSrc || '').split('/').pop() };
  }, casa);
  await p.mouse.click(q.x, q.y);
  await p.waitForTimeout(1100);
  const r = await p.evaluate(() => location.pathname);
  console.log(`casa ${String(casa).padStart(2)}  ensenya ${String(q.src).padEnd(32)} -> ${r}`);
  if (r !== '/nova/inici') { await p.goBack({ waitUntil: 'commit' }); await p.waitForTimeout(1400); }
}
await b.close();
