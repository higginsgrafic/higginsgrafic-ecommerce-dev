// TEMPORAL — no es comiteja. errors de consola en obrir la p2
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const msgs = [];
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') msgs.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
p.on('pageerror', (e) => msgs.push(`pageerror: ${String(e).slice(0, 300)}`));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
const te = await p.evaluate(() => ({ sonde: !!window.__HG_STRIP__, franja: !!document.querySelector('[data-stripe-visual-content="2"]'), nTile: document.querySelectorAll('[data-stripe-tile]').length }));
console.log('estat:', JSON.stringify(te));
for (const m of msgs.slice(0, 12)) console.log('  ', m);
await ctx.close();
await b.close();
