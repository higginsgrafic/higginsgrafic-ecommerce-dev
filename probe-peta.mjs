import { chromium } from '@playwright/test';
const BASE = 'https://dev.higginsgrafic.com';
const ARTICLE = { id: 'x|Black|S', title: 'The Human Inside - Afrodita-A', name: 'The Human Inside - Afrodita-A', productSlug: 'the-human-inside-afrodita-a', productRoute: 'the-human-inside-afrodita-a', size: 'S', color: 'Black', qty: 1, quantity: 1, price: '15,50€', unitPrice: 15.5 };
const navegador = await chromium.launch();

async function prova(nom, url, prepara) {
  const page = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('gelato-api-live') && !m.text().includes('favicon')) errors.push('[consola] ' + m.text().slice(0, 120)); });
  await page.addInitScript((a) => localStorage.setItem('cart', JSON.stringify([a])), ARTICLE);
  await page.goto(BASE + url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(6000);
  if (prepara) await prepara(page);
  await page.waitForTimeout(3000);
  const text = ((await page.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
  console.log(`--- ${nom} (${url}) ---`);
  console.log('  text: ' + text.slice(0, 180));
  console.log('  errors: ' + (errors.length ? JSON.stringify(errors.slice(0, 3)) : 'cap'));
  await page.close();
}

await prova('portada', '/', async (page) => {
  const b = page.locator('button[aria-label^="Cistell de la compra"]').first();
  if (await b.count()) await b.click();
});
await prova('portada + navegació col·lecció', '/', async (page) => {
  const b = page.locator('button:has-text("AUSTEN"), a:has-text("AUSTEN")').first();
  if (await b.count()) await b.click().catch(() => {});
});
await prova('pagina de pagament', '/checkout', null);
await prove('fi');
async function prove() {}
await navegador.close();
