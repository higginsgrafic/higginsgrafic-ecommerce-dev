// TEMPORAL — no es comiteja. La cadena vertical de la pagina 2: sostre - dalt.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const CASES = [[1920, 946], [1920, 800], [1920, 1300], [1440, 800], [1440, 1000], [2560, 1306], [1512, 900], [1680, 900]];
for (const [w, h] of CASES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const crop = v2.querySelector('[data-carrusel="1"] > div');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const row = v2.querySelector('[data-p2-cercador-row]');
    const sel = v2.querySelector('[data-p2-color-selector]');
    const cs = getComputedStyle(document.documentElement);
    const t = (el) => (el ? +el.getBoundingClientRect().top.toFixed(2) : null);
    const v2t = t(v2);
    const rel = (el) => (el ? +(t(el) - v2t).toFixed(2) : null);
    return {
      carril: Number.parseFloat(cs.getPropertyValue('--hg-mega-w')) || null,
      escala: Number.parseFloat(cs.getPropertyValue('--hg-escala-mega')) || null,
      barTop: cs.getPropertyValue('--hg-cercador-bar-top').trim(),
      v2t,
      row: rel(row), crop: rel(crop), franja: rel(franja), sel: rel(sel),
      cropH: crop ? +crop.getBoundingClientRect().height.toFixed(2) : null,
      franjaH: franja ? +franja.getBoundingClientRect().height.toFixed(2) : null,
      sostreDalt: (rel(franja) != null && rel(crop) != null) ? +(rel(franja) - rel(crop)).toFixed(2) : null,
      cropFranja: (rel(franja) != null && rel(crop) != null) ? +(rel(franja) - rel(crop)).toFixed(2) : null,
    };
  });
  console.log(`${String(w + 'x' + h).padEnd(10)} carril ${String(r.carril).padStart(4)} escala ${r.escala && r.escala.toFixed(4)} barTop ${r.barTop} | v2 ${r.v2t} row ${r.row} crop ${r.crop} franja ${r.franja} sel ${r.sel} | cropH ${r.cropH} franjaH ${r.franjaH} | sostre-dalt ${r.sostreDalt}`);
  await ctx.close();
}
await b.close();
