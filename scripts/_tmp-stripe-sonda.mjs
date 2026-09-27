// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
for (const casa of [0, 5, 13]) {
  const q = await p.evaluate((c) => {
    const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${c}"]`);
    const bb = t.getBoundingClientRect();
    return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), src: (t.querySelector('img')?.currentSrc || '').split('/').pop() };
  }, casa);
  await p.evaluate(() => { window.__stripeHit = null; });
  await p.mouse.click(q.x, q.y);
  await p.waitForTimeout(900);
  const h = await p.evaluate(() => window.__hit0);
  const url = await p.evaluate(() => location.pathname);
  console.log(`casa ${String(casa).padStart(2)} (${q.src})`);
  console.log('   clic px:', q.x + ',' + q.y, '| sonda:', JSON.stringify(h));
  console.log('   ->', url);
  if (url !== '/nova/inici') { await p.goBack({ waitUntil: 'commit' }); await p.waitForTimeout(1400); }
}
await b.close();
