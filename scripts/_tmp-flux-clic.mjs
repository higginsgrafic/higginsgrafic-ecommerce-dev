// TEMPORAL — no es comiteja. Clicar la franja varies vegades seguides, tornant
// enrere cada cop, i veure en quin punt deixa de respondre.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 200)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 200)); });

const obreMegaslide = async () => {
  await p.waitForTimeout(1800);
  const boto = await p.$('button:has(svg.lucide-search)');
  if (!boto) { console.log('   (sense boto de cercador)'); return false; }
  await boto.click().catch(() => {});
  await p.waitForTimeout(5000);
  return await p.evaluate(() => !!document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile]'));
};

const punt = () => p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  if (!t) return null;
  const bb = t.getBoundingClientRect();
  const img = t.querySelector('img');
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), dibuix: (img?.currentSrc || '').split('/').pop(), op: getComputedStyle(t).opacity };
});

const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const capa = v2?.querySelector('[data-stripe-drawing-layer]');
  const actius = capa ? [...capa.querySelectorAll('[data-stripe-tile]')].filter((t) => getComputedStyle(t).opacity === '1').length : 0;
  return { url: location.pathname, franjaActius: actius };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);

for (let volta = 1; volta <= 4; volta++) {
  const obert = await obreMegaslide();
  if (!obert) { console.log(`volta ${volta}: el megaslide no te la franja`); break; }
  const q = await punt();
  if (!q) { console.log(`volta ${volta}: casella 7 no trobada`); break; }
  console.log(`volta ${volta}: ${JSON.stringify(await estat())} · casella 7 = ${q.dibuix} (op ${q.op}) @ ${q.x},${q.y}`);
  await p.mouse.click(q.x, q.y);
  await p.waitForTimeout(3200);
  console.log(`volta ${volta}: despres del clic -> ${p.url()}`);
  if (!p.url().includes('?color=')) { console.log('   NO HA NAVEGAT'); break; }
  await p.goBack({ waitUntil: 'load' });
  await p.waitForTimeout(1500);
}

console.log('--- errors:', errs.length);
for (const e of errs.slice(0, 6)) console.log(' ', e);
await b.close();
