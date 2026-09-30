import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w, h] of [[1200, 800], [1280, 586], [1280, 720], [1300, 800], [1340, 800], [1366, 600], [1366, 768], [1440, 900], [1920, 1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 70)));
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(6000);
  const d = await p.evaluate(() => {
    const c2 = document.querySelector('[data-cella="2"]');
    const heroi = c2 ? c2.firstElementChild : null;
    return { fi: heroi ? Math.round(heroi.getBoundingClientRect().bottom) : null, f: window.innerHeight, pad: c2 ? getComputedStyle(c2).paddingBlockEnd : '-' };
  });
  console.log(`${String(w).padStart(4)}x${h}: aire=${d.fi != null ? d.f - d.fi : '-'}px (coixi ${d.pad}) ${errors.length ? 'ERRORS ' + errors[0] : ''}`);
  await p.close();
}
await b.close();
