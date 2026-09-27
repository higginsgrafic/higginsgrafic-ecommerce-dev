// TEMPORAL — no es comiteja. La cadena d'amplades de la filera de la pagina 2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [2560, 1306]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const row = v2.querySelector('[data-p2-cercador-row]');
    const carrusel = v2.querySelector('[data-carrusel="1"]');
    const crop = carrusel && carrusel.firstElementChild;
    const an = (el) => (el ? +el.getBoundingClientRect().width.toFixed(3) : null);
    const al = (el) => (el ? +el.getBoundingClientRect().left.toFixed(3) : null);
    const fills = row ? [...row.children].map((c, i) => ({ i, w: an(c), l: al(c), t: (c.textContent || '').trim().slice(0, 14) })) : null;
    return {
      carril: Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')) || null,
      row: { w: an(row), l: al(row) },
      fills,
      carrusel: { w: an(carrusel), l: al(carrusel) },
      crop: { w: an(crop), l: al(crop) },
      fletxes: carrusel && carrusel.children[1] ? an(carrusel.children[1]) : null,
    };
  });
  console.log(`\n=== ${w}x${h} carril ${r.carril} ===`);
  console.log('  row', JSON.stringify(r.row), 'carrusel', JSON.stringify(r.carrusel), 'crop', JSON.stringify(r.crop), 'fletxes', r.fletxes);
  console.log('  fills:', r.fills.map((f) => `${f.i}:w${f.w}@${f.l}${f.t ? '"' + f.t + '"' : ''}`).join(' | '));
  await ctx.close();
}
await b.close();
