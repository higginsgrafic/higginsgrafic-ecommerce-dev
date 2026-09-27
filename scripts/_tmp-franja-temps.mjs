// TEMPORAL — no es comita. La franja a 1440, al llarg del temps.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/?active=first_contact', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
for (let i = 0; i < 8; i++) {
  await p.waitForTimeout(1000);
  const r = await p.evaluate(() => {
    const e = document.querySelector('[data-stripe-visual-content="2"]');
    if (!e) return null;
    const bb = e.getBoundingClientRect();
    const img = e.querySelector('img');
    return {
      ample: +bb.width.toFixed(1),
      alcada: +bb.height.toFixed(1),
      transform: getComputedStyle(e).transform,
      imgNatural: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
      imgBox: img ? +img.getBoundingClientRect().width.toFixed(1) : null,
      escalaVar: getComputedStyle(document.documentElement).getPropertyValue('--megaStripeScale').trim(),
      carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
      carrusels: document.querySelectorAll('[data-carrusel="1"]').length,
      files: document.querySelectorAll('[data-carrusel="1"]').length ? document.querySelector('[data-carrusel="1"]').getBoundingClientRect().width.toFixed(1) : null,
    };
  });
  console.log(i + 1, JSON.stringify(r));
}
await b.close();
