// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__pintor = []; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
const r = await p.evaluate(() => (window.__pintor || []).slice(-6));
console.log(JSON.stringify(r, null, 1));
await b.close();
