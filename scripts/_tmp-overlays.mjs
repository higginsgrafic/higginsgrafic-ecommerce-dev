import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
const d = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const f = v2.querySelector('[data-stripe-visual-content="2"]');
  const imgs = [...f.querySelectorAll('img')].filter((i) => /-stripe\.webp/.test(i.currentSrc || i.src) && !/full-/.test(i.currentSrc || i.src));
  return imgs.slice(0, 5).map((i) => ({ src: (i.currentSrc || i.src).split('/').pop(), ample: +i.getBoundingClientRect().width.toFixed(1), alt: +i.getBoundingClientRect().height.toFixed(1), natural: i.naturalWidth }));
});
console.log(`overlays de dibuix a la franja: ${d.length} (mostra de 5)`);
for (const x of d) console.log(`  ${String(x.src).padEnd(40)} nat ${x.natural} -> ${x.ample}x${x.alt}`);
await b.close();
