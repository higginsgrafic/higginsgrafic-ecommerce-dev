// TEMPORAL — no es comita. Captura de la pagina 2 del megaslide.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const [w, h] = [1920, 946];
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const nom = process.argv[2] || 'abans';
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(5000);
await p.screenshot({ path: `/tmp/p2-${nom}-dalt.png`, clip: { x: 300, y: 60, width: 1250, height: 320 } });
await b.close();
