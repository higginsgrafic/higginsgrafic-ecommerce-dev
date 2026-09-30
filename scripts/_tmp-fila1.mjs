import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const fila = document.querySelector('[data-capcalera-fila="1"]');
  if (!fila) return null;
  const cs = getComputedStyle(fila);
  const q = fila.getBoundingClientRect();
  return {
    fila: [Math.round(q.left), Math.round(q.right)],
    justify: cs.justifyContent, gap: cs.columnGap,
    fills: [...fila.children].map((c) => { const x = c.getBoundingClientRect(); return `${c.tagName.toLowerCase()}.${(c.className || '').toString().slice(0, 18)}[${Math.round(x.left)}..${Math.round(x.right)}]`; }),
  };
});
console.log(`${w}x${h}`, JSON.stringify(r, null, 1));
await b.close();
