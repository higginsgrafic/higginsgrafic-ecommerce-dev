import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [2560, 1306], [1512, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(1500);
  const abans = await p.evaluate(() => ({ win: window.innerWidth, doc: document.documentElement.clientWidth, body: document.body.clientWidth }));
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(3000);
  const despres = await p.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      win: window.innerWidth, doc: document.documentElement.clientWidth, body: document.body.clientWidth,
      carril: Number.parseFloat(cs.getPropertyValue('--hg-mega-w')) || null,
      escala: Number.parseFloat(cs.getPropertyValue('--hg-escala-mega')) || null,
      carrilDeBody: Math.round(document.body.clientWidth * 3 / 5),
    };
  });
  console.log(`${w}x${h} | tancat win=${abans.win} doc=${abans.doc} body=${abans.body} | obert win=${despres.win} doc=${despres.doc} body=${despres.body} | carril=${despres.carril} escala=${despres.escala} (body*3/5=${despres.carrilDeBody})`);
  await ctx.close();
}
await b.close();
