import { chromium } from '@playwright/test';
const VISTES = [[1024, 768], [1180, 820], [1366, 768], [1920, 946]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(6500);
    const r = await p.evaluate(() => {
      const c = document.querySelector('[data-hero-caixa="1"]');
      const t = c ? c.querySelector('p') : null;
      if (!t) return null;
      const cs = getComputedStyle(t);
      return { tracking: cs.letterSpacing, font: cs.fontSize, text: t.textContent.slice(0, 22) };
    });
    console.log(`${w}x${h}`, JSON.stringify(r));
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0].slice(0, 50)}`); } finally { await ctx.close(); }
}
await b.close();
