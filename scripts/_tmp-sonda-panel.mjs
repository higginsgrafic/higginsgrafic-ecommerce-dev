// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
console.log('panell:', JSON.stringify(await p.evaluate(() => window.__panel)));
await b.close();
