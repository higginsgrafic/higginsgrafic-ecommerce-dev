// TEMPORAL — la foto de conjunt de les vistes horitzontals.
import { chromium } from '@playwright/test';
const VISTES = [[1024, 768], [1180, 820], [1200, 800], [1280, 720], [1366, 768], [1440, 900], [1920, 946]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.message).slice(0, 80)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 80)); });
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(3500);
    const hero = await p.evaluate(() => {
      const c = document.querySelector('[data-hero-caixa="1"]');
      const k = c ? c.closest('.hg-carril') : null;
      if (!c || !k) return null;
      const a = c.getBoundingClientRect(); const q = k.getBoundingClientRect();
      return { w: +a.width.toFixed(1), f: +(a.width / q.width).toFixed(3), h: +a.height.toFixed(1) };
    });
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(9000);
    const r = await p.evaluate(() => {
      const v1 = document.querySelector('[data-mega-page-viewport="1"]');
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const panell = document.querySelector('[data-mega-panel-surface]');
      const bcn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
      const banda = v2.querySelector('[data-colleccions-franja="1"]');
      const stripe2 = v2.querySelector('[data-stripe-visual-content="2"]');
      const stripe1 = v1.querySelector('[data-stripe-visual-content="1"]');
      const bloc1 = v1.querySelector('[data-bloc-dreta-p1]');
      const fletxes1 = v1.querySelector('[data-fletxes-p1]');
      const sel1 = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
      const q = (el) => el.getBoundingClientRect();
      const rel1 = (el) => ({ x: +(q(el).left - q(v1).left).toFixed(1), y: +q(el).top.toFixed(1), w: +q(el).width.toFixed(1), h: +q(el).height.toFixed(1) });
      const rel2 = (el) => ({ x: +(q(el).left - q(v2).left).toFixed(1), y: +q(el).top.toFixed(1), w: +q(el).width.toFixed(1), h: +q(el).height.toFixed(1) });
      const p2 = q(panell);
      return {
        aireDalt: +(q(bcn).top - p2.top).toFixed(2),
        aireBaix: +((p2.top + p2.height) - (q(stripe2).top + q(stripe2).height)).toFixed(2),
        gap1: banda ? +(q(banda).top - (q(bcn).top + q(bcn).height)).toFixed(2) : null,
        gap2: banda ? +(q(stripe2).top - (q(banda).top + q(banda).height)).toFixed(2) : null,
        f1: rel1(stripe1), f2: rel2(stripe2),
        bloc1: rel1(bloc1), fletxes1: rel1(fletxes1), sel1: rel1(sel1),
      };
    });
    const df = { x: +(r.f2.x - r.f1.x).toFixed(1), y: +(r.f2.y - r.f1.y).toFixed(1), w: +(r.f2.w - r.f1.w).toFixed(1), h: +(r.f2.h - r.f1.h).toFixed(1) };
    const col = r.fletxes1.w < r.bloc1.w - 1 ? 'columnes' : 'apilats';
    console.log(`${w}x${h}  hero ${hero ? hero.w : '?'}(${hero ? hero.f : '?'})  aire ${r.aireDalt}/${r.aireBaix}  gaps ${r.gap1}/${r.gap2}  stripe p1-p2 dx${df.x} dy${df.y} dw${df.w} dh${df.h}  bloc ${r.bloc1.w}x${r.bloc1.h} ${col}  errors=${errs.length}`);
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0].slice(0, 60)}`);
  } finally { await ctx.close(); }
}
await b.close();
