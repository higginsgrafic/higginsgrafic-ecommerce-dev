// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 3 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const t = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'CUBE') || null);
const bb = await t.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(1800);
fs.mkdirSync('/tmp/hg-captures', { recursive: true });
await p.screenshot({ path: '/tmp/hg-captures/selector-cube.png', clip: { x: 372, y: 66, width: 90, height: 150 } });
console.log('captura feta');
await b.close();
