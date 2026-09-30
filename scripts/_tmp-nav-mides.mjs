import { chromium } from '@playwright/test';
const VISTES = [[1024, 768], [1180, 820], [1280, 720], [1366, 768], [1440, 900], [1920, 946]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(7000);
    const r = await p.evaluate(() => {
      const navs = [...document.querySelectorAll('nav')].filter((n) => n.querySelector('button') && n.textContent.toLowerCase().includes('first contact'));
      const nav = navs.find((n) => n.getBoundingClientRect().width > 0) || navs[0];
      if (!nav) return null;
      const items = [...nav.querySelectorAll('button')];
      const darrer = items[items.length - 1];
      const q = nav.getBoundingClientRect();
      const d = darrer.getBoundingClientRect();
      return {
        items: items.length,
        font: getComputedStyle(items[0]).fontSize,
        client: nav.clientWidth,
        scroll: nav.scrollWidth,
        capEn: nav.scrollWidth <= nav.clientWidth + 1,
        darrerTallat: d.right > q.right + 1,
        ultim: darrer.textContent.slice(0, 16),
      };
    });
    console.log(`${w}x${h}`, JSON.stringify(r));
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0].slice(0, 50)}`); } finally { await ctx.close(); }
}
await b.close();
