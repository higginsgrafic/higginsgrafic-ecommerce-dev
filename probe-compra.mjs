// Sonda temporal: compra completa fins al final.
import { chromium } from '@playwright/test';

const BASE = 'https://dev.higginsgrafic.com';
const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });

const log = (m) => console.log(m);
page.on('pageerror', (e) => log('❌ ERROR JS: ' + e.message.split('\n')[0]));
page.on('framenavigated', (f) => {
  const u = f.url();
  if (!u.includes('stripe') && !u.includes('hcaptcha')) log('  → navegació: ' + u.slice(0, 110));
});
page.on('response', async (r) => {
  if (r.url().includes('create-payment-intent')) {
    log(`  🌐 create-payment-intent → HTTP ${r.status()}`);
    try { log('     ' + (await r.text()).slice(0, 200)); } catch { /* ignore */ }
  }
});

const text = async () => ((await page.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();

// 1. Afegir al cistell i obrir el panell
await page.goto(`${BASE}/product/the-human-inside-afrodita-a`, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(6000);
await page.locator('button[aria-label="Afegir al cistell"]:visible').first().click();
await page.waitForTimeout(2000);
await page.locator('button[aria-label^="Cistell de la compra"]').first().click();
await page.waitForTimeout(3500);
log('=== panell obert ===');

// 2. Omplir el formulari d'enviament
const dades = {
  firstName: 'Prova', lastName: 'Tecnica', address: 'Carrer Major 1', address2: '2n 1a',
  postalCode: '08001', city: 'Barcelona', province: 'Barcelona', email: 'higginsgrafic@gmail.com', phone: '600000000',
};
for (const [camp, valor] of Object.entries(dades)) {
  const el = page.locator(`input[name="${camp}"]:visible`).first();
  if (await el.count()) { await el.fill(valor); log(`  ✓ ${camp}`); }
  else log(`  ✗ no trobo el camp ${camp}`);
}
const pais = page.locator('select[name="country"]:visible').first();
if (await pais.count()) { await pais.selectOption('Espanya').catch(() => {}); log('  ✓ país'); }

// 3. Acceptar termes
const termes = page.locator('input[type="checkbox"]:visible').first();
if (await termes.count()) { await termes.check().catch(() => {}); log('  ✓ termes'); }

// 4. Targeta de prova dins dels iframes de Stripe
async function ompleTargeta(titol, selector, valor) {
  try {
    const f = page.frameLocator(`iframe[title="${titol}"]`).locator(selector).first();
    await f.fill(valor, { timeout: 15000 });
    log(`  ✓ ${titol}`);
    return true;
  } catch (e) {
    log(`  ✗ ${titol}: ${e.message.split('\n')[0].slice(0, 70)}`);
    return false;
  }
}
await ompleTargeta('Secure card number input frame', 'input[name="cardnumber"]', '4242424242424242');
await ompleTargeta('Secure expiration date input frame', 'input[name="exp-date"]', '1230');
await ompleTargeta('Secure CVC input frame', 'input[name="cvc"]', '123');

await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/form.png' });

// 5. Prémer el botó de pagar
log('=== prement "Confirma la compra" ===');
const pagar = page.locator('button:has-text("Confirma la compra"):visible').first();
log('  botó trobat: ' + (await pagar.count()));
await pagar.click({ timeout: 15000 }).catch((e) => log('  ✗ clic: ' + e.message.split('\n')[0].slice(0, 80)));

// 6. Què passa després?
for (const segons of [3, 6, 10, 15]) {
  await page.waitForTimeout(segons === 3 ? 3000 : 3000);
  const t = await text();
  log(`  t=${segons}s → url: ${page.url().slice(0, 90)}`);
  log(`          text: ${t.slice(0, 160)}`);
}

await page.screenshot({ path: '/tmp/despres.png' });
await navegador.close();
