// TEMPORAL — no es comita. Tots els candidats de franja i carrusel de la pagina 2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 900], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w <= 1366 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/?active=first_contact', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const box = (e) => { const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.top.toFixed(1), +b.right.toFixed(1), +b.bottom.toFixed(1)]; };
    const cami = (n, atura) => { const c = []; let x = n; for (let i = 0; i < 12 && x && x !== atura; i++) { c.push(x.tagName.toLowerCase() + (x.dataset && Object.keys(x.dataset).length ? '[' + Object.keys(x.dataset).join(',') + ']' : '')); x = x.parentElement; } return c.join(' < '); };
    const out = { franjes: [], carrusels: [] };
    document.querySelectorAll('[data-stripe-visual-content="2"]').forEach((e) => {
      const fila = e.closest('[data-p2-cercador-row]');
      const vp = e.closest('[data-mega-page-viewport]');
      out.franjes.push({
        box: box(e), ample: +e.getBoundingClientRect().width.toFixed(1),
        vp: vp ? vp.getAttribute('data-mega-page-viewport') : null,
        dinsFilera: !!fila, filera: fila ? box(fila) : null,
        pare: e.parentElement ? e.parentElement.tagName.toLowerCase() + '.' + String(e.parentElement.className).split(' ')[0] : null,
        cami: cami(e, document.body),
      });
    });
    document.querySelectorAll('[data-carrusel="1"]').forEach((e) => {
      const vp = e.closest('[data-mega-page-viewport]');
      out.carrusels.push({ box: box(e), ample: +e.getBoundingClientRect().width.toFixed(1), vp: vp ? vp.getAttribute('data-mega-page-viewport') : null, dinsFilera: !!e.closest('[data-p2-cercador-row]') });
    });
    return out;
  });
  console.log(`--- ${w}x${h}`);
  for (const f of r.franjes) console.log('  FRANJA', JSON.stringify(f));
  for (const c of r.carrusels) console.log('  CARR  ', JSON.stringify(c));
  await ctx.close();
}
await b.close();
