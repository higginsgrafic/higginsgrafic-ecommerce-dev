// TEMPORAL — no es comiteja. Captura DURANT el fallback del Suspense: la
// capçalera hi es? el megaslide hi es? el blanc cobreix la pagina sencera?
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.route('**/PdpPage*', async (route) => { await new Promise((r) => setTimeout(r, 4000)); await route.continue(); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="5"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(1200);
fs.mkdirSync('/tmp/hg-captures', { recursive: true });
await p.screenshot({ path: '/tmp/hg-captures/fallback.png' });
const r = await p.evaluate(() => {
  const car = [...document.querySelectorAll('p')].find((e) => (e.textContent || '').trim() === 'Carregant...');
  const bb = car?.getBoundingClientRect();
  const es = (s) => { const e = document.querySelector(s); return e ? (() => { const b = e.getBoundingClientRect(); return `${Math.round(b.width)}x${Math.round(b.height)}`; })() : null; };
  return {
    carregant: !!car,
    caixaCarregant: bb ? `${Math.round(bb.width)}x${Math.round(bb.height)} a ${Math.round(bb.top)}` : null,
    capcalera: es('header') || es('nav'),
    panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    tiles: document.querySelectorAll('[data-stripe-tile]').length,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
