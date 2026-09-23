import { chromium } from '@playwright/test';
const navegador = await chromium.launch();
// 360x780 es el Galaxy S25 (1080x2340 a DPR 3). 360x640 es un Android 16:9
// (1080x1920 a DPR 3). Son dos telefon d'avui, amb sorties molt diferents.
for (const [w, h, nom] of [[360, 780, 'Galaxy S25 vertical'], [780, 360, 'Galaxy S25 apaisat'], [360, 640, 'Android 16:9 vertical'], [640, 360, 'Android 16:9 apaisat'], [375, 667, 'iPhone SE2 vertical'], [667, 375, 'iPhone SE2 apaisat']]) {
  const page = await (await navegador.newContext({ viewport: { width: w, height: h }, hasTouch: true })).newPage();
  await page.goto('http://127.0.0.1:3003/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForSelector('header', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1600);
  const r = await page.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.top < window.innerHeight; };
    const cistell = [...document.querySelectorAll('[aria-label]')].filter((e) => /cistell/i.test(e.getAttribute('aria-label')) && !/afegir/i.test(e.getAttribute('aria-label')) && vis(e));
    const barra = [...document.querySelectorAll('nav')].filter((e) => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().bottom > window.innerHeight - 20 && e.getBoundingClientRect().height > 20);
    const root = getComputedStyle(document.documentElement);
    return { offset: root.getPropertyValue('--appHeaderOffset').trim(), cistell: cistell.length, barra: barra.length };
  });
  const ok = r.cistell > 0 || r.barra > 0;
  console.log(`${nom.padEnd(24)} ${String(w).padStart(3)}x${String(h).padEnd(3)} offset ${r.offset.padEnd(6)} cistell ${r.cistell} barra ${r.barra} -> ${ok ? 'es pot comprar' : 'NO es pot comprar'}`);
}
await navegador.close();
