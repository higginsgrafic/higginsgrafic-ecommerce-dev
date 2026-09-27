// TEMPORAL — no es comiteja. Tancar i tornar a obrir: salta l'alcada del panell?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__a = [];
  window.__grava = false;
  const mira = () => {
    const p = document.querySelector('[data-mega-panel-surface="1"]');
    if (window.__grava) window.__a.push({ t: Math.round(performance.now()), h: p ? +p.getBoundingClientRect().height.toFixed(1) : null });
    if (window.__a.length < 3000) requestAnimationFrame(mira);
  };
  requestAnimationFrame(mira);
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
const clicat = await p.evaluate(() => {
  const b = [...document.querySelectorAll('header nav button')].find((x) => x.textContent.trim() === 'First Contact');
  if (b) { b.click(); return true; }
  return false;
});
await p.waitForTimeout(800);
console.log('clic tancar:', clicat, 'actiu?', await p.evaluate(() => document.body.style.overflow));
const tancat = await p.evaluate(() => !!document.querySelector('[data-mega-panel-surface="1"]'));
await p.evaluate(() => { window.__a = []; window.__grava = true; });
await p.click('button:has(svg.lucide-search)');
await p.waitForTimeout(2000);
const r = await p.evaluate(() => window.__a.filter((x) => x.h != null));
const hs = r.map((x) => x.h);
console.log('tancat?', tancat, 'mostres', hs.length, 'min', Math.min(...hs), 'max', Math.max(...hs), 'primera', hs[0], 'final', hs[hs.length - 1]);
const salts = [];
for (let i = 1; i < r.length; i++) { const d = Math.abs(r[i].h - r[i - 1].h); if (d > 2) salts.push(`${r[i - 1].h}->${r[i].h}@${r[i].t}ms`); }
console.log('salts >2px:', salts.slice(0, 6).join(' | ') || 'cap');
await b.close();
