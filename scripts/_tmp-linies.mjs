// TEMPORAL — no es comiteja. El valor aplicat de desnivellsLinies.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306], [1680, 900], [2000, 1000], [1400, 900], [1366, 768], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => window.__hgLinies || null);
  console.log(`${String(w + 'x' + h).padEnd(10)} ${r ? JSON.stringify(r) : 'sense sonda'}`);
  await ctx.close();
}
await b.close();
