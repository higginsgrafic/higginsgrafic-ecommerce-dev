// Sonda temporal: reprodueix el camí de compra dins del megaslide.
import { chromium } from '@playwright/test';

const BASE = 'https://dev.higginsgrafic.com';
const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });

page.on('pageerror', (e) => console.log('❌ ERROR JS:', e.message.split('\n')[0]));
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' && !t.includes('gelato-api-live') && !t.includes('favicon')) console.log('⚠️ ', t.slice(0, 150));
});
page.on('framenavigated', (f) => console.log('  → navegació:', f.url().slice(0, 100)));

const text = async () => ((await page.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();

console.log('=== 1. afegir al cistell ===');
await page.goto(`${BASE}/product/the-human-inside-afrodita-a`, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(6000);
await page.locator('button[aria-label="Afegir al cistell"]:visible').first().click();
await page.waitForTimeout(2000);
console.log('  cistell:', (await text()).match(/CISTELL[^A-Z]{0,30}/)?.[0] || '?');

console.log('=== 2. obrir el cistell (icona) ===');
const icona = page.locator('button[aria-label^="Cistell de la compra"]').first();
console.log('  icona trobada:', await icona.count());
await icona.click();
await page.waitForTimeout(3000);
let t = await text();
console.log('  text del panell:', t.slice(0, 300));

console.log('=== 3. quins camps hi ha? ===');
const camps = await page.locator('input:visible, select:visible').evaluateAll((els) =>
  els.map((e) => `${e.tagName.toLowerCase()}[${e.type || ''}] ${e.name || e.id || e.placeholder || '-'}`)
);
console.log('  camps visibles:', JSON.stringify(camps));
const iframes = await page.evaluate(() => [...document.querySelectorAll('iframe')].map((f) => f.name || f.src.slice(0, 60)));
console.log('  iframes (Stripe):', JSON.stringify(iframes));

await page.screenshot({ path: '/tmp/cistell.png' });
await navegador.close();
