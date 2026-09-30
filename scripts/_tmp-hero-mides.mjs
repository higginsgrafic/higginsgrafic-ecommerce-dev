import { chromium } from '@playwright/test';
const VISTES = [[1920, 946], [1440, 900], [1366, 768], [1280, 720], [1200, 800], [1180, 820], [1024, 768]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(6000);
    const r = await p.evaluate(() => {
      const caixa = document.querySelector('[data-hero-caixa="1"]');
      const carril = caixa ? caixa.closest('.hg-carril') : null;
      const bloc = carril ? carril : null;
      if (!caixa) return null;
      const c = caixa.getBoundingClientRect();
      const k = bloc ? bloc.getBoundingClientRect() : null;
      return {
        caixa: { x: +c.left.toFixed(1), w: +c.width.toFixed(1), h: +c.height.toFixed(1) },
        carril: k ? { x: +k.left.toFixed(1), w: +k.width.toFixed(1) } : null,
        padding: bloc ? getComputedStyle(bloc).paddingLeft : null,
        fraccio: k ? +(c.width / k.width).toFixed(4) : null,
      };
    });
    console.log(`${w}x${h}`, JSON.stringify(r));
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0].slice(0, 60)}`); } finally { await ctx.close(); }
}
await b.close();
