// TEMPORAL — no es comiteja. Des de zero: es mesura DES DEL CLIC fins 2 s
// despres, el contingut i la caixa de la pagina 2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.evaluate(() => {
  window.__m = [];
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (!v2) return { t: Math.round(performance.now()), no: true };
    const imgs = [...v2.querySelectorAll('img')];
    const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
    const cont = v2.querySelector('[data-carrusel="1"] > div');
    const rb = cont?.getBoundingClientRect();
    return {
      t: Math.round(performance.now()),
      llestes: imgs.filter((i) => i.complete && i.naturalWidth > 0).length + '/' + imgs.length,
      tiles: tiles.length,
      tilesAmb: tiles.filter((x) => x.querySelector('img')?.complete).length,
      retall: rb ? Math.round(rb.height) : null,
      panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    };
  };
  const id = setInterval(() => window.__m.push(foto()), 50);
  setTimeout(() => clearInterval(id), 6000);
});
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(6500);
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  const clau = `${x.no}|${x.panell}|${x.tiles}|${x.tilesAmb}|${x.retall}|${x.llestes}`;
  if (clau !== previ) console.log(`t=${String(x.t).padStart(5)}  panell=${x.panell ? 'si' : 'no '}  tiles=${String(x.tiles).padStart(2)} amb_img=${String(x.tilesAmb).padStart(2)}  retall=${x.retall}  imgs=${x.llestes}`);
  previ = clau;
}
await b.close();
