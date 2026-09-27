import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 60000 });
const txt = await p.evaluate(async () => (await (await fetch('/src/components/megaslide/MegaslidePagina2.jsx')).text()));
const l = txt.split('\n');
for (let n = 262; n <= 285; n++) console.log(n + ': ' + (l[n - 1] || '').trim().slice(0, 140));
await b.close();
