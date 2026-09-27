// TEMPORAL — no es comiteja. Desa els fotogrames pintats de la carrega per poder-los mirar.
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const cdp0 = await ctx.newCDPSession(await ctx.newPage());
await cdp0.send('Page.enable');
const p = (await ctx.pages())[0];
await p.goto('about:blank');

const frames = [];
cdp0.on('Page.screencastFrame', async (f) => {
  frames.push({ t: Math.round((f.metadata?.timestamp ?? 0) * 1000), data: f.data });
  try { await cdp0.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch { /* ignore */ }
});
await cdp0.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'domcontentloaded', timeout: 180000 });
await p.waitForTimeout(4000);
await cdp0.send('Page.stopScreencast');
const t0 = frames.length ? frames[0].t : 0;
const rel = frames.map((f, i) => ({ i, dt: f.t - t0, data: f.data }));
// desa els que cauen dins el primer segon i mig
const triats = rel.filter((x) => x.dt > 0 && x.dt < 2600);
console.log(`fotogrames totals ${frames.length}; triats ${triats.length}`);
let n = 0;
for (const x of triats) {
  const nom = `scripts/_tmp-frame-${String(n).padStart(2, '0')}-${x.dt}ms.png`;
  fs.writeFileSync(nom, await sharp(Buffer.from(x.data, 'base64')).png().toBuffer());
  console.log(`  ${nom}`);
  n += 1;
}
await b.close();
