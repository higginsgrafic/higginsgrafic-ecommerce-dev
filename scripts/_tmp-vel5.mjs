// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.evaluate(() => { window.__hgInact = []; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);
console.log('__hgInact:', JSON.stringify(await p.evaluate(() => window.__hgInact.slice(-3)), null, 1));
await b.close();
