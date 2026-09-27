// TEMPORAL — no es comiteja. Que passa entre el clic i el primer fotograma amb pagina 2?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.evaluate(() => {
  window.__m = [];
  const foto = () => {
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const track = panell ? panell.querySelector('div[style*="400%"]') || panell.querySelector('[data-mega-track]') : null;
    // la tira de pagines: el fill del panell amb width 400%
    let tr = null;
    if (panell) {
      const cand = [...panell.querySelectorAll('div')].find((d) => (d.style.width || '').includes('400%'));
      if (cand) tr = getComputedStyle(cand).transform;
    }
    const bar = v2 ? v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]') : null;
    const col = v2 ? v2.querySelector('[data-p2-color-selector]') : null;
    window.__m.push({
      t: Math.round(performance.now()),
      panell: panell ? +panell.getBoundingClientRect().top.toFixed(1) : null,
      op: panell ? getComputedStyle(panell).opacity : null,
      v2: v2 ? +v2.getBoundingClientRect().top.toFixed(1) : null,
      v2x: v2 ? +v2.getBoundingClientRect().left.toFixed(1) : null,
      sel: bar ? +bar.getBoundingClientRect().top.toFixed(1) : null,
      selx: bar ? +bar.getBoundingClientRect().left.toFixed(1) : null,
      colx: col ? +col.getBoundingClientRect().left.toFixed(1) : null,
      tr,
    });
    if (window.__m.length < 400) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(2000);
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  const clau = `${x.panell}|${x.op}|${x.v2}|${x.v2x}|${x.sel}|${x.selx}|${x.colx}|${x.tr}`;
  if (clau !== previ) console.log(`t=${String(x.t).padStart(5)} panell=${x.panell} op=${x.op} v2=${x.v2} v2x=${x.v2x} sel=${x.sel} selx=${x.selx} colx=${x.colx} track=${x.tr}`);
  previ = clau;
}
await b.close();
