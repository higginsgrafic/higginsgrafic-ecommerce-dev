import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
for (const url of ['/first-contact/nx-01?color=white&variant=black', '/the-human-inside/afrodita?color=white&variant=black', '/cube/robocube?color=white&variant=black', '/noexisteix/foo']) {
  await p.goto('http://127.0.0.1:3003' + url, { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({
    url: location.pathname,
    notfound: /404|no trobat|not found|no s'ha trobat/i.test(document.body.innerText.slice(0, 500)),
    pdp: !!document.querySelector('[data-pdp], [data-product-detail], h1'),
    titol: (document.querySelector('h1')?.innerText || '').slice(0, 40),
  }));
  console.log(url, '->', JSON.stringify(r));
}
await b.close();
