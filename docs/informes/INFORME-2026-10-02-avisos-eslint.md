# Els avisos de l'eslint: dels 755 als 533, i els deps auditats un per un

**Data:** 2026-10-02 · **Estat:** fet i verificat.
**Ve de:** «Els 755 avisos de què són?» i «Gestiona'ls com creguis que s'ha de fer».

---

## 1. El critèri

Dels 755 avisos n'hi havia tres classes: soroll segur (neteja mecànica), avisos que
podien amagar bugs (`exhaustive-deps`, per auditar un per un) i patrons intencionats
(no tocar). S'ha fet exactament això.

## 2. Neteja mecànica (222 avisos menys)

| què | quants | com |
|---|---|---|
| directives `eslint-disable` velles (`no-console` etc., regles inactius) | 12 | `eslint --fix` |
| imports de `React` sobrants (el JSX runtime automàtic els fa innecessaris) | 132 | trets per script sobre les posicions de l'eslint, als 132 fitxers |
| deps de més en memos (`CONTROL_TILE_ARROWS`…, `h`/`w`, expressió complexa de `ProductDetailPage`) | ~6 | retirades |

## 3. L'auditoria dels 76 `exhaustive-deps`

Cada cas llegit i classificat. Cap arregl cec: només dependències d'identitat
estable (setters, constants de mòdul, helpers purs) o d'efecte inofensiu.

- **Afegides** (~25): setters (`setMegaPage`, `setIsNavigating`…), primitius que
  l'efecte ja llegia amb intenció (`trackingToken`, `localCartItemCount`,
  `midaSelectorP2`…), i helpers purs que han pujat a nivell de mòdul
  (`extractCanonicalColorFromImageUrl` i companyes a `ProductDetailPage`,
  `suggestPathFromFilename` a `AdminUploadPage`).
- **Arreglats de veritat** (2): `ToastContext` (`removeToast` abans de `addToast`,
  mateixa identitat estable) i `ProductGrid` (`safeProducts` dins del memo, com
  recomanava el plugin; la llavor aleatòria és determinista via `sessionStorage`).
- **Intencionals, documentats** (~48): càrregues «un cop al muntatge»
  (`loadFiles`, `loadConfig`, `doRedirect`…), funcs recreades a cada render que no
  es poden afegir sense canviar el comportament (ProductContext i els seus 8 avisos
  d'un mateix memo, amb bloc explicatiu «per què NO envolcalllem amb useCallback»),
  i congelacions a posta (`location.search` a `FullWideSlideHeader`, que sinó
  resetejaria la col·lecció activa a cada navegació). Tots amb
  `eslint-disable-next-line` + motiu en català i data.
- **SUSPECTE DE BUG (no arreglat): `TambeRail.jsx:450`.** El listener de
  `tambe-rail:next/prev` captura `goNext`/`goPrev` amb una `carouselAnimate` que pot
  quedar vella després d'un snap de vora (el rAF de restauració no re-executa
  l'efecte). Marcat al codi amb `SUSPECTE DE BUG`; cal arregl a part, amb proves
  visuals del rail (afegir `carouselAnimate` a les deps o `useCallback` complets).

## 4. El que queda (533 avisos, cap error)

- 149 de les set regles del v7 (reclassificades el dia mateix, decisió documentada).
- ~340 `no-unused-vars` de la resta: variables mortes, props i args no usats;
  higiene oportuna quan es toqui cada fitxer.
- 46 `react-refresh/only-export-components`: només velocitat de fast refresh.

## 5. Verificació

- `npx eslint src`: **0 errors, 533 avisos** (eren 755).
- `npx vite build`: correcte.
- `node scripts/verifica-tokens-color.mjs`: OK.
