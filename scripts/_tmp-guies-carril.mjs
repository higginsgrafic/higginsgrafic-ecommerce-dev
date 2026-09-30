// TEMPORAL — el commutador de les guies del carril, a la ruta on viu la barra.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
const estat = () => p.evaluate(() => ({
  guies: document.querySelectorAll('[data-guia-carril]').length,
  boto: (() => { const b = document.querySelector('button[aria-label="Carril"]'); return b ? b.getAttribute('aria-pressed') : null; })(),
  guardat: window.localStorage.getItem('HG_CARRIL_GUIDES_ENABLED_V1'),
  url: window.location.search,
}));
for (const url of ['/full-wide-slide?debug=1&carril=1', '/full-wide-slide?debug=1']) {
  await p.goto(`http://127.0.0.1:3003${url}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(5000);
  console.log(`${url}\n  en obrir: ${JSON.stringify(await estat())}`);
  const btn = p.locator('button[aria-label="Carril"]').first();
  if (await btn.count()) {
    await btn.click({ force: true }).catch((e) => console.log('  CLIC ERROR', e.message.slice(0, 60)));
    await p.waitForTimeout(700);
    console.log(`  clic 1:   ${JSON.stringify(await estat())}`);
    await btn.click({ force: true }).catch(() => {});
    await p.waitForTimeout(700);
    console.log(`  clic 2:   ${JSON.stringify(await estat())}`);
  } else console.log('  (no hi ha el boto Carril)');
}
console.log('errors:', errors.length, errors.slice(0, 3));
await ctx.close(); await b.close();
