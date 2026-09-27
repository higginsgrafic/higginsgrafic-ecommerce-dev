// TEMPORAL — no es comiteja. Les caixes de les 14 siluetes del full del vel.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
const r = await p.evaluate(async () => {
  const text = await (await fetch('/placeholders/cercador/full-clic-area-5.svg')).text();
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const paths = [...doc.querySelectorAll('.tshirt-outline')];
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-99999px;top:0;';
  document.body.appendChild(host);
  const svg = document.importNode(doc.documentElement, true);
  host.appendChild(svg);
  const out = [...svg.querySelectorAll('.tshirt-outline')].map((el) => {
    const bb = el.getBBox();
    return { x: +bb.x.toFixed(2), y: +bb.y.toFixed(2), w: +bb.width.toFixed(2), h: +bb.height.toFixed(2), cx: +(bb.x + bb.width / 2).toFixed(2), cy: +(bb.y + bb.height / 2).toFixed(2) };
  });
  host.remove();
  return { n: paths.length, out };
});
console.log('paths:', r.n);
for (const [i, x] of r.out.entries()) console.log(`  ${i}: x${x.x} y${x.y} w${x.w} h${x.h} centre ${x.cx},${x.cy}`);
await b.close();
