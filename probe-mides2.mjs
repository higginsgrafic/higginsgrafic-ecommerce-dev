import { chromium } from '@playwright/test';
const BASE = 'https://dev.higginsgrafic.com';
const ARTICLE = { id: 'x|Black|S', title: 'The Human Inside - Afrodita-A', name: 'The Human Inside - Afrodita-A', productSlug: 'the-human-inside-afrodita-a', productRoute: 'the-human-inside-afrodita-a', size: 'S', color: 'Black', qty: 1, quantity: 1, price: '15,50€', unitPrice: 15.5 };
const navegador = await chromium.launch();
for (const mida of [{ w: 768, h: 1024, nom: 'tauleta vertical' }, { w: 1024, h: 768, nom: 'tauleta apaïsada' }, { w: 390, h: 844, nom: 'mòbil' }]) {
  const page = await navegador.newPage({ viewport: { width: mida.w, height: mida.h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  await page.addInitScript((a) => localStorage.setItem('cart', JSON.stringify([a])), ARTICLE);
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(6000);
  const b = page.locator('button[aria-label^="Cistell de la compra"], button[aria-label*="istell"]').first();
  if (await b.count()) await b.click().catch(() => {});
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => {
    const t = (document.body.innerText || '').replace(/\s+/g, ' ');
    const fin = [...document.querySelectorAll('button')].find((x) => /FINALITZA LA COMANDA/i.test(x.innerText));
    const r = fin?.getBoundingClientRect();
    return {
      errors: '',
      teFinalitza: !!fin,
      dinsFinestra: r ? (r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight) : false,
      desborda: document.documentElement.scrollWidth > window.innerWidth + 2,
      text: t.slice(0, 90),
    };
  });
  console.log(`${mida.nom} (${mida.w}x${mida.h}): ${JSON.stringify(info)}${errors.length ? ' ❌ ' + errors[0] : ''}`);
  await page.screenshot({ path: `/tmp/mega-${mida.w}.png` });
  await page.close();
}
await navegador.close();
