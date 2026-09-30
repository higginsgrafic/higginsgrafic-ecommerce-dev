import { chromium } from '@playwright/test';
const VISTES = [[1920, 946], [1440, 900], [1366, 768], [1024, 768]];
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
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const fr = v2.querySelector('[data-stripe-visual-content="2"]');
      const tiles = [...fr.querySelectorAll('[data-stripe-tile]')].map((t) => t.getBoundingClientRect());
      const imgs = [...fr.querySelectorAll('img')].map((t) => t.getBoundingClientRect());
      const filera = v2.querySelector('[data-p2-cercador-row]').getBoundingClientRect();
      const colors = v2.querySelector('[data-p2-color-grid]').getBoundingClientRect();
      const min = (l, k) => l.length ? Math.min(...l.map((x) => x[k])) : null;
      const max = (l, k) => l.length ? Math.max(...l.map((x) => x[k])) : null;
      return {
        franjaBox: [+fr.getBoundingClientRect().top.toFixed(1), +fr.getBoundingClientRect().bottom.toFixed(1)],
        tilesT: min(tiles, 'top'), tilesB: max(tiles, 'bottom'), nTiles: tiles.length,
        imgsT: min(imgs, 'top'), imgsB: max(imgs, 'bottom'), nImgs: imgs.length,
        fileraB: +filera.bottom.toFixed(1), colorsB: +colors.bottom.toFixed(1),
      };
    });
    console.log(`${w}x${h} franja ${JSON.stringify(r.franjaBox)} tiles(${r.nTiles}) ${r.tilesT}..${r.tilesB} imgs(${r.nImgs}) ${r.imgsT}..${r.imgsB} | fileraB ${r.fileraB} colorsB ${r.colorsB} -> buit ${(r.tilesT - r.fileraB).toFixed(1)} / ${(r.tilesT - r.colorsB).toFixed(1)}`);
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0]}`); } finally { await ctx.close(); }
}
await b.close();
