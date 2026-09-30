// TEMPORAL: que hi ha de clicable DINS l'arrel del panell de franja (p2 vertical).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const cela = document.querySelector('[data-taula-cela="6-9+11-14"]');
  const arrel = cela.querySelector('.w-full.shrink-0');
  const out = [];
  arrel.querySelectorAll('*').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.pointerEvents === 'none') return;
    const teHandler = el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button';
    const esArea = !!el.getAttribute('data-clic-area') || el.hasAttribute('data-stripe-tile') || el.onclick !== null;
    if (!teHandler && !esArea && !el.className.toString().includes('cursor')) return;
    const rr = el.getBoundingClientRect();
    out.push({
      q: `${el.tagName}.${(el.className || '').toString().trim().split(/\s+/).slice(0, 3).join('.')}`,
      caixa: `${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}`,
      pe: cs.pointerEvents, z: cs.zIndex,
      atrs: [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name).join(','),
    });
  });
  return { total: out.length, out: out.slice(0, 25) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
