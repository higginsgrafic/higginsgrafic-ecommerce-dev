// TEMPORAL — no es comiteja. D'on surt la cella de 35,766 del primer fotograma?
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
    const cont = v2.querySelector('[data-carrusel="1"] > div');
    const btn = cont?.querySelector('button');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const vb = v2.getBoundingClientRect();
    const cb = cont?.getBoundingClientRect();
    const fb = franja?.getBoundingClientRect();
    // Ancestre amb transform?
    let tr = null;
    let n = btn;
    while (n && n !== document.body) {
      const t = getComputedStyle(n).transform;
      if (t && t !== 'none') { tr = `${n.tagName.toLowerCase()}${n.dataset?.megaPageViewport ? '[v]' : ''}:${t}`; break; }
      n = n.parentElement;
    }
    return {
      t: Math.round(performance.now()),
      retall: cb ? +cb.height.toFixed(2) : null,
      ample: cont ? cont.clientWidth : null,
      ampleClip: v2.querySelector('[data-carrusel="1"]')?.clientWidth ?? null,
      inline: btn ? btn.style.width : null,
      offset: btn ? btn.offsetWidth : null,
      bound: btn ? +btn.getBoundingClientRect().width.toFixed(3) : null,
      sostre: fb ? +fb.top.toFixed(2) : null,
      contTop: cb ? +cb.top.toFixed(2) : null,
      v2Top: +vb.top.toFixed(2),
      tr,
    };
  };
  const bucle = () => { window.__m.push(foto()); if (window.__m.length < 400) requestAnimationFrame(bucle); };
  requestAnimationFrame(bucle);
});
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(7000);
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  if (x.no) continue;
  const clau = `${x.inline}|${x.offset}|${x.ample}|${x.sostre}|${x.tr}`;
  if (clau !== previ) {
    console.log(`t=${String(x.t).padStart(5)} retall=${String(x.retall).padStart(7)} ample=${x.ample} ampleClip=${x.ampleClip} inline=${x.inline} offset=${x.offset} bound=${x.bound} sostre=${x.sostre} contTop=${x.contTop} v2Top=${x.v2Top} tr=${x.tr}`);
  }
  previ = clau;
}
await b.close();
