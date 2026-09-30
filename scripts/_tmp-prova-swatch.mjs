// TEMPORAL: quants elements `data-color-barra="black"` hi ha i quin mana al p2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const info = await p.evaluate(() => [...document.querySelectorAll('[data-color-barra="black"]')].map((el, i) => {
  const r = el.getBoundingClientRect();
  const grid = el.closest('[data-p2-color-grid]');
  const taula = el.closest('[data-taula-vertical]');
  return { i, tag: el.tagName, caixa: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`,
    dinsP2Grid: !!grid, taula: taula ? taula.getAttribute('data-taula-vertical') : null,
    esFill: !!el.querySelector('button'), aria: el.querySelector('button') ? el.querySelector('button').getAttribute('aria-label') : el.getAttribute('aria-label') };
}));
console.log(JSON.stringify(info, null, 1));
const vel = () => p.evaluate(() => {
  const cela = document.querySelector('[data-taula-vertical="2"] [data-taula-cela="6-9+11-14"]');
  return [...cela.querySelectorAll('svg g')].filter((g) => (g.getAttribute('mask') || '').includes('hgVelForaActives'))
    .map((g) => `${g.getAttribute('opacity')} x${g.querySelectorAll('path').length}`).join('  ');
});
// MISCEL activa i despres el negre, clicant cada candidat.
const i = await p.evaluate(() => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
  .findIndex((b) => b.textContent.trim().toUpperCase().startsWith('MISCEL')));
await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
await p.waitForTimeout(1200);
console.log('MISCEL activa (abans del negre):', await vel());
for (const k of [0, 1]) {
  const ok = await p.evaluate((n) => {
    const el = [...document.querySelectorAll('[data-color-barra="black"]')][n];
    const boto = el.querySelector('button') || el;
    if (!boto || boto.tagName !== 'BUTTON' || boto.disabled) return 'no clicable';
    boto.click(); return 'clicat';
  }, k);
  await p.waitForTimeout(1200);
  console.log(`  candidat ${k}: ${ok}  ->  vel: ${await vel()}`);
}
await b.close();
