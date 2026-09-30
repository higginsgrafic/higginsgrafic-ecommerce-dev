// TEMPORAL (28/09/2026): QUAN es va trencar la vista vertical del megaslide.
//
// Renderitza la vertical (768x1024) en una llista de commits i desa una captura
// de la p1 i de la p2 de cada un. Serveix per trobar el commit exacte on la
// franja de la p1 va esclatar, en comptes d'endevinar-ho.
//
// Canvia `src/` temporalment: al final SEMPRE el restaura de HEAD i torna a
// posar la feina sense cometre que hi havia (la copia de `.git/`).
//
// Us: node scripts/_tmp-vertical-quan.mjs
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const COMMITS = [
  ['264c65c1', '21/09 09:16 mati'],
  ['a147e8d7', '21/09 17:00 vespre 1'],
  ['b2a15f0d', '21/09 20:26 vespre 2'],
  ['HEAD', 'ARA'],
];

const git = (...a) => execFileSync('git', a, { stdio: 'pipe' });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });

try {
  for (const [c, quan] of COMMITS) {
    git('checkout', c === 'HEAD' ? 'HEAD' : c, '--', 'src');
    const p = await ctx.newPage();
    try {
      await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
      await p.waitForTimeout(5000);
      await p.click('button:has(svg.lucide-search)').catch(() => {});
      await p.waitForTimeout(9000);
      writeFileSync(`_tmp-vert-${c}-p2.png`, await p.screenshot());
      // La p1, portada a la pantalla nome's per a la captura.
      await p.evaluate(() => {
        const v1 = document.querySelector('[data-mega-page-viewport="1"]');
        const carril = v1?.parentElement?.parentElement;
        if (carril) carril.style.transform = 'translateX(0)';
      });
      await p.waitForTimeout(2500);
      writeFileSync(`_tmp-vert-${c}-p1.png`, await p.screenshot());
      const te = await p.evaluate(() => ({
        taula1: !!document.querySelector('[data-megaslide-taula="1"]'),
        franja: !!document.querySelector('[data-stripe-visual-content="1"]'),
      }));
      console.log(`${c}  ${quan.padEnd(34)} ok   taula1:${te.taula1} franja:${te.franja}`);
    } catch (e) {
      console.log(`${c}  ${quan.padEnd(34)} ERROR: ${e.message.split('\n')[0]}`);
    } finally {
      await p.close();
    }
  }
} finally {
  git('checkout', 'HEAD', '--', 'src');
  console.log('\n--- arbre restaurat ---');
  console.log(execFileSync('git', ['status', '--short'], { encoding: 'utf8' }));
  await ctx.close();
  await b.close();
}
