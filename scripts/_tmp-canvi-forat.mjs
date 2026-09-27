// TEMPORAL — no es comiteja. En canviar de colleccio, el panell es desmunta? Quant?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__p = [];
  window.__marca = null;
  const mira = () => {
    const p = document.querySelector('[data-mega-panel-surface="1"]');
    window.__p.push({ t: Math.round(performance.now()), hi: !!p });
    if (window.__p.length < 4000) requestAnimationFrame(mira);
  };
  requestAnimationFrame(mira);
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
const noms = await p.evaluate(() => [...document.querySelectorAll('header nav button')].map((b) => b.textContent.trim()).slice(0, 10));
console.log('nav:', noms.join(' | '));
await p.evaluate(() => { window.__marca = Math.round(performance.now()); });
const clicat = await p.evaluate(() => {
  const b = [...document.querySelectorAll('header nav button')].find((x) => /AUSTEN|THE HUMAN INSIDE|CUBE/i.test(x.textContent));
  if (b) { b.click(); return b.textContent.trim(); }
  return null;
});
await p.waitForTimeout(2500);
const forats = await p.evaluate(() => {
  const p2 = window.__p.filter((x) => x.t > window.__marca);
  let inici = null; const out = [];
  for (const x of p2) {
    if (!x.hi && inici == null) inici = x.t;
    if (x.hi && inici != null) { out.push(x.t - inici); inici = null; }
  }
  return out;
});
console.log(`clicat "${clicat}" · forats del panell (ms):`, JSON.stringify(forats));
await b.close();
