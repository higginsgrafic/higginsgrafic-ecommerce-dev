// TEMPORAL — no es comiteja. En una carrega neta (sense fer res): quin
// desplacament te la tira i quin dibuix ensenya cada casa?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return {
    cases: [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => (t.querySelector('img')?.currentSrc || '').split('/').pop()),
    claus: [...v2.querySelectorAll('[data-stripe-casa]')].slice(0, 3).map((t) => t.getAttribute('data-stripe-casa')),
    // El gestor de la franja: es mira quin desplaçament te ara (l'ultim que ha rebut un clic)
    hit: window.__hit0 || null,
  };
});
console.log('claus del DOM:', JSON.stringify(r.claus));
r.cases.forEach((c, i) => console.log(`casa ${String(i).padStart(2)} ${c}`));
await b.close();
