// TEMPORAL: el calibratge del tile s'executa a la vertical?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
const mesura = (etq) => p.evaluate((etq) => {
  const cont = document.querySelector('[data-megaslide-taula="1"] [data-stripe-visual-content="1"]');
  const cs = getComputedStyle(document.documentElement);
  return {
    etq,
    alcadaFranja: cont ? getComputedStyle(cont).height : '(no hi es)',
    gridFitScale: cs.getPropertyValue('--hgGridFitScale') || '(buida)',
    megaW: cs.getPropertyValue('--hg-mega-w') || '(buida)',
  };
}, etq);

await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
console.log(JSON.stringify(await mesura('obert 1a vegada')));

// Tancar i tornar a obrir.
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
console.log(JSON.stringify(await mesura('despres de tancar i obrir')));

// I amb una mica de scroll/moviment?
await p.mouse.move(400, 300);
await p.mouse.wheel(0, 40);
await p.waitForTimeout(2000);
console.log(JSON.stringify(await mesura("despres dun moviment")));
await ctx.close(); await b.close();
