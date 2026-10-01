// 02/10/2026 — L'overlay de formats (`public/browser-overlay.html`) amb els dos
// iPad Pro 13 nous: que surtin a la llista i que la finestra els doni la
// classe de tauleta.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });

await p.goto('http://127.0.0.1:3003/browser-overlay.html', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(800);
await p.click('#plega');
// La llista de formats, amb les mides que declara.
const llista = await p.$$eval('label.opcio', (els) => els.map((e) => [e.querySelector('.nom').textContent, e.querySelector('.mida').textContent]));
console.log('formats a la llista:', llista.length);
for (const [nom, mida] of llista) if (/iPad Pro 13/.test(nom)) console.log('  ', nom, mida, '(nou)');
for (const nom of ['iPad Pro 13 vertical', 'iPad Pro 13 apaïssada']) {
  await p.locator('label.opcio', { has: p.locator(`span.nom:text-is("${nom}")`) }).locator('input').check();
  await p.waitForTimeout(300);
}
await p.click('#megaslide');
// Que totes les vistes estiguin vives (el sostre per defecte n'apaga unes quantes).
const sostres = await p.$$eval('#sostre option', (o) => o.map((x) => x.value));
await p.selectOption('#sostre', sostres[sostres.length - 1]);
await p.waitForTimeout(12000);
const marcs = await p.$$eval('.marc', (els) => els.map((e) => ({ id: e.dataset.format, ample: e.querySelector('iframe').style.width, alcada: e.querySelector('iframe').style.height })));
console.log('marcs oberts:', JSON.stringify(marcs));
for (const id of ['ipad-pro-13', 'ipad-pro-13-landscape']) {
  const f = p.frames().find((x) => /nova|localhost|127/.test(x.url()) && x.url() !== p.url());
  void f;
}
const dins = [];
for (const fr of p.frames()) {
  if (fr === p.mainFrame()) continue;
  try {
    const r = await fr.evaluate(async () => {
      const m = await import('/src/utils/layoutModel.js');
      const d = m.deviceLayoutFromViewport(window.innerWidth, window.innerHeight);
      return {
        finestra: `${window.innerWidth}x${window.innerHeight}`,
        classe: d.isPortraitTablet ? 'tauleta vertical' : d.isLandscapeTablet ? 'tauleta apaissada' : d.isDesktop ? 'escriptori' : d.isMobile ? 'mobil' : '?',
        offset: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--appHeaderOffset'), 10) || 0,
      };
    });
    dins.push(r);
  } catch { /* iframe encara carregant */ }
}
console.log('vistes:', JSON.stringify(dins));
console.log('errors', errs.slice(0, 4));
await p.screenshot({ path: '_tmp-overlay-ipad13.png' });
await b.close();
