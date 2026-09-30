// TEMPORAL: captura la taula de la p2 amb PEMBERLEY activa (una sola samarreta).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const i = await p.evaluate(() => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
  .findIndex((x) => x.textContent.trim().toUpperCase().startsWith('PEMBERLEY')));
await p.evaluate((j) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[j].click(), i);
await p.waitForTimeout(1500);
await (await p.$('[data-taula-vertical="2"]')).screenshot({ path: '_tmp-pemberley-centrat.png' });
console.log('desat _tmp-pemberley-centrat.png');
await b.close();
