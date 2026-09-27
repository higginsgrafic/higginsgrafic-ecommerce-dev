// TEMPORAL — no es comiteja. La tira de la franja: que els dibuixos circulin d'un
// en un, amb l'atenuacio dels que no son de la colleccio activa.
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

const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const capa = v2.querySelector('[data-stripe-drawing-layer]');
  if (!capa) return null;
  const tiles = [...capa.querySelectorAll('[data-stripe-tile]')];
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const rb = franja.getBoundingClientRect();
  return {
    franja: [+rb.left.toFixed(2), +rb.top.toFixed(2), +rb.width.toFixed(2), +rb.height.toFixed(2)],
    tiles: tiles.map((t) => {
      const im = t.querySelector('img');
      return {
        i: t.getAttribute('data-stripe-tile'),
        src: (im?.currentSrc || im?.src || '').split('/').slice(-1)[0],
        op: getComputedStyle(t).opacity,
        box: (() => { const x = t.getBoundingClientRect(); return [+(x.left - rb.left).toFixed(2), +x.width.toFixed(2)]; })(),
      };
    }),
  };
});

const abans = await estat();
console.log('--- ABANS (first_contact actiu)');
console.log(abans.tiles.map((t) => `${t.i}:${t.src.replace(/-b-stripe\.webp|-stripe\.webp/, '')}@${t.op}`).join(' '));
console.log('franja', JSON.stringify(abans.franja));

// Una fletxa (la de baix a la dreta del carrusel = "Seguent")
const fletxa = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] button[aria-label="Següent"]')]
  .find((x) => x.getBoundingClientRect().width > 0) || null);
if (!fletxa.asElement()) console.log('fletxa "Seguent" no trobada');
else {
  const bb = await fletxa.asElement().boundingBox();
  console.log('fletxa box', JSON.stringify(bb));
  await fletxa.asElement().click({ timeout: 5000 }).catch((e) => console.log('clic NO', e.message.slice(0, 60)));
  await p.waitForTimeout(900);
  const desp = await estat();
  console.log('--- DESPRES d\'una fletxa');
  console.log(desp.tiles.map((t) => `${t.i}:${t.src.replace(/-b-stripe\.webp|-stripe\.webp/, '')}@${t.op}`).join(' '));
  console.log('franja', JSON.stringify(desp.franja));
  let moviment = 0;
  for (let i = 0; i < 14; i++) if (abans.tiles[i].src !== desp.tiles[i].src) moviment++;
  console.log('caselles que han canviat de dibuix:', moviment);
  console.log('geometria intacta:', JSON.stringify(abans.tiles[0].box) === JSON.stringify(desp.tiles[0].box),
    JSON.stringify(abans.franja) === JSON.stringify(desp.franja));
}

// La rodeta
await p.mouse.move(600, 280);
await p.mouse.wheel(0, 300);
await p.waitForTimeout(700);
const roda = await estat();
console.log('--- DESPRES de la rodeta');
console.log(roda.tiles.map((t) => `${t.i}:${t.src.replace(/-b-stripe\.webp|-stripe\.webp/, '')}`).join(' '));
console.log('errors de pagina:', errors.length, errors.slice(0, 3));
await b.close();
