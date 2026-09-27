// TEMPORAL — no es comiteja. El fitxer del Terminator es trenca en pintar-se?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
p.on('pageerror', (e) => errs.push('P: ' + String(e).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'THE HUMAN INSIDE') || null);
const bb = await card.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const t = bs.find((x) => x.getAttribute('aria-label') === 'Terminator');
  if (!t) return { trobat: false };
  const img = t.querySelector('img');
  const cs = img ? getComputedStyle(img) : null;
  return {
    trobat: true,
    src: img ? (img.getAttribute('src') || '').slice(0, 90) : null,
    currentSrc: img ? (img.currentSrc || '').slice(0, 90) : null,
    natural: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
    complete: img ? img.complete : null,
    display: cs ? cs.display : null,
    opacity: cs ? cs.opacity : null,
    caixa: img ? (() => { const k = img.getBoundingClientRect(); return `${Math.round(k.width)}x${Math.round(k.height)}`; })() : null,
  };
});
console.log(JSON.stringify(r, null, 1));
// I el fitxer directe, per veure si el navegador el pot descodificar.
const decodable = await p.evaluate(async () => {
  const provatures = [
    '/custom_logos/drawings/images_stripe/the_human_inside/black/terminator-b-stripe.webp',
    '/custom_logos/drawings/images_stripe/the_human_inside/black/robocop-b-stripe.webp',
  ];
  const out = {};
  for (const u of provatures) {
    out[u.split('/').pop()] = await new Promise((res) => {
      const i = new Image();
      i.onload = () => res(`${i.naturalWidth}x${i.naturalHeight}`);
      i.onerror = () => res('ERROR');
      i.src = u;
    });
  }
  return out;
});
console.log('descodificacio:', JSON.stringify(decodable));
console.log('errors de consola:', errs.length, errs.slice(0, 4));
await b.close();
