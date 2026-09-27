// TEMPORAL — no es comiteja. selectorCentratgeY = 20 + (fileraH - selectorH)/2 ?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306], [1680, 900], [2000, 1000], [1400, 900]]) {
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
    const selBtn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const carrusel = v2.querySelector('[data-carrusel="1"]');
    const t = (el) => (el ? el.getBoundingClientRect() : null);
    const scy = t(selBtn).top - t(cont).top - 20;
    return {
      scyDom: +scy.toFixed(3),
      fileraH: +t(row).height.toFixed(3),
      selH: +t(selBtn).height.toFixed(3),
      alcadaCarrusel: +t(carrusel).height.toFixed(3),
      scyFormula: +(20 + (t(row).height - t(selBtn).height) / 2).toFixed(3),
    };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} scy DOM ${String(r.scyDom).padStart(8)} | formula ${String(r.scyFormula).padStart(8)} | fileraH ${r.fileraH} selH ${r.selH} carruselH ${r.alcadaCarrusel} | dif ${(r.scyDom - r.scyFormula).toFixed(3)}`);
  await ctx.close();
}
await b.close();
