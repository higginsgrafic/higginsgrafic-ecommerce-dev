// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1, serviceWorkers: 'block' })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
console.log('renders amb el panell tancat:', await p.evaluate(() => window.__p2render || 0), JSON.stringify(await p.evaluate(() => window.__p2stat || null)));
await p.evaluate(() => { window.__hgInact = []; window.__p2render = 0; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
console.log('renders despres d\'obrir:', await p.evaluate(() => window.__p2render || 0));
console.log('stat:', JSON.stringify(await p.evaluate(() => window.__p2stat || null)));
console.log('inact:', JSON.stringify(await p.evaluate(() => window.__hgInact || [])));
console.log('vel:', JSON.stringify(await p.evaluate(() => window.__vel || null)));
await b.close();
