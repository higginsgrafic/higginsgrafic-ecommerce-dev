import { chromium } from '@playwright/test';
const BASE = 'https://dev.higginsgrafic.com';
const ARTICLE = { id: 'x|Black|S', title: 'The Human Inside - Afrodita-A', name: 'The Human Inside - Afrodita-A', productSlug: 'the-human-inside-afrodita-a', productRoute: 'the-human-inside-afrodita-a', size: 'S', color: 'Black', qty: 1, quantity: 1, price: '15,50€', unitPrice: 15.5 };
const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (e) => console.log('❌ JS: ' + e.message.split('\n')[0]));
await page.addInitScript((a) => localStorage.setItem('cart', JSON.stringify([a])), ARTICLE);
await page.goto(BASE + '/', { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(6000);
await page.locator('button[aria-label^="Cistell de la compra"]').first().click();
await page.waitForTimeout(4000);
const text = ((await page.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
console.log('text del panell: ' + text.slice(0, 250));
console.log('té FINALITZA? ' + (text.includes('FINALITZA') ? 'sí' : 'NO'));
console.log('diu buit? ' + (text.includes('CISTELL ÉS BUIT') ? 'SÍ' : 'no'));
const elements = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => /FINALITZA LA COMANDA/i.test(x.innerText));
  const r = b?.getBoundingClientRect();
  const overlay = document.querySelector('[data-mega-page-viewport]');
  return {
    botoFinalitza: r ? { x: Math.round(r.left), y: Math.round(r.top), ample: Math.round(r.width), visible: getComputedStyle(b).visibility } : 'no trobat',
    panells: document.querySelectorAll('[data-mega-page-viewport]').length,
    ampladaDocument: document.documentElement.scrollWidth,
  };
});
console.log(JSON.stringify(elements));
await page.screenshot({ path: '/tmp/mega-peta.png' });
await navegador.close();
