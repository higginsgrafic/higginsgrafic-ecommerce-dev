// Sonda temporal: què falla a la portada de la botiga?
import { chromium } from '@playwright/test';

const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1280, height: 900 } });

page.on('pageerror', (e) => console.log('❌ ERROR JS:', e.message.split('\n')[0]));
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) {
    console.log(`⚠️  [${m.type()}]`, m.text().slice(0, 220));
  }
});
page.on('response', (r) => {
  if (r.status() >= 400) console.log(`🌐 ${r.status()} ${r.request().method()} ${r.url().slice(0, 130)}`);
});

await page.goto('https://dev.higginsgrafic.com/', { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(8000);

const text = ((await page.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
console.log('\n--- text visible ---');
console.log(text.slice(0, 300));

await navegador.close();
