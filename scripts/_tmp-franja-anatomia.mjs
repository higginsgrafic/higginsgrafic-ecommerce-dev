// TEMPORAL — anatomia vertical de les dues franges (p1 i p2).
import { chromium } from '@playwright/test';

const VISTES = [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1200, 800], [1112, 834], [1024, 768]];

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
      const box = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { top: +x.top.toFixed(1), bottom: +(x.top + x.height).toFixed(1), h: +x.height.toFixed(1) }; };
      const panel = document.querySelector('[data-mega-panel-surface]');
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const v1 = document.querySelector('[data-mega-page-viewport="1"]');
      const f1 = v1?.querySelector('[data-stripe-visual-content="1"]');
      const f2 = v2?.querySelector('[data-stripe-visual-content="2"]');
      const g1 = v1?.querySelector('[data-carrusel="1"]');
      const g2 = v2?.querySelector('[data-carrusel="1"]');
      const cs = getComputedStyle(document.documentElement);
      return {
        ample: window.innerWidth, alt: window.innerHeight,
        carril: cs.getPropertyValue('--hg-mega-w').trim(),
        escala: cs.getPropertyValue('--hg-escala-mega').trim(),
        panel: box(panel), v1: box(v1), v2: box(v2),
        f1: box(f1), f2: box(f2), g1: box(g1), g2: box(g2),
      };
    });
    console.log(`${w}x${h} carril=${r.carril} escala=${r.escala}`);
    console.log(`   panel ${JSON.stringify(r.panel)}  v1 ${JSON.stringify(r.v1)}  v2 ${JSON.stringify(r.v2)}`);
    console.log(`   f1 ${JSON.stringify(r.f1)}  f2 ${JSON.stringify(r.f2)}  | g1 ${JSON.stringify(r.g1)} g2 ${JSON.stringify(r.g2)}`);
    console.log(`   panel-f1b=${(r.panel.bottom - r.f1.bottom).toFixed(1)} panel-f2b=${(r.panel.bottom - r.f2.bottom).toFixed(1)} f1b-f2b=${(r.f1.bottom - r.f2.bottom).toFixed(1)} f1top-f2top=${(r.f1.top - r.f2.top).toFixed(1)}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await b.close();
