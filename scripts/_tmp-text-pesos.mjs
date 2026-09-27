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
  const act = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') === 'true');
  const alt = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') !== 'true');
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"] button[aria-label="Blanc"] span');
  const m = (e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { fs: cs.fontSize, fw: cs.fontWeight, ff: cs.fontFamily.slice(0, 20), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  return {
    actiu: m(act.querySelector('span')),
    espera: m(alt.querySelector('span')),
    selector: m(sel),
    oswald200: document.fonts ? document.fonts.check('200 13px Oswald') : null,
    oswald300: document.fonts ? document.fonts.check('300 13px Oswald') : null,
  };
}), null, 1));
await ctx.close();
await b.close();
