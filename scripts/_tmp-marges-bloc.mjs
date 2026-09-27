// TEMPORAL — no es comiteja. Quins marges te el bloc i el seu pare?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let el = img?.i;
  const cami = [];
  while (el && el !== document.body && cami.length < 7) {
    const s = getComputedStyle(el);
    const b2 = el.getBoundingClientRect();
    cami.push({
      tag: el.tagName.toLowerCase(),
      tipo: el.getAttribute('data-band') || el.getAttribute('type') || '',
      cls: String(el.className).slice(0, 28),
      esq: Math.round(b2.left), ample: Math.round(b2.width), dalt: Math.round(b2.top), baix: Math.round(b2.bottom),
      margin: `${s.marginTop} ${s.marginRight} ${s.marginBottom} ${s.marginLeft}`,
      pad: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
      pos: s.position,
      display: s.display,
    });
    el = el.parentElement;
  }
  return cami;
});
for (const x of r) console.log(`${x.tag.padEnd(6)} tipo=${String(x.tipo).padEnd(10)} esq=${String(x.esq).padStart(5)} ample=${String(x.ample).padStart(5)} dalt=${String(x.dalt).padStart(5)} baix=${String(x.baix).padStart(5)} margin=${x.margin.padEnd(28)} pad=${x.pad.padEnd(28)} ${x.pos}`);
await b.close();
