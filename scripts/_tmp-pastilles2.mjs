// TEMPORAL — no es comiteja. En clicar una altra colleccio, la pastilla hi va?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const estat = () => p.evaluate(() => [...document.querySelectorAll('[data-colleccions-targeta]')].filter((x) => getComputedStyle(x).backgroundColor !== 'rgba(0, 0, 0, 0)').map((x) => (x.textContent || '').trim()));
console.log('abans :', JSON.stringify(await estat()));
// Clic a THE HUMAN INSIDE (una altra colleccio)
const targeta = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((x) => /THE HUMAN INSIDE/i.test(x.textContent || '')) || null);
const bb = await targeta.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(1500);
console.log('despres:', JSON.stringify(await estat()));
console.log('url:', p.url());
await b.close();
