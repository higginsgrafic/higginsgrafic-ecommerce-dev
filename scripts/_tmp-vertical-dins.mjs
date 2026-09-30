// TEMPORAL: d'on surt el 1,285 de la franja vertical.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
const COMMITS = [['e479d2fa', '23/09'], ['HEAD', 'ara']];
const git = (...a) => execFileSync('git', a, { stdio: 'pipe' });
for (const [s, d] of [['src/components/home/MarcInici.jsx', '.git/dsh-a'], ['public/browser-overlay.html', '.git/dsh-b']]) if (existsSync(s)) copyFileSync(s, d);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const out = {};
let p;
try {
  for (const [c, q] of COMMITS) {
    git('checkout', c, '--', 'src');
    p = await ctx.newPage();
    for (let i = 0; i < 2; i += 1) {
      await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
      await p.waitForTimeout(5000);
      await p.click('button:has(svg.lucide-search)').catch(() => {});
      await p.waitForTimeout(9000);
      const te = await p.evaluate(() => !!document.querySelector('[data-taula-vertical="1"]'));
      if (te) break;
      await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(9000);
    }
    out[q] = await p.evaluate(() => {
      const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; };
      const arrel = document.documentElement;
      const cs = getComputedStyle(arrel);
      const cont = document.querySelector('[data-megaslide-taula="1"] [data-stripe-visual-content="1"]');
      const pare = cont?.parentElement;
      const avi = pare?.parentElement;
      const img = cont ? [...cont.querySelectorAll('img')].map((i) => ({ src: (i.getAttribute('src') || '').split('/').pop(), nw: i.naturalWidth, nh: i.naturalHeight })) : [];
      return {
        megaStripeScale: cs.getPropertyValue('--megaStripeScale'),
        cont: R(cont),
        contTransform: cont ? getComputedStyle(cont).transform : null,
        contHeightCss: cont ? getComputedStyle(cont).height : null,
        pare: R(pare), pareAlt: pare ? getComputedStyle(pare).height : null,
        avi: R(avi), aviAlt: avi ? getComputedStyle(avi).height : null,
        imgs: img,
      };
    });
    await p.close();
  }
} finally {
  git('checkout', 'HEAD', '--', 'src'); git('reset', '--hard', 'HEAD');
  if (existsSync('.git/dsh-a')) copyFileSync('.git/dsh-a', 'src/components/home/MarcInici.jsx');
  if (existsSync('.git/dsh-b')) copyFileSync('.git/dsh-b', 'public/browser-overlay.html');
  for (const f of ['.git/dsh-a', '.git/dsh-b']) try { execFileSync('rm', ['-f', f]); } catch { /* ignore */ }
  await ctx.close(); await b.close();
}
console.log(JSON.stringify(out, null, 1));
