// TEMPORAL — no es comiteja. Rafega de captures durant l'obertura del panell.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4500);
const clic = await p.evaluate(() => {
  const bot = [...document.querySelectorAll('button')].filter((b) => b.querySelector('svg.lucide-search')).map((b) => b.getBoundingClientRect()).find((x) => x.top < 60);
  return bot ? [bot.x + bot.width / 2, bot.y + bot.height / 2] : null;
});
await p.mouse.click(clic[0], clic[1]);
const t0 = performance.now();
const feina = [];
for (let i = 0; i < 22; i++) {
  feina.push(p.screenshot({ path: `scripts/_tmp-rafega/f${String(i).padStart(2, '0')}.jpg`, clip: { x: 0, y: 0, width: 1920, height: 700 }, quality: 55, type: 'jpeg' }).then(() => performance.now() - t0));
  await new Promise((r) => setTimeout(r, 55));
}
const temps = await Promise.all(feina);
console.log('captures (ms des del clic):', temps.map((t) => Math.round(t)).join(', '));
await b.close();
