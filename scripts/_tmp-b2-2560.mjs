import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w,h] of [[1920,946],[2560,1306]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const r = await p.evaluate(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const carr = v1.querySelector('[data-carrusel="1"]');
    const tira = carr?.firstElementChild?.firstElementChild;
    const ps = [...(tira?.querySelectorAll('button') || [])].slice(0, 4).map((x) => { const q = x.getBoundingClientRect(); return { w: +q.width.toFixed(2), x: +q.left.toFixed(1), st: (x.getAttribute('style') || '').match(/left: ([^;]+)/)?.[1] }; });
    return { carrW: +carr.getBoundingClientRect().width.toFixed(1), escala: getComputedStyle(document.documentElement).getPropertyValue('--hg-escala-mega').trim(), peces: ps, innerTira: (tira?.getAttribute('style')||'').slice(0,120) };
  });
  console.log(w, JSON.stringify(r));
  await ctx.close();
}
await b.close();
