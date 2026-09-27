// TEMPORAL — no es comiteja. Les entrades del bucle de la tira de colors.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (let i = 1; i <= 3; i++) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(5000);
  const r = await p.evaluate(() => window.__hgCol || []);
  await ctx.close();
  console.log(`--- run ${i} ---`);
  for (const x of r.slice(0, 6)) console.log(`  t=${x.t} sTop=${x.sTop} sH=${x.sH} cTop=${x.cTop} cH=${x.cH} delta=${x.delta} pintat=${x.pintat}`);
}
await b.close();
