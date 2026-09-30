import { chromium } from '@playwright/test';
const VISTES = [[1024, 768], [1180, 820], [1366, 768], [1920, 946]];
const b = await chromium.launch();
for (const [w, h] of VISTES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  try {
    await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
    await p.waitForTimeout(7000);
    const r = await p.evaluate(() => {
      const navs = [...document.querySelectorAll('nav')].filter((n) => n.querySelector('button') && n.textContent.toLowerCase().includes('first contact'));
      return navs.map((n) => { const q = n.getBoundingClientRect(); const cs = getComputedStyle(n); return { visible: q.width > 0 && q.height > 0 && cs.display !== 'none', y: Math.round(q.top), x: Math.round(q.left), w: Math.round(q.width), scroll: n.scrollWidth, client: n.clientWidth, overflowX: cs.overflowX, font: n.firstElementChild ? getComputedStyle(n.firstElementChild).fontSize : null }; });
    });
    const caixa = await p.evaluate(() => {
      const n = [...document.querySelectorAll('nav')].find((x) => x.getBoundingClientRect().width > 0 && x.textContent.toLowerCase().includes('first contact'));
      if (!n) return null;
      const pare = n.parentElement.getBoundingClientRect();
      const fills = [...n.children].map((c) => { const q = c.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.right)]; });
      return { navW: Math.round(n.getBoundingClientRect().width), pareW: Math.round(pare.width), primer: fills[0], ultim: fills[fills.length - 1], capa: n.scrollWidth <= n.clientWidth + 1 };
    });
    console.log(`${w}x${h}`, JSON.stringify(caixa), JSON.stringify(r.map((x) => `${x.visible ? 'vis' : 'oculta'} y${x.y} w${x.w} font${x.font}`)));
  } catch (e) { console.log(`${w}x${h} ERROR ${e.message.split('\n')[0].slice(0, 50)}`); } finally { await ctx.close(); }
}
await b.close();
