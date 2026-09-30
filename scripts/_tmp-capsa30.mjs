// TEMPORAL — a quines vistes hi caben 30 px (15 a dalt + 15 a baix) al bloc de la p2.
import { chromium } from '@playwright/test';
const VISTES = [[1366, 768], [1300, 800], [1280, 720], [1200, 800], [1180, 820], [1112, 834], [1024, 768], [1024, 768], [1366, 660], [1024, 600]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(3500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
    await p.waitForTimeout(9000);
    const r = await p.evaluate(() => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const panell = document.querySelector('[data-mega-panel-surface]');
      const bcn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
      const franja = v2.querySelector('[data-stripe-visual-content="2"]');
      if (!panell || !bcn || !franja) return null;
      const q = panell.getBoundingClientRect();
      const bloc = franja.getBoundingClientRect().bottom - bcn.getBoundingClientRect().top;
      return { panell: +q.height.toFixed(1), bloc: +bloc.toFixed(1), sobra: +(q.height - bloc).toFixed(1), visible: q.height > 0 };
    });
    if (!r) { console.log(`${w}x${h}  sense megaslide`); } else {
      console.log(`${w}x${h}  megaslide ${r.panell}  bloc ${r.bloc}  sobra ${r.sobra}  -> 30 px: ${r.sobra >= 30 ? 'SI que hi caben' : 'NO hi caben (' + (30 - r.sobra).toFixed(1) + ' px de menys)'}`);
    }
  } catch (e) {
    console.log(`${w}x${h}  ERROR ${e.message.split('\n')[0].slice(0, 60)}`);
  } finally { await ctx.close(); }
}
await b.close();
