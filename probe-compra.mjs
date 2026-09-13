// Sonda temporal: compra completa pas a pas, per veure on falla.
import { chromium } from '@playwright/test';

const BASE = 'https://dev.higginsgrafic.com';
const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });

page.on('pageerror', (e) => console.log('❌ ERROR JS:', e.message.split('\n')[0]));
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' && !t.includes('gelato-api-live') && !t.includes('favicon') && !t.includes('DevTools')) {
    console.log('⚠️  consola:', t.slice(0, 200));
  }
});
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('gelato-api-live')) {
    console.log(`🌐 ${r.status()} ${r.request().method()} ${r.url().slice(0, 120)}`);
  }
});

const text = async () => ((await page.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();

console.log('=== 1. Fitxa de producte ===');
await page.goto(`${BASE}/product/the-human-inside-afrodita-a`, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(6000);
const boto = page.locator('button[aria-label="Afegir al cistell"]').first();
console.log('botons d\'afegir trobats:', await page.locator('button[aria-label="Afegir al cistell"]').count());

if (await boto.count()) {
  await boto.click();
  await page.waitForTimeout(3000);
  console.log('després de clicar, text:', (await text()).slice(0, 200));
}

console.log('\n=== 2. Pàgina de pagament ===');
await page.goto(`${BASE}/checkout`, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(7000);
console.log('adreça:', page.url());
console.log('text:', (await text()).slice(0, 400));

const camps = await page.locator('input, select, textarea').evaluateAll((els) =>
  els.map((e) => `${e.tagName.toLowerCase()}[${e.type || ''}] name=${e.name || '-'} id=${e.id || '-'} placeholder=${e.placeholder || '-'}`).slice(0, 25)
);
console.log('camps del formulari:', JSON.stringify(camps, null, 1));

await page.screenshot({ path: '/tmp/pas2.png' });
await navegador.close();
