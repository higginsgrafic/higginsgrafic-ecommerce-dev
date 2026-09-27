// TEMPORAL — no es comiteja. Quant tarda el cadenat a apareixer (o si no surt).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [nom, tecles] of [['obertura amb el cercador', true]]) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  const t0 = Date.now();
  let vist = null;
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({
      cand: !!document.querySelector('button[aria-label="Bloca el megaslide"], button[aria-label="Desbloca el megaslide"]'),
      mb: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom').trim(),
      mba: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom-ample').trim(),
    }));
    if ((r.cand || r.mb) && !vist) { vist = { ms: Date.now() - t0, ...r }; console.log(nom, 'PRIMER SENYAL', JSON.stringify(vist)); break; }
  }
  if (!vist) console.log(nom, 'CAP SENYAL en 20 s', JSON.stringify(await p.evaluate(() => ({ cand: !!document.querySelector('button[aria-label="Bloca el megaslide"]'), mb: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-bottom').trim() }))));
  await ctx.close();
}
await b.close();
