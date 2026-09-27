// TEMPORAL — no es comiteja. Obertura des de zero a diverses finestres: el
// primer fotograma pintat ja te la mida bona? (abans: 72 i despres 95)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1680, 900], [1440, 800], [1366, 768], [1280, 720], [2560, 1306]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.evaluate(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      if (v2) {
        const cont = v2.querySelector('[data-carrusel="1"] > div');
        const btn = cont?.querySelector('button');
        window.__m.push({
          t: Math.round(performance.now()),
          retall: cont ? +cont.getBoundingClientRect().height.toFixed(2) : null,
          cella: btn ? btn.style.width : null,
          contTop: cont ? +cont.getBoundingClientRect().top.toFixed(2) : null,
        });
      }
      if (window.__m.length < 300) requestAnimationFrame(foto);
    };
    requestAnimationFrame(foto);
  });
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(5000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.retall != null);
  const primer = m[0] || {};
  const ultim = m[m.length - 1] || {};
  const distints = new Set(m.map((x) => `${x.retall}|${x.cella}`)).size;
  console.log(`${String(w).padStart(4)}x${String(h).padEnd(4)}  primer ${String(primer.retall).padStart(6)} / ${primer.cella}   final ${String(ultim.retall).padStart(6)} / ${ultim.cella}   contTop ${primer.contTop} -> ${ultim.contTop}   mides diferents: ${distints}`);
  await p.close();
}
await b.close();
