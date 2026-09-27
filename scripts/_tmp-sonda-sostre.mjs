// TEMPORAL — no es comiteja. La branca d'alçada mossega?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1680, 900], [1440, 800], [1366, 768], [1280, 720], [2560, 1306]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2200);
  await p.click('svg.lucide-search').catch(() => {});
  await p.waitForTimeout(3000);
  const m = await p.evaluate(() => window.__hgSostre || []);
  for (const x of m) console.log(`${w}x${h} t=${String(x.t).padStart(5)} ample=${x.ample} sostre=${x.sostre} dalt=${x.dalt} -> amb sostre ${x.amb} (gapV ${x.gapV_amb}) | sense ${x.sense} (gapV ${x.gapV_sense})`);
  await p.close();
}
await b.close();
