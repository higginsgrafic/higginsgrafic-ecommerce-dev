// TEMPORAL — no es comiteja. Quin es el bloc del boto Color de la pagina 1, i
// quants elements hi ha amb data-stripe-buttonbar="bn".
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(6000);

const radiografia = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const barres = [...v1.querySelectorAll('[data-stripe-buttonbar="bn"]')];
  return {
    nBarres: barres.length,
    barres: barres.map((ba) => {
      const rb = ba.getBoundingClientRect();
      const bots = [...ba.querySelectorAll('button')].map((x) => ({ l: x.getAttribute('aria-label'), t: +x.getBoundingClientRect().top.toFixed(1), h: +x.getBoundingClientRect().height.toFixed(1), st: x.getAttribute('style').slice(0, 40) }));
      return { box: [+rb.left.toFixed(1), +rb.top.toFixed(1), +rb.width.toFixed(1), +rb.height.toFixed(1)], cls: ba.className, pareCls: ba.parentElement.className.slice(0, 40), bots };
    }),
  };
});
console.log('ABANS ', JSON.stringify(await radiografia()));
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => /CUBE/i.test(e.textContent || '')));
await card.asElement().click();
await p.waitForTimeout(3000);
console.log('CUBE  ', JSON.stringify(await radiografia()));
await b.close();
