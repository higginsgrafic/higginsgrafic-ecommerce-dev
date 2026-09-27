import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1366, 768], [1024, 768], [2560, 1306]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const r = await p.evaluate(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const dx1 = -v1.getBoundingClientRect().left, dx2 = -v2.getBoundingClientRect().left;
    const bx = (el, dx) => { if (!el) return null; const q = el.getBoundingClientRect(); return { x: +(q.left + dx).toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1), r: +(q.right + dx).toFixed(1), b: +q.bottom.toFixed(1) }; };
    const carr1 = v1.querySelector('[data-carrusel="1"]');
    const bloc1 = v1.querySelector('[data-bloc-dreta-p1="1"]');
    const fl1 = v1.querySelector('[data-fletxes-p1="1"]');
    const fr1 = v1.querySelector('[data-stripe-visual-content="1"]');
    const fr2 = v2.querySelector('[data-stripe-visual-content="2"]');
    const peces1 = carr1 ? [...carr1.querySelectorAll('[title]')].slice(0, 2).map((x) => { const q = x.getBoundingClientRect(); return +(q.width).toFixed(2); }) : [];
    const fila2 = (() => { const c = v2.querySelector('[data-carrusel="1"]'); const t = c?.firstElementChild?.firstElementChild; const ps = [...(t?.querySelectorAll('button') || [])].map((x) => { const q = x.getBoundingClientRect(); return +(q.top + q.height / 2).toFixed(1); }); return [...new Set(ps)].slice(0, 2); })();
    return {
      carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
      p1graella: carr1 ? bx(carr1, dx1) : null,
      p1bloc: bloc1 ? bx(bloc1, dx1) : null,
      p1fletxes: fl1 ? bx(fl1, dx1) : null,
      p1franja: fr1 ? bx(fr1, dx1) : null,
      p2franja: fr2 ? bx(fr2, dx2) : null,
      peces1,
      fila2,
      gapP1: (carr1 && bloc1) ? +(bx(bloc1, dx1).x - bx(carr1, dx1).r).toFixed(1) : null,
      desborda: document.documentElement.scrollHeight > document.documentElement.clientHeight + 2,
    };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
