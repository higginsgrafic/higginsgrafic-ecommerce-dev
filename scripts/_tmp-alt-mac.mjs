// TEMPORAL — Alt+C simulant un Mac: Opcio+C dona key='ç' i code='KeyC'.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
const estat = () => p.evaluate(() => ({
  guies: document.querySelectorAll('[data-guia-carril]').length,
  guardat: window.localStorage.getItem('HG_CARRIL_GUIDES_ENABLED_V1'),
  url: window.location.search,
}));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(5000);
console.log('en obrir (?carril=1):', JSON.stringify(await estat()));
// Opcio+C a un Mac: key = 'ç', code = 'KeyC'
await p.evaluate(() => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ç', code: 'KeyC', altKey: true, bubbles: true, cancelable: true }));
});
await p.waitForTimeout(700);
console.log('despres de Opcio+C (Mac):', JSON.stringify(await estat()));
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(5000);
console.log('despres de recarregar:   ', JSON.stringify(await estat()));
console.log('errors:', errors.length, errors.slice(0, 2));
await ctx.close(); await b.close();
