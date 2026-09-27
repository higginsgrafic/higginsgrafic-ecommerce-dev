import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
for (const url of ['/product/nx-01', '/product/afrodita', '/first-contact/nx-01', '/product/nx-01?color=white&variant=black']) {
  await p.goto('http://127.0.0.1:3003' + url, { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => {
    const t = document.body.innerText.slice(0, 300);
    return { notrobat: /no trobat/i.test(t), titol: (document.querySelector('h1')?.innerText || '').slice(0, 40) };
  });
  console.log(url, JSON.stringify(r));
}
await b.close();
