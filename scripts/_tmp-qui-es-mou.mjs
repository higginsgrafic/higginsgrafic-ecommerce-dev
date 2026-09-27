// TEMPORAL — no es comiteja. Qui es mou en clicar una colleccio: el selector de
// la pagina 1 o el de la pagina 2?
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);

const foto = () => p.evaluate(() => {
  const top = (e) => (e ? +e.getBoundingClientRect().top.toFixed(2) : null);
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const s1 = v1?.querySelector('button[aria-label="Color"]');
  const s2 = v2?.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
  const filera = v2?.querySelector('[data-p2-cercador-row]');
  const p1wrap = s1?.parentElement;
  return {
    s1Top: top(s1),
    s1WrapTop: top(p1wrap),
    s1Transform: p1wrap ? getComputedStyle(p1wrap).transform : null,
    s2Top: top(s2),
    fileraTop: top(filera),
    franjaTop: top(v2?.querySelector('[data-stripe-visual-content="2"]')),
    // L'alçada de la previsualitzacio de la franja i el fit de la graella
    stripePreviewH: getComputedStyle(document.documentElement).getPropertyValue('--hgStripePreviewH').trim(),
    gridFit: getComputedStyle(document.documentElement).getPropertyValue('--hgGridFitScale').trim(),
    vacio: v2?.querySelector('[data-stripe-visual-content="2"]')?.getBoundingClientRect().height.toFixed(2),
  };
});

console.log('montat ', JSON.stringify(await foto(), null, 0));
await p.waitForTimeout(1200);
console.log('+1,2s  ', JSON.stringify(await foto(), null, 0));
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => /CUBE/i.test(e.textContent || '')));
await card.asElement().click();
await p.waitForTimeout(250);
console.log('250ms  ', JSON.stringify(await foto(), null, 0));
await p.waitForTimeout(3000);
console.log('despres', JSON.stringify(await foto(), null, 0));
await b.close();
