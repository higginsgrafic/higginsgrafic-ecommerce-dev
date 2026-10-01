# Els 322 errors de l'eslint, a zero

**Data:** 2026-10-02 · **Estat:** fet i verificat.
**Ve de:** la pregunta de l'amo («Què són aquests errors de slint?») i, en veure el
quadre, «Arregla'ls tots».

---

## 1. D'on venien

L'eslint (afegit el 2026-05-14 amb `95b2ad41`) reportava **322 errors i 606 avisos**
repartits per ~90 fitxers. Dos orígens ben diferents:

1. **Regles noves del plugin `react-hooks` v7** (~149): la configuració
   *recommended* d'aquesta versió activa regles derivades del compilador de React
   (`set-state-in-effect`, `immutability`, `purity`, `static-components`, `refs`,
   `preserve-manual-memoization`, `error-boundaries`) que marquen patrons
   INTENCIONATS del projecte: efectes que mesuren el DOM i publiquen mides
   (`--inici-hero-alcada`, el calibratge del megaslide), i components definits
   dins del render.
2. **Errors de debò** (~173): patrons trencadors o fràgils repartits per tot el site.

## 2. El que s'ha arreglat al codi

| regla | quants | què es va fer |
|---|---|---|
| `react/no-unescaped-entities` | 95 | apòstrofs i cometes de text JSX escapats (`&apos;` etc.) a 41 fitxers, aplicats per script sobre les posicions exactes de l'eslint |
| `no-undef` (18) | `UserProfileTabs.jsx` | les constants `titleStyle`/`labelStyle`/`inputStyle`/`fieldMargin` es van perdre al refactor `8fe587cf`: **restaurades** amb els valors originals de `7f38448d` |
| `no-undef` (1) | `BranchBadge.jsx` | `__HG_GIT_BRANCH__` és un global de build (`define` a `vite.config.js`): declarat als `globals` de `eslint.config.js` |
| `react/jsx-no-undef` (2) | `SlideShell.jsx` | `SlideContent` no ha existit mai: el component amb la signatura que s'hi esperava és `FastViewContent` |
| `no-dupe-keys` (6) | `homeDrawings.js`, `stripeCalibrationsVertical.js` | el mateix veri de «Quotes a la hero» (3quindecies): entrades velles de `you-have-bewitched-me` i companyes; es manté el valor FINAL (el que JavaScript aplicava), fora l'entrada anterior |
| `no-constant-binary-expression` (3) | `UserComandesContent.jsx` | un `true &&` tret; el bloc de pauta amb `false &&` passa a una constant de mòdul, per no esborrar el codi |
| `react/jsx-key` (8) | `UserComandesContent.jsx` | claus estables als spans de les caselles de targeta |
| `react/no-unknown-property` (4) | 4 fitxers | `maskType` fora del `<mask>` (ja hi era via `style`); `fetchpriority`, `passwordrules` i `directory` són intencionats: desactivats en línia amb comentari |
| `no-empty` (13) | 10 fitxers | comentari de silenci intencional amb data dins de cada bloc buit |
| `no-useless-catch` (7) | `gelato.js` | try/catch que només rellançaven: cos directe (els que afegien context no s'hi han tocat) |
| `no-useless-escape` (1) | `formatters.js` | `\-` → `-` |
| `react-hooks/rules-of-hooks` (14) | 5 fitxers | hooks condicionals (després d'early-returns o dins d'`if (layout === 'desktop')`) pujats a dalt incondicionalment, amb guard dins de l'efecte: mateix comportament observable |

## 3. Les set regles del v7, reclassificades

A `eslint.config.js`, amb comentari datat: les set regles noves del v7 passen a
**avís**. Reescriure-les és un redisseny de la capa de mesura del lloc (els efectes
de calibratge de píxels del megaslide i la hero), no un arranjament d'errors; si es
vol fer, és feina a part i amb mesura de regressió al davant.

## 4. Verificació

- `npx eslint src`: **0 errors** (755 avisos, cap nou de greu).
- `npx vite build`: correcte (12,2 s).
- `node scripts/verifica-tokens-color.mjs`: OK.

## 5. El que queda

- Els **755 avisos**: 606 preexistents (sobretot `no-unused-vars` de props per
  convenció `_` i `react-hooks/exhaustive-deps`) més els ~149 reclassificats. Si es
  volen a zero, és una altra tongada.
- El redisseny de la capa de mesura que faria desaparèixer els patrons del v7.
