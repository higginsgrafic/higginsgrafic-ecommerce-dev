// TEMPORAL — que troba `ampladaObjectiu` com a bloc de la dreta.
import { chromium } from '@playwright/test';
const VISTES = [[1366, 768], [1280, 720], [1024, 768], [1920, 946]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const sel = '[data-bloc-dreta-p1="1"], [data-bloc-dreta-p2="1"], [data-colleccions-targeta="1"]';
      const cs = getComputedStyle(document.documentElement);
      const carrilX = Number.parseFloat(cs.getPropertyValue('--hg-mega-x'));
      const carrilW = Number.parseFloat(cs.getPropertyValue('--hg-mega-w'));
      const ampleVista = window.innerWidth;
      const out = [...document.querySelectorAll(sel)].map((el) => {
        const r = el.getBoundingClientRect();
        const pag = el.closest('[data-mega-page-viewport]');
        const px = pag ? pag.getBoundingClientRect().left : null;
        const visible = !pag ? true : (px > -1 && px < ampleVista);
        return {
          qui: el.getAttribute('data-bloc-dreta-p1') ? 'bloc-p1' : el.getAttribute('data-bloc-dreta-p2') ? 'bloc-p2' : 'targeta',
          l: +r.left.toFixed(1), w: +r.width.toFixed(1),
          pag: pag ? pag.getAttribute('data-mega-page-viewport') : null, px: px == null ? null : +px.toFixed(1),
          visible,
          objectiu: +(r.left - (px || 0) - carrilX).toFixed(1),
        };
      });
      return { carrilX: +carrilX.toFixed(1), carrilW: +carrilW.toFixed(1), ampleVista, out };
    });
    console.log(`${w}x${h} carril ${r.carrilX} (${r.carrilW})  ampleVista ${r.ampleVista}`);
    for (const o of r.out) console.log(`    ${o.qui.padEnd(8)} l=${o.l} w=${o.w} pag=${o.pag} px=${o.px} visible=${o.visible} objectiu=${o.objectiu}`);
    if (!r.out.length) console.log('    (cap element)');
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0]}`); } finally { await ctx.close(); }
}
await b.close();
