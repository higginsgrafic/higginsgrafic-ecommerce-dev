import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  // El primer header: el div amb border-b (o el de zIndex 10001) que conte les icones.
  const divs = [...document.querySelectorAll('header div')];
  const fila1 = divs.find((d) => { const cs = getComputedStyle(d); return cs.zIndex === '10001' && cs.borderBottomStyle === 'solid'; });
  const fila2 = divs.find((d) => { const cs = getComputedStyle(d); return cs.zIndex === '10001' && cs.borderTopStyle === 'solid'; });
  const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { x: Math.round(x.left), b: Math.round(x.right), w: Math.round(x.width) }; };
  return { fila1: q(fila1), fila2: q(fila2) };
});
console.log(`${w}x${h}`, JSON.stringify(r));
await b.close();
