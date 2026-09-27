// TEMPORAL — no es comiteja. Clic en una samarreta VELADA (pagina 2): que es mou?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await ctx.addInitScript(() => {
  history.pushState = () => {};
  window.__m = [];
  window.__click = null;
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (v2) {
      const v = v2.getBoundingClientRect().top;
      const arr = [...v2.querySelectorAll('[data-stripe-tile]')]
        .sort((a, c) => Number(a.getAttribute('data-stripe-tile')) - Number(c.getAttribute('data-stripe-tile')))
        .map((el) => ({
          i: Number(el.getAttribute('data-stripe-tile')),
          s: ((el.getAttribute('data-stripe-src') || '').split('/').pop() || '').replace(/-(b|w|multi-light|multi-dark)-stripe\.webp$/, '').padEnd(15).slice(0, 15),
          l: +el.getBoundingClientRect().left.toFixed(1),
        }));
      const crop = v2.querySelector('[data-carrusel="1"] > div');
      const tira = crop ? crop.firstElementChild : null;
      const tr = tira ? getComputedStyle(tira).transform : null;
      window.__m.push({ t: Math.round(performance.now()), arr, tr, mt: v2.querySelector('[data-p2-color-grid]') ? getComputedStyle(v2.querySelector('[data-p2-color-grid]')).marginTop : null });
    }
    if (window.__m.length < 3000) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
const volColl = process.env.HG_COLL || null;
const info = await p.evaluate((vol) => {
  const actiu = (new URLSearchParams(location.search).get('active') || 'first_contact').replace(/-/g, '_');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const t = [...v2.querySelectorAll('[data-stripe-tile]')].find((el) => {
    const r = el.getBoundingClientRect();
    const coll = el.getAttribute('data-stripe-collection') || '';
    return r.left > 400 && r.left < 1500 && coll && coll !== actiu && (!vol || coll === vol);
  });
  if (!t) return null;
  const r = t.getBoundingClientRect();
  return { actiu, i: t.getAttribute('data-stripe-tile'), src: (t.getAttribute('data-stripe-src') || '').split('/').pop(), coll: t.getAttribute('data-stripe-collection'), x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
}, volColl);
console.log('cel·la velada:', JSON.stringify(info));
await p.evaluate(() => { window.__click = Math.round(performance.now()); });
await p.mouse.click(info.x, info.y);
await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  const m = window.__m.filter((x) => x.arr && x.arr.length === 14);
  const c = window.__click;
  const abans = [...m].reverse().find((x) => x.t < c) || m[0];
  const despres = m[m.length - 1];
  const fmt = (x) => x.arr.map((a) => `${a.i}:${a.s}`).join(' | ');
  return {
    click: c, url: location.search,
    abans: fmt(abans), despres: fmt(despres),
    trAbans: abans.tr, trDespres: despres.tr,
    mtAbans: abans.mt, mtDespres: despres.mt,
  };
});
console.log('url:', r.url, '· click', r.click);
console.log('TR abans  :', r.trAbans, '| mt', r.mtAbans);
console.log('TR despres:', r.trDespres, '| mt', r.mtDespres);
for (let i = 0; i < 14; i += 1) {
  const a = r.abans.split(' | ')[i];
  const d = r.despres.split(' | ')[i];
  console.log(`${a === d ? ' ' : 'X'} casa ${String(i).padStart(2)}  ${a.padEnd(22)} -> ${d}`);
}
await b.close();
