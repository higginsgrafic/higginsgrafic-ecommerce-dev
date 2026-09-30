// TEMPORAL: els dos casos que no s'han de trencar.
//   A) al mosaic, la captura hi es (el clic navega)
//   B) a la pestanya d'un format, la captura NO hi es (l'app es tocable)
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await p.goto('http://127.0.0.1:3003/browser-overlay.html', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(9000);

const capturaDe = (i) => p.evaluate((i) => {
  const m = document.querySelectorAll('.marc')[i];
  const c = m?.querySelector('.captura');
  return { nom: m?.querySelector('.nom')?.textContent, captura: c ? getComputedStyle(c).display : null, actiu: m?.classList.contains('actiu'), carregat: m?.classList.contains('carregat') };
}, i);

console.log('A) AL MOSAIC (Principal):');
console.log('   ', JSON.stringify(await capturaDe(0)));
console.log('   ', JSON.stringify(await capturaDe(1)));

// Clic per anar a la pestanya del primer format.
const c = await p.evaluate(() => { const r = document.querySelectorAll('.marc')[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await p.mouse.click(c.x, c.y);
await p.waitForTimeout(2500);
console.log('\nB) A LA PESTANYA DEL FORMAT:', await p.evaluate(() => document.querySelector('.pestanya.activa')?.textContent?.trim().slice(0, 20)));
console.log('   ', JSON.stringify(await capturaDe(0)));

// I que el clic arribi a l'aplicacio de dins: mirem si el punt te l'iframe a sota.
const dins = await p.evaluate(() => {
  const m = document.querySelectorAll('.marc')[0];
  const f = m.querySelector('iframe');
  const r = f.getBoundingClientRect();
  const aDalt = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { elementAQuiTocaElClic: aDalt?.tagName + '.' + (aDalt?.className || ''), esIframe: aDalt === f };
});
console.log('   el clic al centre hi toca:', JSON.stringify(dins));

// Tornem a la Principal i capturem amb una ruta per a totes.
await p.evaluate(() => document.querySelector('.pestanya.principal').click());
await p.waitForTimeout(2000);
await p.locator('#ruta').fill('/nova/inici');
await p.locator('#ruta').press('Enter');
await p.waitForTimeout(7000);
writeFileSync('_tmp-visor.png', await p.screenshot());
console.log('\ncaptura: _tmp-visor.png');

console.log('\n=== ERRORS DE CONSOLA ===');
console.log(errors.length ? errors.join('\n') : 'cap error');
await ctx.close();
await b.close();
