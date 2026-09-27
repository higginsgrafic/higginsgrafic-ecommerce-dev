// TEMPORAL — no es coiteja. El comportament de la p1: clicar un dibuix ha de
// deixar el carrusel quiet i presentar el dibuix a TOTES les samarretes.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
const estat = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const t = v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const dibuixos = [...v1.querySelectorAll('[data-stripe-visual-content="1"] img')].map((i) => (i.getAttribute('src') || '').split('/').slice(-1)[0]).filter(Boolean);
  const unics = [...new Set(dibuixos)];
  // Les imatges de DINS la franja visible (les 14 samarretes)
  const franja = v1.querySelector('[data-stripe-visual-content="1"]');
  const totes = [...(franja ? franja.querySelectorAll('img') : [])].map((i) => (i.getAttribute('src') || '').split('/').slice(-1)[0]).filter(Boolean);
  const franjaUnics = [...new Set(totes)];
  return { carrusel: getComputedStyle(t).transform, nUnicsGraella: unics.length, unicsGraella: unics.slice(0, 4), nImgsFranja: totes.length, nUnicsFranja: franjaUnics.length, unicsFranja: franjaUnics.slice(0, 6) };
});
console.log('ABANS:', JSON.stringify(await estat()));
// Clic a un dibuix de la graella (visible)
const c = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const tira = v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const b2 = [...tira.querySelectorAll('button')].find((x) => { const r = x.getBoundingClientRect(); return r.left > 381 && r.right < 1390 && getComputedStyle(x).opacity < 0.5; });
  const r = b2.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: b2.getAttribute('aria-label') };
});
console.log('clic a:', c.label);
await p.mouse.click(c.x, c.y);
await p.waitForTimeout(2500);
console.log('DESPRES:', JSON.stringify(await estat()));
await ctx.close();
await b.close();
