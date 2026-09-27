// TEMPORAL — no es comiteja. Es frena NOME'S la peça de la PDP per obligar el
// Suspense a ensenyar el seu fallback: es una recarrega o una navegacio SPA?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.route('**/PdpPage*', async (route) => {
  await new Promise((r) => setTimeout(r, 2500));
  await route.continue();
});
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
await p.evaluate(() => {
  window.__marca = 'hi-soc';
  window.__flash = [];
  const id = setInterval(() => {
    const car = [...document.querySelectorAll('p,div')].some((e) => (e.textContent || '').trim() === 'Carregant...');
    const capa = document.querySelector('.fixed.inset-0') ? true : null;
    window.__flash.push({ t: Math.round(performance.now()), carregant: car, marca: window.__marca ?? null, capa });
  }, 100);
  setTimeout(() => clearInterval(id), 14000);
});
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="5"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(11000);
const r = await p.evaluate(() => {
  const f = window.__flash || [];
  const amb = f.filter((x) => x.carregant);
  return { marca: window.__marca ?? null, mostres: f.length, ambCarregant: amb.length, primera: amb[0] || null, ultima: amb[amb.length - 1] || null, url: location.href };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
