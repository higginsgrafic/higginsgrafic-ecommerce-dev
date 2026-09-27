import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const col = v2.querySelector('[data-colleccions-targeta]').parentElement;
  const b1 = col.children[0];
  const cs = getComputedStyle(col);
  const bs = getComputedStyle(b1);
  const q = (e) => { const r = e.getBoundingClientRect(); return { y: +r.top.toFixed(2), h: +r.height.toFixed(2), w: +r.width.toFixed(2) }; };
  return {
    col: { ...q(col), pad: cs.padding, border: cs.borderWidth, h: cs.height, box: cs.boxSizing, align: cs.alignItems, gap: cs.rowGap, contentH: col.clientHeight - 2 },
    boto: { ...q(b1), flex: bs.flex, flexBasis: bs.flexBasis, minH: bs.minHeight, maxH: bs.maxHeight, box: bs.boxSizing, pad: bs.padding, padT: bs.paddingTop, padB: bs.paddingBottom, padL: bs.paddingLeft, padR: bs.paddingRight, margin: bs.margin, lineH: bs.lineHeight, alignSelf: bs.alignSelf, h: bs.height, display: bs.display },
    span: (() => { const sp = b1.querySelector('span'); const ss = getComputedStyle(sp); return { fs: ss.fontSize, lh: ss.lineHeight, fw: ss.fontWeight, ff: ss.fontFamily.slice(0, 30) }; })(),
  };
}), null, 1));
await ctx.close();
await b.close();
