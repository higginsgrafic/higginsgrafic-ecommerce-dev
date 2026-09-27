// TEMPORAL — no es comiteja. Cadena d'ancestres de la franja amb translateY acumulat.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const GAP_X_PX = 12;
for (const [w, h] of [[1920, 946], [1512, 900], [1440, 800], [1366, 768], [1280, 720], [1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(({ GAP_X_PX }) => {
    const root = document.documentElement;
    const num = (n, d) => {
      const v = parseFloat(getComputedStyle(root).getPropertyValue(n));
      return Number.isFinite(v) ? v : d;
    };
    const carril = num('--hg-mega-w', 1350);
    const escala = num('--hg-escala-mega', 1);
    const panel = document.querySelector('[data-mega-panel-surface="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const pr = panel.getBoundingClientRect();
    // Suma de translateY de tots els ancestres (inclos l'element) fins al panell.
    const chain = [];
    let el = franja;
    while (el && el !== panel) {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      chain.push({ el, ty: m.f });
      el = el.parentElement;
    }
    const rows = [];
    let acc = 0;
    for (const it of chain) {
      acc += it.ty;
      const rr = it.el.getBoundingClientRect();
      rows.push(`  rectRelPanel ${(rr.top - pr.top).toFixed(2).padStart(8)} h ${rr.height.toFixed(2).padStart(8)} ty ${it.ty.toFixed(2).padStart(8)} acc ${acc.toFixed(2).padStart(8)} flow ${(rr.top - pr.top - acc).toFixed(2).padStart(8)} | ${(it.el.className || '').toString().slice(0, 40)}`);
    }
    const franjaFlow = rows.length ? rows[0] : '';
    const reserva = (carril - 8 * GAP_X_PX * escala) / 9 + 13.96;
    return { rows: rows.join('\n'), franjaFlow, reserva: +reserva.toFixed(2), carril: +carril.toFixed(2), escala: +escala.toFixed(5) };
  }, { GAP_X_PX });
  // franja flow
  const m = r.rows.split('\n')[0].match(/flow\s+(-?[\d.]+)/);
  console.log(`\n=== ${w}x${h} carril ${r.carril} esc ${r.escala} reserva ${r.reserva} franjaFlow ${m ? m[1] : '?'} +32+32 = ${r.reserva + 64}`);
  console.log(r.rows);
  await ctx.close();
}
await b.close();
