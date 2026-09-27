// TEMPORAL — no es comiteja. Que es "recarrega" en clicar una colleccio: es
// marca el DOM i es mira si el panell es remunta, si el node del carrusel es el
// mateix, i si l'stripOffset torna a zero.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);

await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  v2.setAttribute('data-marca-persistencia', 'si');
  window.__mut = [];
  const obj = new MutationObserver((ms) => {
    for (const m of ms) window.__mut.push({ t: Math.round(performance.now()), tipus: m.type, node: (m.target?.tagName || '?') + '.' + String(m.target?.className || '').slice(0, 24) });
  });
  obj.observe(v2, { childList: true, subtree: true });
  window.__obj = obj;
});

for (const nom of ['CUBE', 'MISCEL·LÀNIA']) {
  const card = await p.evaluateHandle((n) => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === n) || null, nom);
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
    return {
      marca: v2.getAttribute('data-marca-persistencia'),
      mutacions: window.__mut.length,
      ultima: window.__mut[window.__mut.length - 1] || null,
      franja: tiles.map((t) => `${t.getAttribute('data-stripe-tile')}:${getComputedStyle(t).opacity}`).join(' '),
    };
  });
  console.log(nom, 'marca=', r.marca, 'mutacions=', r.mutacions, 'ultima=', JSON.stringify(r.ultima));
  console.log('   franja:', r.franja);
  await p.evaluate(() => { window.__mut = []; });
}
await b.close();
