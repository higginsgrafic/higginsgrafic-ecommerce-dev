import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const estat = () => p.evaluate(() => [...document.querySelectorAll('[data-colleccions-caixes="1"] button')]
  .map((b) => `${(b.textContent || '').trim().slice(0, 22)}${getComputedStyle(b).backgroundColor === 'rgb(255, 255, 255)' ? '  <-- PASTILLA' : ''}`));
console.log('--- abans de clicar'); console.log((await estat()).join('\n'));
await p.click('[data-colleccions-caixes="1"] button:has-text("PEMBERLEY")').catch((e) => console.log('clic fallit:', e.message));
await p.waitForTimeout(1500);
console.log('--- despres de clicar PEMBERLEY'); console.log((await estat()).join('\n'));
await b.close();
