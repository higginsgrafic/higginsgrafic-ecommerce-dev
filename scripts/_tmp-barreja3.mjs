// 02/10/2026 — Verificacio de la barreja p1/p2 a 1024 i que la resta d'amplades
// no es moguin (la mesura de `dx` ara es relativa a la pagina).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
for (const [w, h] of [[1024, 691], [1366, 768], [1440, 900], [1920, 1080]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
  await p.waitForTimeout(6000);
  const m = async () => p.evaluate(() => {
    const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
    const p1 = document.querySelector('[data-mega-page-viewport="1"]');
    const p2 = document.querySelector('[data-mega-page-viewport="2"]');
    const bloc = p1?.querySelector('[data-bloc-dreta-p1]');
    const car1 = p1?.querySelector('[data-carrusel="1"]');
    const car2 = p2?.querySelector('[data-carrusel="1"]');
    const pag1 = q(p1);
    const local = (el) => { const r = el?.getBoundingClientRect(); const pr = p1?.getBoundingClientRect(); if (!r || !pr) return null; return [+(r.left - pr.left).toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1)]; };
    return { vp1: pag1, vp2: q(p2), bloc: q(bloc), blocLocal: local(bloc), car1: local(car1), car2: q(car2), stripe1: local(p1?.querySelector('[data-stripe-visual-content="1"]')), stripe2: q(p2?.querySelector('[data-stripe-visual-content="2"]')), bcn2: q(p2?.querySelector('[data-stripe-buttonbar="bn-p1"],[data-stripe-buttonbar="bn"]')) };
  });
  const abans = await m();
  await p.locator('[data-mega-page-viewport="2"] [data-colleccions-targeta="1"]').nth(1).click().catch(() => {});
  await p.waitForTimeout(3000);
  const despres = await m();
  const igual = (a, c) => JSON.stringify(a) === JSON.stringify(c);
  console.log(`--- ${w}x${h}`);
  console.log(' abans  ', JSON.stringify(abans));
  console.log(' despres', JSON.stringify(despres));
  console.log(' bloc/car1/car2/bcn2 iguals?', igual(abans.bloc, despres.bloc), igual(abans.car1, despres.car1), igual(abans.car2, despres.car2), igual(abans.bcn2, despres.bcn2));
  console.log(' errors', errs.slice(0, 3));
  await ctx.close();
}
await b.close();
