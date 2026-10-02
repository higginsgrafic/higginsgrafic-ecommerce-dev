# INFORME — 04/10/2026 · La bateria, verda

Després de la neteja d'eslint del 03/10, `npx vitest run` tenia **5 fallades de 600** en tres
fitxers. Cap era del codi de la botiga: dues eren una regressió de la pròpia neteja i tres eren
expectatives desactualitzades. Ja estan arreglades.

## 1. Els correus es compilen en JSX clàssic (`email-bundle.test.js`, 2 fallades)

- **Causa**: Netlify empaqueta les funcions de servidor amb esbuild i, com que no hi ha cap
  `tsconfig` amb `jsx: react-jsx` a l'abast de `netlify/emails/**/*.jsx`, el JSX surt en mode
  **clàssic** (`React.createElement`): cada `.jsx` ha d'importar React. La neteja del codi mort
  (`61db3034`) els va treure perquè la config d'eslint fa servir el runtime **automàtic**
  (`react.configs['jsx-runtime']`), que desactiva `react/jsx-uses-react` i
  `react/react-in-jsx-scope`: per a l'eslint, aquell import era codi mort.
- **Solució**: tornen els 13 `import React from 'react';` i s'afegeix un bloc d'eslint només per a
  `netlify/emails/**/*.jsx` amb les dues regles del runtime clàssic, de manera que l'eslint ho
  **torna a exigir** i no pot tornar a passar.

## 2. Dues proves desactualitzades

- **`classificacio-dispositiu.test.js` (2)**. El PLA (§1.2, actualitzat el 02/10/2026) diu que els
  dos màxims són **1032** i **1376** i que els dos iPad Pro 13 són tauleta. Les files de la prova
  deien `escriptori` per als dos; la frontera de la tauleta vertical deia 1025 (ara és 1032, i 1033
  per a escriptori) i la de la tauleta apaïssada deia 1367 (ara és 1376, i 1377). **El
  classificador ja era correcte**: s'han posat al dia les expectatives, amb la cita del PLA.
- **`dibuixos-franja.test.js` (1)**. La prova demanava que cap entrada del mapa caigués dins de la
  banda base de l'escala (70..90) i en fallaven sis: els textos de Quotes
  (`you-have-bewitched-me`, `half-agony-half-hope`, `unsociable-and-taciturn`, en les dues
  tintes). Però aquelles entrades no hi són per l'escala —que la regla dona igual (0,31 = 79,36
  unitats)— sinó pels seus **offsets** (`dx: 0,5`, `dy: 17,25`): la regla només cobreix l'escala i
  el desplaçament cauria a (0,0). El filtre ara només compta les entrades que no porten res (escala
  de banda **i** offsets a zero), que són les redundants de debò.

## 3. Estat de la bateria

| comprovació | abans | després |
|---|---|---|
| `npx vitest run` | 5 fallades / 600 | **0 / 600** ✓ |
| `npx eslint` (fitxers tocats) | — | **net** ✓ |
| `npx vite build` | — | **OK** ✓ |
| `npm run compara-vistes` | no executat | no executat |
| `node scripts/mesura-formats.mjs` | no verificat | passa dels 10 minuts |

**Nota**: el rebase del 03/10 va deixar `main` sense upstream; s'ha tornat a configurar amb
`git push --set-upstream origin main` (fast-forward, sense reescriure res).
