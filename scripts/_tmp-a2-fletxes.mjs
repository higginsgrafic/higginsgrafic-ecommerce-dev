// TEMPORAL — no es comiteja. A2: el bloc de fletxes de les dues pagines (fons,
// posicio dels chevrons i la icona).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const info = (arrel, nom) => {
    const ancor = arrel.querySelector('#stripe-guide-right-anchor');
    if (!ancor) return { nom, hi: false };
    const q = ancor.getBoundingClientRect();
    const cs = getComputedStyle(ancor);
    const chev = [...ancor.querySelectorAll('svg')].map((s) => {
      const c = s.getBoundingClientRect();
      return { cy: +(c.top + c.height / 2).toFixed(1), cx: +(c.left + c.width / 2).toFixed(1), w: +c.width.toFixed(1), h: +c.height.toFixed(1) };
    });
    const prev = ancor.querySelector('button[aria-label="Anterior"]')?.getBoundingClientRect();
    const next = ancor.querySelector('button[aria-label="Següent"]')?.getBoundingClientRect();
    return {
      nom,
      hi: true,
      caixa: { x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1) },
      centreCaixa: +(q.top + q.height / 2).toFixed(1),
      bg: cs.backgroundColor,
      chevrons: chev,
      meitatPrev: prev ? { cy: +(prev.top + prev.height / 2).toFixed(1) } : null,
      meitatNext: next ? { cy: +(next.top + next.height / 2).toFixed(1) } : null,
      desviament: chev.map((c, i) => {
        const mig = i === 0 ? (prev.top + prev.height / 2) : (next.top + next.height / 2);
        return +(c.cy - mig).toFixed(1);
      }),
    };
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return [info(v1, 'pagina 1'), info(v2, 'pagina 2')];
});
console.log(JSON.stringify(r, null, 1));
await p.screenshot({ path: '_tmp-a2-abans.png', clip: { x: 1420, y: 240, width: 340, height: 180 } });
console.log('desat _tmp-a2-abans.png (p2 fletxes)');
await ctx.close();
await b.close();
