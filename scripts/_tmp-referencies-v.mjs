// TEMPORAL — no es comiteja. Les referencies verticals de la pagina 2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306], [1680, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const row = v2.querySelector('[data-p2-cercador-row]');
    const cont = row.parentElement;
    const crop = v2.querySelector('[data-carrusel="1"] > div');
    const selCont = v2.querySelector('[data-p2-color-selector]');
    const selBtn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const cs = getComputedStyle(document.documentElement);
    const t = (el) => (el ? +el.getBoundingClientRect().top.toFixed(2) : null);
    const v = t(v2);
    const rel = (el) => (el ? +(t(el) - v).toFixed(2) : null);
    return {
      carril: Number.parseFloat(cs.getPropertyValue('--hg-mega-w')) || null,
      escala: Number.parseFloat(cs.getPropertyValue('--hg-escala-mega')) || null,
      barTopVar: cs.getPropertyValue('--hg-cercador-bar-top').trim(),
      contTop: rel(cont), contCssTop: cont ? getComputedStyle(cont).top : null,
      rowTop: rel(row), cropTop: rel(crop),
      selCont: rel(selCont), selBtn: rel(selBtn), selH: selBtn ? +selBtn.getBoundingClientRect().height.toFixed(2) : null,
      franjaTop: rel(franja),
    };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} carril ${String(r.carril).padStart(4)} escala ${r.escala && r.escala.toFixed(4)} barTop "${r.barTopVar}" | cont ${r.contTop} (css ${r.contCssTop}) row ${r.rowTop} crop ${r.cropTop} | selCont ${r.selCont} selBtn ${r.selBtn} h ${r.selH} | franja ${r.franjaTop}`);
  await ctx.close();
}
await b.close();
