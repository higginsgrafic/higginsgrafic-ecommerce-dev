// TEMPORAL: on son els enllacos de colleccio a la vista ampla.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('*').forEach((el) => {
    const t = (el.textContent || '').trim().toUpperCase();
    if (!t.startsWith('LOOKING FOR MY')) return;
    if (el.children.length > 1) return;
    const r = el.getBoundingClientRect();
    if (r.width < 5) return;
    const cadena = [];
    let x = el;
    while (x && x !== document.body && cadena.length < 8) {
      const marques = [...x.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `${a.name}=${a.value.slice(0, 20)}`);
      cadena.push(`${x.tagName}${marques.length ? `[${marques.join(' ')}]` : ''}`);
      x = x.parentElement;
    }
    out.push({ tag: el.tagName, text: t.slice(0, 26), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), clickable: el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick !== null, cadena: cadena.join(' < ') });
  });
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
