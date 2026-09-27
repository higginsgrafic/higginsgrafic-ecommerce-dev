import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);
const v2 = await p.$('[data-mega-page-viewport="2"]');
const bn = await v2.$('[data-stripe-buttonbar="bn"]');
const bb = await bn.boundingBox();
console.log('pastilla', JSON.stringify(bb));
await bn.click({ timeout: 5000 }).then(() => console.log('pastilla: clic OK')).catch((e) => console.log('pastilla: NO', e.message.slice(0, 60)));
await p.waitForTimeout(800);
// La primera casella del carrusel
const peca = await p.evaluateHandle(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v.querySelector('[data-carrusel="1"] > div').firstElementChild;
  return [...tira.querySelectorAll('button')][0];
});
const pb = await peca.asElement().boundingBox();
console.log('primera peca', JSON.stringify(pb));
await peca.asElement().click({ timeout: 5000 }).then(() => console.log('peca: clic OK')).catch((e) => console.log('peca: NO', e.message.slice(0, 60)));
await b.close();
