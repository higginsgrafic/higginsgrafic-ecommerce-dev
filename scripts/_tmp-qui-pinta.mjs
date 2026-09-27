// TEMPORAL — no es comiteja. Qui pinta la samarreta visible? (vertical)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=miscellania', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const punts = [[200, 300], [260, 300], [330, 300], [200, 360], [500, 300]];
  return punts.map(([x, y]) => ({
    punt: `${x},${y}`,
    pila: document.elementsFromPoint(x, y).slice(0, 8).map((el) => {
      const cs = getComputedStyle(el);
      const rr = el.getBoundingClientRect();
      const attrs = [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `${a.name}=${String(a.value).slice(0, 22)}`).join(' ');
      return `${el.tagName}.${(el.className || '').toString().slice(0, 22)} [${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}] vis=${cs.visibility} op=${cs.opacity} z=${cs.zIndex} ${attrs}`;
    }),
  }));
});
for (const x of r) {
  console.log(`\n punt ${x.punt}`);
  for (const c of x.pila) console.log('   ', c);
}
await ctx.close();
await b.close();
