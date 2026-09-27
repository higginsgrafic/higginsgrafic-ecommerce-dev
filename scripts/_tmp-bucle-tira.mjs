// TEMPORAL — no es comiteja. El bucle de la tira: 64 passos i torna a l'inici; i
// el clic a una samarreta, que ha d'obrir la PDP del dibuix que s'hi veu.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);

const primer = () => p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="0"] img');
  return (t?.currentSrc || '').split('/').pop();
});

const inici = await primer();
console.log('casella 0 a l\'inici:', inici);

const seguent = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] button[aria-label="Següent"]')].find((x) => x.getBoundingClientRect().width > 0));
const anterior = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] button[aria-label="Anterior"]')].find((x) => x.getBoundingClientRect().width > 0));

// 63 passos endavant: la casella 0 ha de tornar al dibuix 63 de la llista.
for (let i = 0; i < 63; i++) {
  await seguent.asElement().dispatchEvent('click');
  await p.waitForTimeout(30);
}
await p.waitForTimeout(400);
const g63 = await primer();
console.log('casella 0 despres de 63 passos:', g63);

// Un pas mes: torna a l'inici (volta complerta).
await seguent.asElement().dispatchEvent('click');
await p.waitForTimeout(500);
const g64 = await primer();
console.log('casella 0 despres de 64 passos:', g64, '· volta tancada:', g64 === inici);

// Un pas enrere des de l'inici.
await anterior.asElement().dispatchEvent('click');
await p.waitForTimeout(500);
console.log('casella 0 un pas enrere:', await primer());

// El clic a una samarreta: la casella 3 i la PDP que ha d'obrir
const esperat = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="3"] img');
  return (t?.currentSrc || '').split('/').pop();
});
console.log('casella 3 ensenya:', esperat);
const capa = await p.$('[data-stripe-drawing-layer]');
const bb = await capa.boundingBox();
// La casella 3 va de 216 a 288 px en el contenidor de 1049
await p.mouse.click(bb.x + 250, bb.y + bb.height / 2);
await p.waitForTimeout(2500);
console.log('URL:', p.url());
console.log('errors de pagina:', errors.length, errors.slice(0, 3));
await b.close();
