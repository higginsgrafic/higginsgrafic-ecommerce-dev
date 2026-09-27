import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1366, 768], [1280, 720], [1920, 946]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(3500);
  const m = await p.evaluate(() => window.__hgAjust || []);
  console.log(`--- ${w}x${h}`);
  for (const x of m) console.log(`  t=${String(x.t).padStart(5)} dAlign=${x.da} dCentra=${x.dc} alcadaFilera=${x.gh} selectorTop=${x.st} selectorAlt=${x.sh}`);
  await p.close();
}
await b.close();
