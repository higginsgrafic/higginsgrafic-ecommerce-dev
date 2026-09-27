import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (let i = 1; i <= 3; i += 1) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const c = document.querySelector('[data-carrusel="1"]');
    return { passades: window.__hgPasses || [], final: c?.getAttribute('data-sonda-estat'), pintat: c?.querySelector('button')?.style.top };
  });
  console.log(`--- obertura ${i}  FINAL estat|ref=${r.final}  pintat=${r.pintat}`);
  for (const x of r.passades) console.log(`    t=${String(x.t).padStart(5)} estat|ref=${x.estat} pintat=${x.pintat}`);
  await ctx.close();
}
await b.close();
