// TEMPORAL — no es comiteja. Validacio final del pas a la PDP: la capçalera i la
// franja es queden, no hi ha load nou, i la marca de la pagina sobreviu.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.route('**/PdpPage*', async (route) => { await new Promise((r) => setTimeout(r, 2500)); await route.continue(); });
let loads = 0;
p.on('load', () => { loads += 1; });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
await p.evaluate(() => { window.__marca = 'hi-soc'; });
const loadsAbans = loads;

// 1) Clic a un dibuix de la graella
const g = await p.evaluate(() => {
  const bs = [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-carrusel="1"] button')];
  const t = bs.find((x) => x.getAttribute('aria-label') === 'Wormhole');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(g.x, g.y);
await p.waitForTimeout(4000);
const r1 = await p.evaluate(() => ({
  url: location.pathname + location.search,
  marca: window.__marca ?? null,
  carregant: [...document.querySelectorAll('p')].some((e) => (e.textContent || '').trim() === 'Carregant...'),
  capcalera: !!document.querySelector('header'),
}));
console.log('1 dibuix graella:', JSON.stringify(r1), '| loads nous:', loads - loadsAbans);

await p.goBack({ waitUntil: "commit" });
await p.waitForTimeout(3500);
console.log('2 enrere        :', JSON.stringify(await p.evaluate(() => ({
  url: location.pathname + location.search,
  panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
  tiles: document.querySelectorAll('[data-stripe-tile]').length,
  marca: window.__marca ?? null,
}))));
console.log('loads nous:', loads - loadsAbans, '| errors:', errs.length, errs.slice(0, 2));
await b.close();
