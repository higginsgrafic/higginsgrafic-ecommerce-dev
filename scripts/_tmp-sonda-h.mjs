import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
for (const casa of [0, 13]) {
  const q = await p.evaluate((c) => {
    const t = document.querySelector(`[data-mega-page-viewport="2"] [data-stripe-tile="${c}"]`);
    const bb = t.getBoundingClientRect();
    return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), src: (t.querySelector('img')?.currentSrc || '').split('/').pop() };
  }, casa);
  await p.evaluate(() => { window.__h = null; });
  await p.mouse.click(q.x, q.y);
  await p.waitForTimeout(900);
  console.log(`casa ${casa} (${q.src}) ->`, JSON.stringify(await p.evaluate(() => window.__h)), '| url:', await p.evaluate(() => location.pathname));
  await p.goBack({ waitUntil: 'commit' }); await p.waitForTimeout(1400);
}
await b.close();
