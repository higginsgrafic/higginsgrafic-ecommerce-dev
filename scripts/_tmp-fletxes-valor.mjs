// TEMPORAL — no es comiteja. El margeBaixFletxes aplicat (bottom negat).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306], [1680, 900], [2000, 1000], [1400, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const c = v2.querySelector('[data-carrusel="1"]');
    const fletxes = c && c.children[1] ? c.children[1] : null;
    return { bottom: fletxes ? +Number.parseFloat(getComputedStyle(fletxes).bottom).toFixed(3) : null };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} margeBaixFletxes ${r.bottom == null ? '—' : (-r.bottom).toFixed(3)}`);
  await ctx.close();
}
await b.close();
