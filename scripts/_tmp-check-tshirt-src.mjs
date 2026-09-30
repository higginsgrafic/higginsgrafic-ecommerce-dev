import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
const r = await p.evaluate(async () => {
  const { tshirtSrc, TSHIRT_COLORS } = await import('/src/utils/placeholders.js');
  const casos = [...TSHIRT_COLORS, 'purple', 'light-pink', 'kiwi', 'forest-green', 'cardinal-red', 'Light Pink', 'Dark Chocolate'];
  const out = [];
  for (const c of casos) {
    const u = tshirtSrc(c);
    const res = await fetch(u);
    out.push({ color: c, arxiu: u.split('/').pop(), estat: res.status });
  }
  return out;
});
for (const x of r) console.log(`  ${String(x.color).padEnd(16)} -> ${x.arxiu.padEnd(40)} ${x.estat}`);
console.log('fallades:', r.filter((x) => x.estat !== 200).length);
await b.close();
