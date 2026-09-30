// TEMPORAL — la caixa del selector B/C/N i el topall amb la franja de colleccions.
import { chromium } from '@playwright/test';
const VISTES = [[1920, 946], [1680, 1050], [1512, 982], [1440, 900], [1366, 768], [1280, 720], [1024, 768]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(8000);
    const r = await p.evaluate(() => {
      const box = (el) => { const x = el.getBoundingClientRect(); return { t: +x.top.toFixed(1), b: +(x.top + x.height).toFixed(1), l: +x.left.toFixed(1), r: +x.right.toFixed(1) }; };
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      // La caixa visible del B/C/N: el primer avantpassat del boto BLANC amb vora.
      const blanc = [...v2.querySelectorAll('button')].find((b) => (b.textContent || '').trim().toUpperCase() === 'BLANC');
      let el = blanc, caixa = null;
      while (el && el !== v2) {
        const cs = getComputedStyle(el);
        if (parseFloat(cs.borderTopWidth) > 0 && el.getBoundingClientRect().width > 40) { caixa = el; break; }
        el = el.parentElement;
      }
      const franja = v2.querySelector('[data-colleccions-franja="1"]');
      return { blanc: blanc ? box(blanc) : null, caixa: caixa ? box(caixa) : null, franja: franja ? box(franja) : null };
    });
    const solapament = r.caixa && r.franja ? (r.caixa.b - r.franja.t).toFixed(1) : 'n/a';
    const marge = r.caixa && r.franja ? (r.franja.t - r.caixa.b).toFixed(1) : 'n/a';
    console.log(`${w}x${h}  B/C/N caixa ${JSON.stringify(r.caixa)}  franja ${JSON.stringify(r.franja)}  -> solapament ${solapament} px, marge ${marge} px`);
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0]}`); } finally { await ctx.close(); }
}
await b.close();
