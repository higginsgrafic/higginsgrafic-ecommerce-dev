// TEMPORAL — no es comiteja. La cronologia fina del boto d'enrere: pageshow,
// popstate, mutacions del panell i el desplac,ament del carrusel.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

await p.addInitScript(() => {
  window.__tl = [];
  const apunta = (que, extra) => window.__tl.push({ t: Math.round(performance.now()), que, ...(extra || {}) });
  window.addEventListener('pageshow', (e) => apunta('pageshow', { persisted: e.persisted, url: location.pathname + location.search }));
  window.addEventListener('pagehide', (e) => apunta('pagehide', { persisted: e.persisted, url: location.pathname + location.search }));
  window.addEventListener('popstate', () => apunta('popstate', { url: location.pathname + location.search }));
  const observa = () => {
    const obj = new MutationObserver(() => {
      const p2 = document.querySelector('[data-mega-page-viewport="2"]');
      const cont = p2?.querySelector('[data-carrusel="1"] > div');
      const pista = cont?.firstElementChild;
      const tf = pista ? getComputedStyle(pista).transform : null;
      window.__tl.push({
        t: Math.round(performance.now()),
        que: 'mut',
        panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
        vp2: !!p2,
        tx: tf && tf !== 'none' ? +(+tf.split(',')[4]).toFixed(2) : null,
        url: location.pathname + location.search,
      });
    });
    obj.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'data-mega-panel-surface'] });
  };
  document.addEventListener('DOMContentLoaded', observa);
  if (document.readyState !== 'loading') observa();
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
await p.evaluate(() => { window.__tl = []; });

const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(2500);
const abans = await p.evaluate(() => window.__tl.map((x) => `${x.t} ${x.que}${x.persisted !== undefined ? ' persisted=' + x.persisted : ''}${x.tx !== undefined && x.tx !== null ? ' tx=' + x.tx : ''}${x.vp2 !== undefined ? ' vp2=' + x.vp2 : ''} ${x.url || ''}`));
console.log('--- fins a la PDP (' + abans.length + ') ---');
console.log(abans.slice(-14).join('\n'));

await p.goBack({ waitUntil: 'load' });
await p.waitForTimeout(2500);
const tot = await p.evaluate(() => window.__tl.map((x) => `${x.t} ${x.que}${x.persisted !== undefined ? ' persisted=' + x.persisted : ''}${x.tx !== undefined && x.tx !== null ? ' tx=' + x.tx : ''}${x.vp2 !== undefined ? ' vp2=' + x.vp2 : ''} ${x.url || ''}`));
console.log('--- ultimes 26 ---');
console.log(tot.slice(-26).join('\n'));
console.log('--- total', tot.length);
await b.close();
