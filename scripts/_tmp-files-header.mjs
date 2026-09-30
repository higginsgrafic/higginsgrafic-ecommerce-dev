import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const files = [...document.querySelectorAll('[data-capcalera-fila="1"]')].map((el) => {
    const q = el.getBoundingClientRect();
    return { x: Math.round(q.left), b: Math.round(q.right), w: Math.round(q.width), visible: q.width > 0 && q.height > 0, z: getComputedStyle(el).zIndex };
  });
  const nav2 = [...document.querySelectorAll('nav')].filter((n) => n.textContent.toLowerCase().includes('first contact') && n.getBoundingClientRect().width > 0).map((n) => { const q = n.getBoundingClientRect(); return { x: Math.round(q.left), b: Math.round(q.right), w: Math.round(q.width) }; });
  return { files, nav2 };
});
console.log(`${w}x${h}`, JSON.stringify(r));
await b.close();
