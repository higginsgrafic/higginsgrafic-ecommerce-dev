import { chromium } from '@playwright/test';
const BASE = 'http://127.0.0.1:3003';
const ARTICLE = { id: 'x|Black|S', title: 'The Human Inside - Afrodita-A', name: 'The Human Inside - Afrodita-A', productSlug: 'the-human-inside-afrodita-a', productRoute: 'the-human-inside-afrodita-a', size: 'S', color: 'Black', qty: 1, quantity: 1, price: '15,50€', unitPrice: 15.5 };
const navegador = await chromium.launch();
for (const mida of [{ w: 1440, h: 1000, nom: 'ordinador' }, { w: 1024, h: 768, nom: 'tauleta' }, { w: 390, h: 844, nom: 'mòbil' }]) {
  const page = await navegador.newPage({ viewport: { width: mida.w, height: mida.h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  await page.addInitScript((a) => localStorage.setItem('cart', JSON.stringify([a])), ARTICLE);
  await page.goto(`${BASE}/checkout`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(5000);
  const info = await page.evaluate(() => {
    const troba = (t) => { const e = [...document.querySelectorAll('div,span,h1')].find((x) => x.children.length === 0 && new RegExp(t, 'i').test(x.textContent || '')); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top) }; };
    return {
      desborda: document.documentElement.scrollWidth > window.innerWidth + 2,
      alcada: document.documentElement.scrollHeight,
      capçalera: (() => { const b = document.querySelector('button[aria-label^="Cistell de la compra"]'); if (!b) return 'no'; return Math.round(b.getBoundingClientRect().top) < 80 ? 'visible ✅' : 'fora'; })(),
      titolComanda: troba('La teva comanda'),
      titolEnviament: troba('Dades d\'enviament'),
      titolPagament: troba('Dades de pagament'),
      botoPagar: (() => { const b = [...document.querySelectorAll('button')].find((x) => /Confirma la compra/i.test(x.innerText)); if (!b) return 'no trobat'; const r = b.getBoundingClientRect(); return { y: Math.round(r.top), ample: Math.round(r.width) }; })(),
    };
  });
  console.log(`${mida.nom} (${mida.w}): ${JSON.stringify(info)}${errors.length ? ' ❌ ' + errors[0] : ''}`);
  await page.screenshot({ path: `/tmp/moure-${mida.w}.png`, fullPage: mida.w < 768 });
  await page.close();
}
await navegador.close();
