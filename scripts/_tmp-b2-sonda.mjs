// TEMPORAL — no es comiteja. B2: sonda dels valors que entren a la graella nova.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('console', (m) => { if (m.type() === 'error' || /NaN|SONDA/.test(m.text())) console.log('CONSOLE', m.type(), m.text().slice(0, 200)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const carr = v1.querySelector('[data-carrusel="1"]');
  const retall = carr?.firstElementChild;
  const tira = retall?.firstElementChild;
  const boto = tira?.querySelector('button');
  const st = (el) => { if (!el) return null; const cs = getComputedStyle(el); const q = el.getBoundingClientRect(); return { w: cs.width, h: cs.height, pos: cs.position, left: cs.left, top: cs.top, mt: cs.marginTop, disp: cs.display, over: cs.overflow, rw: +q.width.toFixed(1), rh: +q.height.toFixed(1) }; };
  return {
    carrusel: st(carr),
    retall: st(retall),
    tira: st(tira),
    boto: st(boto),
    nBotons: tira ? tira.querySelectorAll('button').length : 0,
    innerCarrusel: carr ? carr.getAttribute('style') : null,
    innerTira: tira ? (tira.getAttribute('style') || '').slice(0, 160) : null,
    innerBoto: boto ? (boto.getAttribute('style') || '').slice(0, 200) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
