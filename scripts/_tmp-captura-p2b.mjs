// TEMPORAL — no es comiteja. Captura de la pagina 2 abans i despres de clicar
// una colleccio, i tambe el retall de la franja. Per veure que vol dir
// «centrar a dalt i a baix».
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);

fs.mkdirSync('/tmp/hg-captures', { recursive: true });
await p.screenshot({ path: '/tmp/hg-captures/p2-first-contact.png' });
await p.screenshot({ path: '/tmp/hg-captures/franja-first-contact.png', clip: { x: 300, y: 180, width: 1200, height: 220 } });

const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => /CUBE/i.test(x.textContent || '')) || null);
if (card.asElement()) {
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/hg-captures/p2-cube.png' });
  await p.screenshot({ path: '/tmp/hg-captures/franja-cube.png', clip: { x: 300, y: 180, width: 1200, height: 220 } });
  console.log('captures fetes');
} else {
  console.log('targeta CUBE no trobada');
}
await b.close();
