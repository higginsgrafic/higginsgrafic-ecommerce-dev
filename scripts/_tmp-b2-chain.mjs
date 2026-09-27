import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(12000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const fl = v1.querySelector('[data-fletxes-p1="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1="1"]');
  const d = (el, et) => { const q = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { et, y: +q.top.toFixed(1), h: +q.height.toFixed(1), offT: el.offsetTop, offH: el.offsetHeight, pos: cs.position, mt: cs.marginTop, flex: cs.flex, tr: cs.transform, disp: cs.display, aspect: cs.aspectRatio }; };
  return {
    bloc: d(bloc, 'bloc'),
    fillsBloc: [...bloc.children].map((c, i) => d(c, `fill ${i} ${c.tagName}`)),
    sel: d(sel, 'selector'),
    selPare: d(sel.parentElement, 'selPare'),
    fl: d(fl, 'fletxes'),
    flPare: d(fl.parentElement, 'flPare'),
    flFill: d(fl.firstElementChild, 'flFill'),
  };
}), null, 1));
await ctx.close();
await b.close();
