// TEMPORAL — no es comiteja. En canviar de ruta (isNavigating), la capçalera i el
// megaslide es queden? Es mostreja el primer segon despres de navegar.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.route('**/PdpPage*', async (route) => { await new Promise((r) => setTimeout(r, 1800)); await route.continue(); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
await p.evaluate(() => {
  window.__mostres = [];
  const id = setInterval(() => {
    const car = [...document.querySelectorAll('p')].find((e) => (e.textContent || '').trim() === 'Carregant...');
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    window.__mostres.push({
      carregant: !!car,
      panell: !!panell,
      tiles: document.querySelectorAll('[data-stripe-tile]').length,
      capcalera: !!document.querySelector('header'),
    });
  }, 100);
  setTimeout(() => clearInterval(id), 12000);
});
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="5"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const f = window.__mostres || [];
  const amb = f.filter((x) => x.carregant);
  return {
    mostres: f.length,
    ambCarregant: amb.length,
    durantElCarregant: amb.length ? { panell: amb.every((x) => x.panell), capcalera: amb.every((x) => x.capcalera), tiles: Math.min(...amb.map((x) => x.tiles)) } : null,
    url: location.pathname + location.search,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
