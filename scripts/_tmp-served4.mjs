import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 60000 });
const txt = await p.evaluate(async () => (await (await fetch('/src/components/megaslide/MegaslidePagina2.jsx')).text()));
const l = txt.split('\n');
l.forEach((x, i) => { if (/__hgInact|tiraFranja\.srcs\.length|stripeStrip\.srcs/.test(x)) console.log((i + 1) + ': ' + x.trim().slice(0, 110)); });
console.log('--- linies:', l.length);
await b.close();
