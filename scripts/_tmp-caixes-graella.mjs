// TEMPORAL — no es comiteja. Qui retalla la graella? S'enfila pels pares del
// primer dibuix i es mesura cada caixa.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const boto = [...v2.querySelectorAll('[data-carrusel="1"] button')][0];
  const out = [];
  let e = boto;
  for (let i = 0; i < 9 && e; i++) {
    const bb = e.getBoundingClientRect();
    const s = getComputedStyle(e);
    out.push({
      i,
      tag: e.tagName.toLowerCase(),
      data: e.getAttribute('data-carrusel') || e.getAttribute('data-mega-page-viewport') || '',
      y: +bb.top.toFixed(2),
      h: +bb.height.toFixed(2),
      overflow: s.overflow,
      pos: s.position,
      top: s.top,
      transform: s.transform === 'none' ? '-' : s.transform.slice(0, 40),
      alignContent: s.alignContent,
      placeContent: s.placeContent,
    });
    e = e.parentElement;
    if (e === document.body) break;
  }
  return out;
});
for (const x of r) console.log(`${String(x.i).padStart(2)} ${x.tag.padEnd(5)} ${x.data.padEnd(22)} y=${String(x.y).padStart(8)} h=${String(x.h).padStart(7)} overflow=${x.overflow.padEnd(9)} pos=${x.pos.padEnd(9)} top=${x.top.padEnd(9)} align-content=${x.alignContent}`);
await b.close();
