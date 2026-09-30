import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const estat = () => p.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('loca el megaslide'));
  return b ? b.getAttribute('aria-label') : 'no hi es';
});
console.log('abans  ', await estat());
await p.locator('button[aria-label="Bloca el megaslide"]').click({ timeout: 5000 }).then(() => console.log('clic OK')).catch((e) => console.log('clic KO:', e.message.split('\n')[0].slice(0, 80)));
await p.waitForTimeout(1200);
console.log('despres', await estat());
await b.close();
