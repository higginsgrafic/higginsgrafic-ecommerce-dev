import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (let i = 1; i <= 3; i += 1) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const m = await p.evaluate(() => window.__hgFiles || []);
  console.log(`--- obertura ${i}`);
  for (const x of m) console.log(`  t=${String(x.t).padStart(5)} d0=${String(x.d0).padStart(7)} d1=${String(x.d1).padStart(7)} lin=${x.lin0}/${x.lin1} obj=${x.obj0}/${x.obj1} tiraTop=${x.tiraTop} ref=${x.ref} pintat=${x.pintat}`);
  await ctx.close();
}
await b.close();
