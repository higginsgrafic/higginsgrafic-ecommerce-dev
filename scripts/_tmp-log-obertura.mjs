import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__hgLog = []; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
const log = await p.evaluate(() => window.__hgLog || []);
let t0 = null;
for (const x of log) { if (t0 === null) t0 = x.t; }
for (const x of log) {
  const v = typeof x.valor === 'object' ? JSON.stringify(x.valor) : x.valor;
  console.log(`+${String(x.t - t0).padStart(5)} ms  ${x.nom.padEnd(18)} ${v}`);
}
await b.close();
