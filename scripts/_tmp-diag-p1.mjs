import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1024, height: 768 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const estat = () => p.evaluate(() => ({
  pagina: (() => { try { return localStorage.getItem('HG_MEGA_PAGE'); } catch { return 'n/a'; } })(),
  pagines: [...document.querySelectorAll('[data-mega-page-viewport]')].map((e) => `${e.getAttribute('data-mega-page-viewport')}:x${Math.round(e.getBoundingClientRect().left)}:${getComputedStyle(e).visibility}`).join('|') || 'cap',
  nav: [...document.querySelectorAll('nav button')].map((x) => `${(x.textContent || '').trim()}=${x.getAttribute('aria-expanded')}`).join(' | '),
}));
console.log('ABANS', JSON.stringify(await estat()));
await p.locator('nav button').first().click().catch((e) => console.log('clic KO', e.message.split('\n')[0]));
await p.waitForTimeout(6000);
console.log('DESPRES', JSON.stringify(await estat()));
await ctx.close();
await b.close();
