// TEMPORAL — no es comiteja. El factor manual canvia la mida de la franja?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
const mesura = () => p.evaluate(() => {
  const f = document.querySelector('[data-stripe-visual-content="2"]');
  const estil = getComputedStyle(document.documentElement);
  return {
    escala: estil.getPropertyValue('--megaStripeScale').trim(),
    amplada: f ? +f.getBoundingClientRect().width.toFixed(2) : null,
    alcada: f ? +f.getBoundingClientRect().height.toFixed(2) : null,
    transform: f ? getComputedStyle(f).transform : null,
  };
});
console.log('amb el valor desat:  ', JSON.stringify(await mesura()));
await p.evaluate(() => { document.documentElement.style.setProperty('--megaStripeScale', '1.2125'); });
await p.waitForTimeout(600);
console.log('amb el nominal:      ', JSON.stringify(await mesura()));
await p.evaluate(() => { document.documentElement.style.setProperty('--megaStripeScale', '0.9'); });
await p.waitForTimeout(600);
console.log('amb 0.9:             ', JSON.stringify(await mesura()));
await b.close();
