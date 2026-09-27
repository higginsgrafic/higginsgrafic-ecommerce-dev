// TEMPORAL — no es comiteja. Opacitats de la graella de dibuixos (p2) amb cada colleccio activa.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const act of (process.argv[2] || 'miscellania').split(',')) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(1500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const graella = v2.querySelector('[data-carrusel="1"]');
    const tiles = [...graella.querySelectorAll('button')];
    return tiles.map((el, i) => {
      const rr = el.getBoundingClientRect();
      const img = el.querySelector('img');
      const cs = img ? getComputedStyle(img) : null;
      const par = img && img.parentElement ? getComputedStyle(img.parentElement) : null;
      return {
        i,
        x: Math.round(rr.left),
        y: Math.round(rr.top),
        op: cs ? cs.opacity : null,
        pop: par ? par.opacity : null,
        src: (img ? img.getAttribute('src') : '') ? String(img.getAttribute('src')).split('/').slice(-1)[0].slice(0, 26) : '',
        title: (el.getAttribute('title') || el.getAttribute('aria-label') || '').slice(0, 24),
      };
    });
  });
  console.log(`\n=== active=${act} tiles=${r.length}`);
  const visibles = r.filter((t) => t.x > -20 && t.x < 1920).sort((a, b2) => (a.y - b2.y) || (a.x - b2.x));
  console.log(`   visibles: ${visibles.length}`);
  for (const t of visibles.slice(0, 40)) console.log(`   f${t.y} x${t.x} i${t.i} op=${t.op}/${t.pop} ${t.src}`);
  await ctx.close();
}
await b.close();
