// TEMPORAL — no es comiteja. Quin es el `stripeItem` de cada dibuix de THE HUMAN
// INSIDE al registre de la graella, i en quin ordre hi son?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'THE HUMAN INSIDE') || null);
const bb = await card.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(2500);
// Els `aria-label` del carrusel son els labels del registre; la tira pinta
// `stripeItem`. Es llegeix l'ordre del registre des de la tira sencera.
const r = await p.evaluate(async () => {
  const mod = await import('/src/components/fullwide/CercadorTextRow.jsx');
  const tots = mod.dibuixosGraella16x4();
  const humans = tots.filter((x) => x.collection === 'the_human_inside');
  return { humans: humans.map((x) => `${x.label} -> ${x.stripeItem}`), total: tots.length };
});
console.log('dibuixos del registre amb the_human_inside:', r.humans.length);
console.log(r.humans.join('\n'));
console.log('total de la graella:', r.total);
await b.close();
