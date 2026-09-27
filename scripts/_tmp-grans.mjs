// TEMPORAL — no es comiteja. A la PDP d'un marc, quina imatge es pinta i de
// quina mida? I d'on surt (fitxer)?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
for (const url of ['/austen/looking-for-my-darcy-yellow-blue-frame', '/austen/looking-for-my-darcy-pink-yellow-frame']) {
  await p.goto('http://127.0.0.1:3003' + url, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => [...document.querySelectorAll('img')]
    .map((i) => { const bb = i.getBoundingClientRect(); return { src: (i.currentSrc || '').split('/').slice(-2).join('/'), w: Math.round(bb.width), h: Math.round(bb.height), natural: `${i.naturalWidth}x${i.naturalHeight}` }; })
    .filter((x) => x.w > 150)
    .sort((a, b2) => b2.w * b2.h - a.w * a.h)
    .slice(0, 6));
  console.log('---', url);
  for (const x of r) console.log(`   ${String(x.w + 'x' + x.h).padEnd(11)} natural=${String(x.natural).padEnd(10)} ${x.src}`);
}
await b.close();
