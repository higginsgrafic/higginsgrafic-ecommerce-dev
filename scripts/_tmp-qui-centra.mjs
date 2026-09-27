// TEMPORAL — no es comiteja. Qui fixa l'amplada del carril i qui el centra?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const carrilCss = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
  const fills = [...document.querySelectorAll('div')].filter((d) => Math.abs(d.getBoundingClientRect().width - carrilCss) < 1);
  const el = fills[0];
  const cami = [];
  let e = el;
  for (let i = 0; i < 5 && e; i++) {
    const s = getComputedStyle(e);
    const b2 = e.getBoundingClientRect();
    cami.push({ i, tag: e.tagName.toLowerCase(), cls: String(e.className).slice(0, 24), esq: Math.round(b2.left), ample: Math.round(b2.width), margin: s.marginLeft + ' / ' + s.marginRight, width: s.width, maxWidth: s.maxWidth, pad: s.paddingLeft + '/' + s.paddingRight, display: s.display });
    e = e.parentElement;
  }
  return { carrilCss, propietat: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'), cami };
});
console.log('--hg-mega-w =', r.propietat);
for (const x of r.cami) console.log(`  ${x.i} ${x.tag.padEnd(6)} esq=${String(x.esq).padStart(5)} ample=${String(x.ample).padStart(5)} width=${x.width.padEnd(10)} margin=${x.margin.padEnd(18)} pad=${x.pad.padEnd(11)} ${x.display}`);
await b.close();
