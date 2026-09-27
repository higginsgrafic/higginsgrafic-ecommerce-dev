import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 60000 });
const txt = await p.evaluate(async () => {
  const r = await fetch('/src/components/megaslide/MegaslidePagina2.jsx');
  return await r.text();
});
const l = txt.split('\n');
console.log('linies servides:', l.length);
for (const n of [313, 315, 316, 317, 318, 319]) console.log(n + ': ' + (l[n - 1] || '').trim().slice(0, 130));
await b.close();
