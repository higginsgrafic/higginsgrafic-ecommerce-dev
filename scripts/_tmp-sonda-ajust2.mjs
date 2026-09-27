// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2200);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(4000);
const m = await p.evaluate(() => window.__hgAjust || []);
for (const x of m) console.log(`t=${String(x.t).padStart(5)} dAlign=${x.da} dCentra=${x.dc} alcadaFilera=${x.gh}`);
await b.close();
