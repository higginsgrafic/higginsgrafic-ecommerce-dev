#!/usr/bin/env node
/**
 * Guarda de la conversió a tokens de color.
 *
 * Els tokens de `src/index.css` (`--grey-*`) són TRIPLETES CRUS d'HSL
 * (`--grey-line: 210 10% 92%`), pensats per anar SEMPRE dins d'`hsl(...)`.
 * Un `border-bottom-color: var(--grey-line)` és una declaració invàlida: el
 * navegador la descarta i la propietat cau a `currentColor`. Va passar
 * (01/10/2026) amb 158 usos i el separador del header es pintava amb la tinta.
 *
 * Aquest script els troba tots: cap token cru pot anar sense `hsl()`.
 *
 *   node scripts/verifica-tokens-color.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// El camí porta espais i accents: `fileURLToPath` els desfà; `.pathname` no.
const ARREL = dirname(dirname(fileURLToPath(import.meta.url)));
const DIRS = ['src'];
const EXTS = new Set(['.js', '.jsx']);
// `src/index.css` no s'hi inclou: alla els var(--grey-*) son ALIES de token
// (`--border: var(--grey-line)`), i hi han d'anar pelats.
const TOKENS = [
  'grey-paper', 'grey-paper-soft', 'grey-paper-tint', 'grey-line',
  'grey-line-strong', 'grey-muted', 'grey-muted-2', 'grey-ink-soft',
  'grey-ink-2', 'grey-ink', 'grey-ink-strong', 'grey-ink-pure',
  'white-strong', 'white-soft', 'background', 'foreground', 'border',
  'muted', 'muted-foreground', 'card', 'secondary', 'accent', 'input',
  'popover', 'primary',
];

function fitxers(dir, out = []) {
  for (const nom of readdirSync(dir)) {
    if (nom === 'node_modules' || nom === '.git') continue;
    const p = join(dir, nom);
    const st = statSync(p);
    if (st.isDirectory()) fitxers(p, out);
    else if (EXTS.has(nom.slice(nom.lastIndexOf('.')))) out.push(p);
  }
  return out;
}

const patro = new RegExp(`(?<!hsl\\()var\\(--(${TOKENS.join('|')})\\)`, 'g');
const problemes = [];

for (const dir of DIRS) {
  for (const fitxer of fitxers(join(ARREL, dir))) {
    const text = readFileSync(fitxer, 'utf8');
    text.split('\n').forEach((linia, i) => {
      patro.lastIndex = 0;
      let m;
      while ((m = patro.exec(linia))) {
        problemes.push({
          fitxer: relative(ARREL, fitxer),
          linia: i + 1,
          token: m[1],
          text: linia.trim().slice(0, 120),
        });
      }
    });
  }
}

if (problemes.length === 0) {
  console.log('OK: cap token de color cru sense hsl().');
  process.exit(0);
}

console.error(`ERROR: ${problemes.length} token(s) de color sense hsl():\n`);
for (const p of problemes) {
  console.error(`  ${p.fitxer}:${p.linia}  var(--${p.token})`);
  console.error(`      ${p.text}`);
}
console.error('\nCal escriure hsl(var(--token)).');
process.exit(1);
