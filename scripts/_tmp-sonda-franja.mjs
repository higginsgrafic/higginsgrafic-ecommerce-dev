// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.evaluate(() => { window.__hgFranja = []; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
console.log('en obrir:', JSON.stringify(await p.evaluate(() => window.__hgFranja)));
for (const nom of ['THE HUMAN INSIDE', 'CUBE']) {
  const card = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === n) || null, nom);
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1300);
  console.log(nom + ':', JSON.stringify(await p.evaluate(() => window.__hgFranja.slice(-2))));
}
await b.close();
