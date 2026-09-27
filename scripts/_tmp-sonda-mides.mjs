// TEMPORAL — no es comiteja. Llegeix les mesures que fa la graella en obrir-se.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(4000);
const m = await p.evaluate(() => (window.__hgMides || []).filter((x) => x.t > 0).slice(0, 30));
for (const x of m) {
  console.log(`t=${String(x.t).padStart(5)} ample=${x.ampleAmple} dalt=${String(x.daltGraella).padStart(7)} sostre=${String(x.sostre).padStart(7)} v2H=${x.v2H} v2Top=${x.v2Top} -> dibuix=${x.dibuix} gapH=${x.gapH} gapV=${x.gapV}`);
}
await b.close();
