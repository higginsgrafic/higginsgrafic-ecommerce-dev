// TEMPORAL — no es comiteja. Les cases de la franja tenen imatge amb src?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const imgs = tiles.map((t) => {
    const i = t.querySelector('img');
    return { casa: t.getAttribute('data-stripe-tile'), te: !!i, attr: i?.getAttribute('src')?.slice(0, 60) ?? null, curt: (i?.currentSrc || '').split('/').pop() || null, natural: i ? `${i.naturalWidth}x${i.naturalHeight}` : null };
  });
  return { total: tiles.length, ambImg: imgs.filter((x) => x.te).length, ambSrc: imgs.filter((x) => x.attr).length, primeres: imgs.slice(0, 4) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
