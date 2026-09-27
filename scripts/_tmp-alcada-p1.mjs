// TEMPORAL — no es comiteja. L'alcada del boto Color de la pagina 1, ben
// assentat, abans i despres de canviar de colleccio.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

const foto = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const boto = v1?.querySelector('button[aria-label="Color"]');
  const barra = boto?.closest('[data-stripe-buttonbar="bn"]');
  const s2 = v2?.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
  const filera = v2?.querySelector('[data-p2-cercador-row]');
  return {
    p1botoH: boto ? +boto.getBoundingClientRect().height.toFixed(2) : null,
    p1botoTop: boto ? +boto.getBoundingClientRect().top.toFixed(2) : null,
    p1barraTop: barra ? +barra.getBoundingClientRect().top.toFixed(2) : null,
    p1barraH: barra ? +barra.getBoundingClientRect().height.toFixed(2) : null,
    p2botoTop: s2 ? +s2.getBoundingClientRect().top.toFixed(2) : null,
    p2fileraTop: filera ? +filera.getBoundingClientRect().top.toFixed(2) : null,
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(6000);
console.log('assentat', JSON.stringify(await foto()));

for (const nom of ['CUBE', 'FIRST CONTACT', 'THE HUMAN INSIDE']) {
  const card = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => (e.textContent || '').trim().toUpperCase() === n), nom);
  if (!card.asElement()) { console.log(nom, 'no trobat'); continue; }
  await card.asElement().click();
  await p.waitForTimeout(3000);
  console.log(nom.padEnd(16), JSON.stringify(await foto()));
}
await b.close();
