// TEMPORAL — no es comiteja. Amb la sonda posada al codi: qui escriu el
// desplac,ament del carrusel i amb quin valor, abans i despres d'enrere.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.evaluate(() => { window.__hgCentratge = []; window.__hgDesplac = []; window.__hgVida = []; window.__hgActiu = []; });
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('--- obert ---');
console.log('centratge:', JSON.stringify(await p.evaluate(() => window.__hgCentratge)));
console.log('desplac  :', JSON.stringify(await p.evaluate(() => window.__hgDesplac.slice(-4))));

const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(2500);
console.log('--- clic fet, a la PDP ---');
console.log('centratge:', JSON.stringify(await p.evaluate(() => window.__hgCentratge)));
console.log('desplac  :', JSON.stringify(await p.evaluate(() => window.__hgDesplac.slice(-6))));

await p.goBack({ waitUntil: 'load' });
await p.waitForTimeout(2500);
console.log('--- enrere ---');
console.log('centratge:', JSON.stringify(await p.evaluate(() => window.__hgCentratge)));
console.log("desplac  :", JSON.stringify(await p.evaluate(() => window.__hgDesplac.slice(-8))));
console.log("vida     :", JSON.stringify(await p.evaluate(() => window.__hgVida)));
console.log("actiu    :", JSON.stringify(await p.evaluate(() => window.__hgActiu), null, 0));
await b.close();
