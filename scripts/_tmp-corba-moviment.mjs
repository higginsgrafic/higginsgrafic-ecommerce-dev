// TEMPORAL — no es comiteja. La corba del moviment: quan i quant es mou el
// selector de la pagina 1 en clicar una colleccio.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);

await p.evaluate(() => {
  window.__mostres = [];
  const top = (sel) => { const e = document.querySelector(sel); return e ? +e.getBoundingClientRect().top.toFixed(2) : null; };
  window.__t0 = performance.now();
  window.__mostra = () => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    window.__mostres.push({
      t: +(performance.now() - window.__t0).toFixed(0),
      s1: (() => { const e = v1?.querySelector('button[aria-label="Color"]'); return e ? +e.getBoundingClientRect().top.toFixed(2) : null; })(),
      s1offsetTop: (() => { const e = v1?.querySelector('button[aria-label="Color"]'); return e ? e.offsetTop : null; })(),
      filera: (() => { const e = v2?.querySelector('[data-p2-cercador-row]'); return e ? +e.getBoundingClientRect().top.toFixed(2) : null; })(),
      franja: top('[data-stripe-visual-content="2"]'),
      grid: (() => { const e = document.querySelector('[data-carrusel="1"]'); return e ? +e.getBoundingClientRect().height.toFixed(2) : null; })(),
    });
  };
  const id = setInterval(window.__mostra, 50);
  setTimeout(() => clearInterval(id), 4000);
  window.__mostra();
});

const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => /CUBE/i.test(e.textContent || '')));
await card.asElement().click();
await p.waitForTimeout(4200);

const mostres = await p.evaluate(() => window.__mostres);
let previ = null;
for (const m of mostres) {
  if (!previ || m.s1 !== previ.s1 || m.filera !== previ.filera || m.grid !== previ.grid) console.log(JSON.stringify(m));
  previ = m;
}
await b.close();
