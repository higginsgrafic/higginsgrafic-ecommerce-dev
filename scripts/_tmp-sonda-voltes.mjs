// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2200);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(4000);
const v = await p.evaluate(() => window.__hgVoltes || []);
console.log('voltes:', v.map((x) => `${x.t}#${x.i}`).join(' '));
const a = await p.evaluate(() => window.__hgAjust || []);
console.log('ajusta:', a.map((x) => `${x.t} dA=${x.deltaAlign} dC=${x.deltaCentra} gH=${x.gH} sTop=${x.sTop}`).join('\n         '));
const errs = await p.evaluate(() => window.__errs || []);
await b.close();
