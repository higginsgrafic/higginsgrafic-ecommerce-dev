// Sonda temporal: compra sencera amb la pàgina de pagament nova.
import { chromium } from '@playwright/test';

const BASE = 'https://dev.higginsgrafic.com';
const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });
const log = (m) => console.log(m);
page.on('pageerror', (e) => log('❌ JS: ' + e.message.split('\n')[0]));
page.on('framenavigated', (f) => { if (f.url().startsWith(BASE)) log('  → ' + f.url().slice(0, 95)); });
page.on('response', async (r) => {
  if (r.url().includes('create-payment-intent')) log(`  🌐 create-payment-intent → HTTP ${r.status()}`);
});

await page.goto(`${BASE}/product/the-human-inside-afrodita-a`, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(6000);

// 1. Afegir
await page.locator('button[aria-label="Afegir al cistell"]:visible').first().click();
await page.waitForTimeout(3000);

// 2. FINALITZA LA COMANDA (el botó que rep el clic)
const boto = await page.evaluate(() => {
  for (const b of document.querySelectorAll('button[aria-label="Finalitza la comanda"]')) {
    const r = b.getBoundingClientRect();
    const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    const damunt = document.elementFromPoint(x, y);
    if (damunt === b || b.contains(damunt)) return { x, y };
  }
  return null;
});
log('botó FINALITZA: ' + JSON.stringify(boto));
await page.mouse.click(boto.x, boto.y);
await page.waitForTimeout(4500);
log('adreça: ' + page.url().replace(BASE, ''));

// 3. Dades
const dades = { firstName: 'Prova', lastName: 'Tecnica', address: 'Carrer Major 1', postalCode: '08001', city: 'Barcelona', province: 'Barcelona', email: 'higginsgrafic@gmail.com', phone: '600000000' };
for (const [camp, valor] of Object.entries(dades)) {
  const el = page.locator(`input[name="${camp}"]:visible`).first();
  if (await el.count()) await el.fill(valor);
}
const pais = page.locator('select[name="country"]:visible').first();
if (await pais.count()) await pais.selectOption('Espanya').catch(() => {});
const termes = page.locator('label:has-text("Accepto els") input[type="checkbox"]').first();
await termes.check({ force: true }).catch(() => {});
log('termes: ' + (await termes.isChecked().catch(() => '?')));

// 4. Targeta
for (const [titol, sel, valor] of [
  ['Secure card number input frame', 'input[name="cardnumber"]', '4242424242424242'],
  ['Secure expiration date input frame', 'input[name="exp-date"]', '1230'],
  ['Secure CVC input frame', 'input[name="cvc"]', '123'],
]) {
  await page.frameLocator(`iframe[title="${titol}"]`).locator(sel).first().fill(valor, { timeout: 15000 }).catch(() => log('  ✗ ' + titol));
}

// 5. Pagar
await page.locator('button:has-text("Confirma la compra"):visible').first().click({ timeout: 15000 }).catch((e) => log('  ✗ ' + e.message.split('\n')[0].slice(0, 60)));
await page.waitForTimeout(9000);
const text = ((await page.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
log('ADREÇA FINAL: ' + page.url().replace(BASE, ''));
log('TEXT: ' + text.slice(0, 220));
log('errors JS: ' + (page.url() ? '' : ''));
await page.screenshot({ path: '/tmp/compra-pagina-nova.png' });
await navegador.close();
