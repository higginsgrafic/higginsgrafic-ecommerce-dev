import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const ombra = document.querySelector('[data-maniga-ombra="1"]');
  const visual = document.querySelector('[data-stripe-visual-content="2"]');
  const tinta = [...visual.querySelectorAll('img')].find((i) => /stripe\.webp/.test(i.getAttribute('src') || ''));
  const pare = ombra.parentElement;
  const cs = getComputedStyle(pare);
  return {
    ombraPare: `${pare.tagName}.${String(pare.className).slice(0, 20)} z=${cs.zIndex} pos=${cs.position}`,
    ombraPareConteVisual: pare.contains(visual),
    ombraPareConteTinta: pare.contains(tinta),
    visualPare: (() => { const q = visual.parentElement; const c = getComputedStyle(q); return `${q.tagName}.${String(q.className).slice(0, 20)} z=${c.zIndex} pos=${c.position} iso=${c.isolation}`; })(),
    zOmbra: getComputedStyle(ombra).zIndex,
    zTinta: (() => { let e = tinta; const out = []; for (let k = 0; k < 4 && e; k++) { const c = getComputedStyle(e); out.push(`${e.tagName} z=${c.zIndex} pos=${c.position} iso=${c.isolation}`); e = e.parentElement; } return out; })(),
    pareContesVisualIombraAlhora: pare.contains(visual) && pare.contains(ombra),
    quantsZ4: document.querySelectorAll('div').length && [...document.querySelectorAll('div')].filter((d) => getComputedStyle(d).zIndex === '4').length,
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
