import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2200);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
const d = await p.evaluate(() => {
  const fila = document.querySelector('[data-p2-cercador-row]');
  const v = document.querySelector('[data-mega-page-viewport="2"]').getBoundingClientRect().top;
  const desc = (el) => {
    const b2 = el.getBoundingClientRect();
    return `${el.tagName.toLowerCase()}${el.dataset && Object.keys(el.dataset).length ? '[' + Object.keys(el.dataset).join(',') + ']' : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''} top=${(b2.top - v).toFixed(2)} h=${b2.height.toFixed(2)} x=${b2.left.toFixed(0)} w=${b2.width.toFixed(0)} "${(el.textContent || '').trim().slice(0, 22).replace(/\s+/g, ' ')}"`;
  };
  const arr = [];
  [...fila.children].forEach((c, i) => {
    arr.push(`fill ${i}: ${desc(c)}`);
    [...c.children].slice(0, 6).forEach((g, j) => arr.push(`    ${i}.${j}: ${desc(g)}`));
  });
  const botons = [...fila.querySelectorAll('button')].slice(0, 26).map((x) => `  boto "${(x.textContent || '').trim().slice(0, 20)}" top=${(x.getBoundingClientRect().top - v).toFixed(2)}`);
  return { arr, botons };
});
console.log(d.arr.join('\n'));
console.log('botons de la filera:'); console.log(d.botons.join('\n'));
await b.close();
