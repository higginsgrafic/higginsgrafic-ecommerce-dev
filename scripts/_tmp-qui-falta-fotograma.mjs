// TEMPORAL — no es comiteja. Quines imatges falten al PRIMER fotograma pintat?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__m = [];
  const foto = () => {
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    if (panell) {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const v1 = document.querySelector('[data-mega-page-viewport="1"]');
      const imgs = panell.querySelectorAll('img');
      const falt = [];
      const tots = [];
      imgs.forEach((i) => {
        const src = i.currentSrc || i.src || '';
        tots.push({ src, ok: i.naturalWidth > 0, lazy: i.getAttribute('loading') || '' });
        if (!(i.naturalWidth > 0)) falt.push(src);
      });
      window.__m.push({
        t: Math.round(performance.now()),
        panell: true,
        v1: !!v1, v2: !!v2,
        total: imgs.length,
        falt: falt.length,
        faltLlista: falt,
        tots,
      });
    }
    if (window.__m.length < 600) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
const m = await p.evaluate(() => window.__m);
const primera = m[0];
console.log(`mostres=${m.length} primera t=${primera?.t} total=${primera?.total} falten=${primera?.falt}`);
const perCarpeta = {};
for (const s of (primera?.faltLlista || [])) {
  const m2 = s.match(/\/custom_logos\/drawings\/([^/]+)\//);
  const k = m2 ? m2[1] : s.slice(0, 60);
  perCarpeta[k] = (perCarpeta[k] || 0) + 1;
}
console.log('faltants per carpeta:', perCarpeta);
console.log('--- primeres 12 faltants ---');
for (const s of (primera?.faltLlista || []).slice(0, 12)) console.log(' ', s);
const lazy = {};
for (const x of (primera?.tots || [])) { lazy[x.lazy || 'cap'] = (lazy[x.lazy || 'cap'] || 0) + 1; }
console.log('loading attrs:', lazy);
await b.close();
