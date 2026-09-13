import { chromium } from '@playwright/test';
const BASE = 'https://dev.higginsgrafic.com';
const navegador = await chromium.launch();
const page = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(`${BASE}/product/the-human-inside-afrodita-a`, { waitUntil: 'load', timeout: 45000 });
await page.waitForTimeout(6000);
await page.locator('button[aria-label="Afegir al cistell"]:visible').first().click();
await page.waitForTimeout(2000);
await page.locator('button[aria-label^="Cistell de la compra"]').first().click();
await page.waitForTimeout(3500);
const info = await page.evaluate(() => {
  const bs = [...document.querySelectorAll('button[aria-label="Finalitza la comanda"], [id="stripe-guide-finalize-order"]')];
  return bs.map((b) => {
    const r = b.getBoundingClientRect();
    const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    const damunt = document.elementFromPoint(x, y);
    return {
      tag: b.tagName, id: b.id || '(sense id)',
      posicio: { x: Math.round(r.left), y: Math.round(r.top), ample: Math.round(r.width), alcada: Math.round(r.height) },
      dinsFinestra: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight,
      repElClic: damunt === b || b.contains(damunt),
      quiTapa: damunt && !(damunt === b || b.contains(damunt)) ? (damunt.tagName + '.' + (damunt.className || '').toString().slice(0, 24)) : null,
    };
  });
});
console.log(JSON.stringify(info, null, 1));
await page.screenshot({ path: '/tmp/dos-botons.png' });
await navegador.close();
