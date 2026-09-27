import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
for (const casa of [0, 5]) {
  const q = await p.evaluate((c) => { const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${c}"]`); const b2 = t.getBoundingClientRect(); return { x: Math.round(b2.left + b2.width / 2), y: Math.round(b2.top + b2.height / 2), vist: (t.querySelector('img')?.currentSrc || '').split('/').pop() }; }, casa);
  await p.evaluate(() => { window.__panell = null; });
  await p.mouse.click(q.x, q.y);
  await p.waitForTimeout(900);
  console.log(`casa ${casa} (es veu ${q.vist}) ->`, JSON.stringify(await p.evaluate(() => window.__panell)), '| url:', await p.evaluate(() => location.pathname));
  if ((await p.evaluate(() => location.pathname)) !== '/nova/inici') { await p.goBack({ waitUntil: 'commit' }); await p.waitForTimeout(1200); }
}
await b.close();
