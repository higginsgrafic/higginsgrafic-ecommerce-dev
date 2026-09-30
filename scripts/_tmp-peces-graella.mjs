import { chromium } from '@playwright/test';
const VISTES = [[1024, 768], [1366, 768]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(4000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(9000);
  const r = await p.evaluate(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const graella = v1.querySelector('[data-graella-files-p1]');
    if (!graella) return null;
    const imgs = [...graella.querySelectorAll('img')].slice(0, 3).map((im) => { const q = im.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; });
    const q = graella.getBoundingClientRect();
    const fitxers = [...graella.querySelectorAll('*')].filter((el) => el.children.length === 0).slice(0, 3).map((el) => { const x = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()}[${Math.round(x.width)}x${Math.round(x.height)}]`; });
    return { graella: [Math.round(q.width), Math.round(q.height)], imgs, fitxers, nImgs: graella.querySelectorAll('img').length };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
