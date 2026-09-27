// TEMPORAL — la mascara del contenidor de la franja i el vel, a les dues pagines.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const res = {};
  for (const pag of ['1', '2']) {
    const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
    const franja = v.querySelector(`[data-stripe-visual-content="${pag}"]`);
    if (!franja) { res[`p${pag}`] = 'sense franja'; continue; }
    const info = [];
    let el = franja;
    for (let k = 0; k < 4 && el; k++) {
      const cs = getComputedStyle(el);
      info.push({
        nivell: k,
        tag: el.tagName,
        clase: String(el.className || '').slice(0, 40),
        maskImage: (cs.maskImage || cs.webkitMaskImage || 'none').slice(0, 120),
        maskSize: cs.maskSize || cs.webkitMaskSize,
        maskMode: cs.maskMode || cs.webkitMaskMode,
        maskPosition: cs.maskPosition,
      });
      el = el.parentElement;
    }
    const imgs = [...franja.querySelectorAll('img')].map((i) => (i.getAttribute('src') || '').slice(0, 60));
    // el svg del vel de la vista vertical (paths)
    const svgPaths = franja.querySelectorAll('svg path.tshirt-outline').length;
    res[`p${pag}`] = { info, imgs, svgPaths };
  }
  return res;
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
