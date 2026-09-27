// TEMPORAL — no es comiteja. Marge de dalt i coixi de baix del bloc de la franja (z-0).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [2000, 1000], [1680, 900], [1512, 900], [1440, 800], [1400, 900], [2560, 1306], [1366, 768], [1280, 720], [1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    let z0 = franja;
    while (z0 && !(z0.className || '').toString().includes('z-0')) z0 = z0.parentElement;
    const c = z0 ? getComputedStyle(z0) : null;
    return {
      mt: c ? c.marginTop : null,
      pb: c ? c.paddingBottom : null,
      pl: c ? c.paddingLeft : null,
      esFranjaEstenya: getComputedStyle(document.documentElement).getPropertyValue('--megaStripeScale').trim(),
    };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} mt ${String(r.mt).padStart(6)} pb ${String(r.pb).padStart(6)} pl ${String(r.pl).padStart(6)}`);
  await ctx.close();
}
await b.close();
