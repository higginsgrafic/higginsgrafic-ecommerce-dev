// TEMPORAL — no es comiteja. Quantes pastilles grises hi ha i quina es l'activa?
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => [...document.querySelectorAll('[data-colleccions-targeta]')].map((x) => ({
  text: (x.textContent || '').trim(),
  fons: getComputedStyle(x).backgroundColor,
  pes: getComputedStyle(x).fontWeight,
})));
console.log('pastilles:', r.length);
for (const x of r) console.log(`  ${x.text.padEnd(18)} fons=${x.fons.padEnd(20)} pes=${x.pes}`);
const ambFons = r.filter((x) => x.fons !== 'rgba(0, 0, 0, 0)' && x.fons !== 'transparent').length;
console.log('AMB fons gris:', ambFons, '(hauria de ser 1)');
fs.mkdirSync('/tmp/hg-captures', { recursive: true });
await p.screenshot({ path: '/tmp/hg-captures/pastilles.png', clip: { x: 1380, y: 70, width: 200, height: 140 } });
await b.close();
