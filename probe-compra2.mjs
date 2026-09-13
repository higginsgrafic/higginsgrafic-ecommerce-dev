// Sonda temporal: compra sencera amb el cistell unificat.
import { chromium } from '@playwright/test';

const BASE = 'https://dev.higginsgrafic.com';
const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });
const log = (m) => console.log(m);
page.on('pageerror', (e) => log('❌ JS: ' + e.message.split('\n')[0]));
page.on('console', (m) => { const x = m.text(); if (m.type() === 'error' || /error|Error/.test(x)) log('  [consola] ' + x.slice(0, 160)); });
page.on('framenavigated', (f) => { if (f.url().startsWith('https://dev.higginsgrafic.com')) log('  → navegació: ' + f.url().slice(0, 100)); });
page.on('response', async (r) => {
  if (r.url().includes('create-payment-intent')) {
    log(`  🌐 create-payment-intent → HTTP ${r.status()}`);
    try { log('     ' + (await r.text()).slice(0, 160)); } catch { /* ignore */ }
  }
});

await page.goto(`${BASE}/product/the-human-inside-afrodita-a`, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(6000);

// 1. Afegir (ara el carretó s'obre tot sol i hi ha d'haver l'article)
await page.locator('button[aria-label="Afegir al cistell"]:visible').first().click();
await page.waitForTimeout(3000);
const comptador = await page.evaluate(() => {
  const b = document.querySelector('button[aria-label^="Cistell de la compra"]');
  return b ? b.getAttribute('aria-label') : 'no trobat';
});
log('capçalera: ' + comptador);

// 2. Finalitza la comanda (el segon botó és el que rep els clics)
const finalitza = page.locator('button[aria-label="Finalitza la comanda"]').nth(1);
await finalitza.click({ timeout: 10000 });
await page.waitForTimeout(3000);
log('formulari obert');

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
log('termes marcats: ' + (await termes.isChecked().catch(() => '?')));

// 4. Targeta
for (const [titol, sel, valor] of [
  ['Secure card number input frame', 'input[name="cardnumber"]', '4242424242424242'],
  ['Secure expiration date input frame', 'input[name="exp-date"]', '1230'],
  ['Secure CVC input frame', 'input[name="cvc"]', '123'],
]) {
  await page.frameLocator(`iframe[title="${titol}"]`).locator(sel).first().fill(valor, { timeout: 15000 }).catch((e) => log('  ✗ ' + titol + ': ' + e.message.split('\n')[0].slice(0, 50)));
}

// 5. Pagar
await page.locator('button:has-text("Confirma la compra"):visible').first().click({ timeout: 15000 }).catch((e) => log('  ✗ clic pagar: ' + e.message.split('\n')[0].slice(0, 60)));
await page.waitForTimeout(8000);
const text = ((await page.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
log('adreça final: ' + page.url());
log('text complet (' + text.length + ' car.):');
log(text.slice(0, 700));
await page.screenshot({ path: '/tmp/compra-unificada.png' });
await navegador.close();
