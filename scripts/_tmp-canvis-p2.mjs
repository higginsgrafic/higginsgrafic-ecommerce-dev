// TEMPORAL — no es comiteja. El selector es mou en canviar de colleccio o en
// redimensionar? I la composicio neix estable a tauleta?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const mesura = (p) => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const v = v2.getBoundingClientRect().top;
  const sel = v2.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const btn = cont?.querySelector('button');
  return {
    selector: sel ? +(sel.getBoundingClientRect().top - v).toFixed(2) : null,
    retall: cont ? +cont.getBoundingClientRect().height.toFixed(2) : null,
    cella: btn ? btn.style.width : null,
    strip: (() => { const s = v2.querySelector('[data-carrusel="1"] > div > div'); return s ? +getComputedStyle(s).transform.replace(/[^0-9.,-]/g, ' ').trim().split(/\s+/).pop() : null; })(),
  };
});
// 1) canvi de colleccio i resize a 1920
{
  const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(4000);
  const a = await mesura(p);
  await p.evaluate(() => { const l = [...document.querySelectorAll('[data-mega-page-viewport="2"] button')].find((x) => /cube/i.test(x.textContent || '')); l?.click(); });
  await p.waitForTimeout(1500);
  const c = await mesura(p);
  await p.setViewportSize({ width: 1700, height: 900 });
  await p.waitForTimeout(1500);
  const r = await mesura(p);
  await p.waitForTimeout(600);
  const r2 = await mesura(p);
  console.log(`1920 obert:      selector=${a.selector} retall=${a.retall} cella=${a.cella}`);
  console.log(`canvi colleccio: selector=${c.selector} retall=${c.retall} cella=${c.cella}`);
  console.log(`resize 1700:     selector=${r.selector} retall=${r.retall} cella=${r.cella}`);
  console.log(`+600 ms:         selector=${r2.selector} retall=${r2.retall} cella=${r2.cella}`);
  await p.close();
}
// 2) tauleta: el primer fotograma pintat ja es el bo?
for (const [w, h] of [[1024, 768], [768, 1024]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.evaluate(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      if (v2) {
        const v = v2.getBoundingClientRect().top;
        const sel = v2.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
        window.__m.push({ s: sel ? +(sel.getBoundingClientRect().top - v).toFixed(2) : null, o: getComputedStyle(document.querySelector('[data-mega-panel-surface="1"]') || document.body).opacity });
      }
      if (window.__m.length < 250) requestAnimationFrame(foto);
    };
    requestAnimationFrame(foto);
  });
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(4500);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.s != null);
  console.log(`${w}x${h}  composicions distintes: ${new Set(m.map((x) => x.s)).size}  primer=${m[0]?.s} final=${m[m.length - 1]?.s}`);
  await p.close();
}
await b.close();
