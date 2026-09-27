// TEMPORAL — no es comiteja. Quina mida te The Phoenix a la franja i a la
// graella, comparat amb els altres de FIRST CONTACT?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  // GRAELLA: totes les peces de first_contact amb la mida pintada.
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const n = bs.length / 2;
  const graella = bs.slice(0, 7).map((x) => {
    const img = x.querySelector('img');
    const ib = img.getBoundingClientRect();
    return { lab: x.getAttribute('aria-label'), pintat: `${Math.round(ib.width)}x${Math.round(ib.height)}`, tf: getComputedStyle(img).transform.slice(0, 34) };
  });
  // FRANJA: la primera casa que ensenya cada dibuix de first_contact.
  const franja = [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => {
    const img = t.querySelector('img');
    if (!img) return null;
    const src = (img.currentSrc || '').split('/').pop();
    const ib = img.getBoundingClientRect();
    return { casa: t.getAttribute('data-stripe-tile'), src, pintat: `${Math.round(ib.width)}x${Math.round(ib.height)}`, natural: `${img.naturalWidth}x${img.naturalHeight}`, tf: getComputedStyle(img).transform.slice(0, 34) };
  }).filter(Boolean);
  return { graella, franja: franja.slice(0, 7) };
});
console.log('--- GRAELLA (first_contact)');
for (const x of r.graella) console.log(`  ${String(x.lab).padEnd(14)} pintat=${x.pintat.padEnd(9)} ${x.tf}`);
console.log('--- FRANJA');
for (const x of r.franja) console.log(`  casa ${x.casa} ${String(x.src).padEnd(30)} pintat=${x.pintat.padEnd(9)} natural=${String(x.natural).padEnd(9)} ${x.tf}`);
await b.close();
