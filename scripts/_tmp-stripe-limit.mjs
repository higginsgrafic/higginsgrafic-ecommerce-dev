// TEMPORAL — on cau la vora de baix de la franja respecte el limit del megaslide.
import { chromium } from '@playwright/test';

const MIDA = process.argv[2] || 'desktop';
const VISTES = {
  desktop: [[1920, 946], [1680, 1050], [1512, 982], [1440, 900], [1400, 900], [1366, 768], [1300, 800], [1280, 720], [1200, 800]],
  tauleta: [[1024, 768], [768, 1024], [820, 1180], [1112, 834]],
}[MIDA];

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
      const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [ +x.top.toFixed(1), +(x.top + x.height).toFixed(1) ]; };
      const panel = document.querySelector('[data-mega-panel-surface]');
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const v1 = document.querySelector('[data-mega-page-viewport="1"]');
      const f2 = v2?.querySelector('[data-stripe-visual-content="2"]');
      const f1 = v1?.querySelector('[data-stripe-visual-content="1"]');
      const pb = box(panel);
      const b2 = box(f2), b1 = box(f1);
      // El dibuix de dins de la franja (la imatge o la ultima casa amb tinta)
      const cases = f2 ? [...f2.querySelectorAll('[data-stripe-tile]')].map((c) => box(c)).filter(Boolean) : [];
      const baixDibuix = cases.length ? Math.max(...cases.map((c) => c[1])) : null;
      return {
        panelBaix: pb && pb[1],
        p2Franja: b2, p1Franja: b1, baixDibuix,
        p2VoraDreta: v2 ? box(v2) : null,
      };
    });
    const aire2 = r.p2Franja ? (r.panelBaix - r.p2Franja[1]).toFixed(1) : 'n/a';
    const aire1 = r.p1Franja ? (r.panelBaix - r.p1Franja[1]).toFixed(1) : 'n/a';
    console.log(`${w}x${h}  panelBaix=${r.panelBaix}  p2 franja=${JSON.stringify(r.p2Franja)} aire=${aire2}  |  p1 aire=${aire1}  dibuixBaix=${r.baixDibuix}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
