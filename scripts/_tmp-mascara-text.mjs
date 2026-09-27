// TEMPORAL — la mascara del contenidor de la franja (p1 i p2): desa el text i
// diu quantes siluetes van a cada opacitat.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const ACT = process.argv[2] || 'first_contact';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${ACT}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const out = await p.evaluate(() => {
  const res = {};
  for (const pag of ['1', '2']) {
    const v = document.querySelector(`[data-mega-page-viewport="${pag}"]`);
    const franja = v.querySelector(`[data-stripe-visual-content="${pag}"]`);
    if (!franja) { res[pag] = null; continue; }
    // l'element amb mascara
    let el = null;
    for (const e of [franja, ...franja.querySelectorAll('*')]) {
      const cs = getComputedStyle(e);
      const m = cs.maskImage || cs.webkitMaskImage || 'none';
      if (m && m !== 'none') { el = e; break; }
    }
    if (!el) { res[pag] = { mascara: null }; continue; }
    const m = getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage;
    const esData = m.includes('data:image/svg+xml');
    let text = null;
    if (esData) {
      const url = m.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      text = decodeURIComponent(url.replace(/^data:image\/svg\+xml,/, ''));
    }
    res[pag] = {
      mascara: m.slice(0, 60),
      esData,
      opacitats: text ? (text.match(/fill-opacity="[^"]*"/g) || []).reduce((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {}) : null,
      paths: text ? (text.match(/<path/g) || []).length : null,
      text,
    };
  }
  return res;
});
for (const pag of ['1', '2']) {
  const r = out[pag];
  console.log(`p${pag}`, JSON.stringify({ mascara: r?.mascara, esData: r?.esData, opacitats: r?.opacitats, paths: r?.paths }));
  if (r?.text) writeFileSync(`_tmp-mascara-p${pag}.svg`, r.text.replace(/></g, '>\n<'));
}
await ctx.close(); await b.close();
