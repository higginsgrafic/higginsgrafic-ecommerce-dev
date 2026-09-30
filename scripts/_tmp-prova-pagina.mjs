import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => { try { window.localStorage.setItem('HG_MEGA_PAGE', '1'); } catch { /* res */ } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-taula-vertical]')].map((t) => {
  const r = t.getBoundingClientRect();
  return { pagina: t.getAttribute('data-taula-vertical'), x: Math.round(r.left), y: Math.round(r.top), celaSelector: !!t.querySelector('[data-taula-cela="6"] [data-stripe-buttonbar], [data-taula-cela="1"] [data-stripe-buttonbar]') };
}))));
await b.close();
