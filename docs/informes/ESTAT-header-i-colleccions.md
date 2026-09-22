# Estat del projecte: header i col·leccions

**Data**: 22 de setembre de 2026
**Abast**: des del començament dels canvis fins ara
**Font de veritat del pla**: `docs/informes/PLA-header-i-colleccions.md`

---

## 1. Resum

- **El moviment del layout està eliminat i verificat.** Les sis causes del punt 2
  estan totes arreglades, i les traces amb timestamps no troben cap element amb
  més d'un estat a cap de les 35 combinacions mesurades (7 rutes × 5 amplades).
- **L'Etapa A està tancada sencera**: A1, A2, A3 i A4, més les pre-etapes E1 i E2.
- El que queda de l'objectiu és **refer les peces**, no arreglar moviment:
  **Etapa B** (una sola pàgina de col·lecció) i **Etapa C** (el header).
- L'arbre és net i **tot està pujat a `origin/main`** (6 commits d'aquesta
  tongada, l'últim `222bce8`).

---

## 2. D'on venim: el problema i les causes

L'amo ho descrivia així: *"la pàgina es munta malament. Tot tremola i s'ajusta,
continua tremolant, es continua reajustant i al final acaba que tot és al damunt
de tot"*, i ho acotava: *"1440 cap amunt no hi ha problema; a partir de 1280 i les
tauletes les col·leccions es mouen"*.

Mesurat amb Playwright mostrejant cada 150 ms:

| què es movia | quant | quan |
|---|---|---|
| Les targetes del rail | **327 px** (x=−669 → −996 a 1280 px) | en arribar les guies de dev, ~1,1 s |
| La pàgina de col·lecció sencera | 40 px | en dos o tres passos, ~1 s |
| L'alçada de la hero | 962 → 919 → 914 px | en tres passos |
| El top del contingut | 166 → 157 → 156 px | en dos passos |

Les sis causes, totes amb la seva evidència al pla (secció 2), i el seu estat:

| # | causa | arreglada a |
|---|---|---|
| 2.1 | El rail llegia variables només de dev (`--belt2-*`) | `3be75d6` |
| 2.2 | Les variables de layout es publicaven després del pintat | `ae218fa` |
| 2.3 | L'alçada de la hero es mesurava amb JS | `3da8e1e` |
| 2.4 | La transició del `padding-top` del `<main>` | `46cf829` |
| 2.5 | La fórmula de l'alçada de capçalera, duplicada | `040ce4f` (codi mort fora) |
| 2.6 | El residu de 10 px era la transició de pàgina (`y: 10`) | `daf9865` |

---

## 3. El pla i la revisió externa

El revisor (GLM 5.3 flash) va donar el pla per **aprovat** amb **4 esmenes
obligatòries** i **3 riscos nous**. L'ordre A → B → C va quedar confirmat.

| esmena | què demanava | estat |
|---|---|---|
| **A1** | `laneForViewport(vw)` al model; cap codi de producció ha de llegir mai més `--belt2-*` | **feta** (`d2e87b2`) |
| **B1** | `CollectionPage.jsx` no és base de la fusió; l'Etapa B es fa sobre codi nou | **feta** (E2, `ce2171a`) |
| **B2** | `CollectionMobile` queda fora de l'abast (la fusió és de la vista vertical) | pendent a B |
| **C1** | `MainHeader.jsx` (1.116 línies, mort) fora | **feta** (`040ce4f`) |

| risc | què demanava | estat |
|---|---|---|
| **R1** | Verificar l'equivalència del `rowHeight` a cinc mides abans de canviar-lo | **mitigat** |
| **R2** | A la fusió (B), animacions i *delays* per col·lecció com a paràmetre | pendent a B |
| **R3** | A les traces, enregistrar el timestamp i exigir que no hi hagi cap canvi després del primer frame | **aplicat a totes les verificacions** |

---

## 4. Què s'ha fet, pas a pas

### 4.1 E1 — Codi mort fora (`040ce4f`)

`src/components/MainHeader.jsx` (1.116 línies) i `src/hooks/useRouteLayout.js`,
cap dels dos importat enlloc. També hi havia dues fórmules divergents per al
mateix número (l'alçada de capçalera), que era una trampa per al futur.

### 4.2 A1 — `laneForViewport` al model (`d2e87b2`)

`getSafeBelt()` prioritzava les guies `--belt2-*`, que **només** publica
`BeltReferenceOverlay`, en DEV i sempre més tard. Això mantenia un
`dev != producció` al `rowHeight` i, per tant, a la posició de la hero de les cinc
col·leccions. Ara `carrilAmple` surt del model (`laneForViewport(vw)`), que és una
funció pura de l'amplada.

**Verificació (R1)**: valors idèntics a 768/1024/1280/1440/1920 px abans del canvi.

### 4.3 A2 — Les tres mides de la hero, a `calc()` (`fb9b8a4` + `4f82371`)

**Què hi havia.** A les cinc pàgines, un `useLayoutEffect` amb un
`setTimeout(mesura, 300)` omplia **tres estats**:

```js
setHeroBandTopPx(Math.max(0, Math.round(headerBottom - heroTop)));
setHeroIconsTopPx(Math.round(window.innerHeight - bandH / 2 - heroTop));
setHeroBottomBandTopPx(Math.round(window.innerHeight - bandH - heroTop));
```

Els números arribaven **300 ms després del pintat**: la franja i les icones
saltaven de lloc al muntar.

**Què hi ha ara.** Fora els tres estats i el `bandRef`. El `useLayoutEffect` que ja
hi era publica **només dues variables**, i ho fa **abans del pintat**:

| variable | valor | per què no es pot calcular en CSS |
|---|---|---|
| `--hg-hero-top` | `round(hero.getBoundingClientRect().top)` | depèn de la fila de la graella i del `top` de la hero |
| `--hg-header-bottom` | `round(header.getBoundingClientRect().bottom)` | depèn del nombre de files d'ofertes i de banners |

I les tres mides són `calc()` sobre aquestes dues i el viewport. Com que les
franges viuen **dins** del contenidor de la hero, a cada expressió s'hi resta
`--hg-hero-top`:

```js
// franja de dalt: just al separador de la capçalera
const heroBandTop       = 'calc(var(--hg-header-bottom, 163px) - var(--hg-hero-top, 107px))';
// franja de baix: el seu costat de baix toca el fons de la finestra
const heroBottomBandTop = `calc(100vh - ${BAND_HEIGHT} - var(--hg-hero-top, 107px))`;
// icones: la fórmula original (`innerHeight - alçada/2 - heroTop`) amb calc()
const heroIconsTop      = `calc(100vh - (${BAND_HEIGHT}) / 2 - var(--hg-hero-top, 107px))`;
```

La filera d'icones conserva el seu `transform: translateY(-50%)`.

**Verificació**: franja de dalt al separador i franja de baix al fons de la
finestra, amb una desviació màxima de **0,5 px**; i franges i icones
**idèntiques a HEAD**, comprovat amb els dos servidors alhora.

**Un pas enrere, documentat.** El primer commit d'A2 (`fb9b8a4`) va sortir amb una
desviació que no tocava: vaig treure el `translateY(-50%)` de les icones i les vaig
posar a la vora de dalt de la franja. L'amo ho va detectar i `4f82371` **restaura
exactament** la posició original.

### 4.4 A3 — `pushDownPx` i `posterExtraPx` (`f03d94b`)

**`posterExtraPx` (Austen): convertit a càlcul.** Era
`Math.round(getSafeBelt().width * 0.857)` dins de l'efecte; ara és
`Math.round(carrilAmple * 0.857)` en el render. Fora l'estat i fora la mesura.
Verificat a les cinc mides: 463 / 617 / 771 / 868 / 1157 px, exactament igual.

**`pushDownPx`: no es pot calcular, i queda mesurat abans del pintat.** La
comprovació ho descarta com a funció del carril:

| amplada | alçada | sobreix de la hero | `pushDownPx` |
|---|---|---|---|
| 768 | 1024 | −0,1 px | 0 |
| 1024 | 1366 | −0,2 px | 0 |
| 1280 | 800 | −0,3 px | 0 |
| 1440 | 900 | 28,4 px | 28 |
| 1920 | 1080 | 89,8 px | 90 |

Depèn de **l'alçada de la finestra** i de la posició natural de la graella (files
fixes amb *pitch* variable), i la graella també es mou amb el desplaçament aplicat.
Es queda com a mesura, però:

- al `useLayoutEffect` que ja hi era (**abans del pintat**);
- publicada com a variable CSS (`--hg-push-down`), sense re-render de React ni
  estat nou;
- **fora el bucle de punt fix** (`base = topActual - prev`);
- **fora el `setTimeout(mesura, 300)`**, que ja no existeix a cap de les cinc
  pàgines.

**Risc de l'annex, tancat aquí.** L'A1 havia deixat `carrilAmple` **congelat al
primer render**, o sigui que `rowHeight` i el `top` de la hero no s'actualitzaven
al girar una tauleta. Ara es recalcula en `resize` amb la mateixa font que el
primer render. Verificat amb traces cada 40 ms: només-alçada no mou res; canvi
d'amplada s'assenta en una passa i ja no es mou més.

### 4.5 E2 — `/lab/proves` i la pàgina de col·lecció genèrica, fora (`ce2171a`)

`src/pages/CollectionPage.jsx` (285 línies) era una pàgina de col·lecció genèrica
que **no** tenia hero, ni pauta, ni `TdpPage`, ni `TramFinal`: una llista de
catàleg que llegia la col·lecció de Supabase. El revisor va dir que no és base de
la fusió, i la decisió presa és **eliminar-la**:

| què | estat |
|---|---|
| `src/pages/SupabaseCollectionRoute.jsx` | esborrat |
| `src/pages/CollectionPage.jsx` | esborrat |
| `src/config/collections.js` | esborrat |
| ruta `/lab/proves` i redirecció `/proves` | fora |
| entrada i redirecció a `pagesManifest.js` | fora |
| enllaços des de `/lab`, `/lab/demos` i `/lab/wip` | fora |

Comprovat abans d'esborrar que res més no en penjava: `ProductGrid` i
`FullBleedUnderHeader` tenen consumidors propis i es queden.

**Efecte col·lateral**: el bundle principal baixa d'uns 514 kB a **479 kB**.
I la ruta `/lab/proves`, que no passava per `ProtectedRoute` (era pública a
producció), deixa d'existir.

### 4.6 A4 — `zeroLeftOffsetPx` (`222bce8`)

**Què fa.** Alinea el breadcrumb amb el `left` del logo GRAFC. El breadcrumb viu
dins la cel·la de la graella, i el seu contenidor comença més a l'esquerra que el
logo: la diferència és l'offset. Valors reals mesurats:

| amplada | `logoLeft − gridLeft` | offset aplicat |
|---|---|---|
| 768 | −66,5 | **0** (guanya el clamp) |
| 1024 | −88,5 | **0** |
| 1280 | −9,1 | **0** |
| 1440 | 38 | **38** |
| 1920 | 47,5 | **47,5** |

Amb l'offset aplicat, el breadcrumb cau exactament al `left` del logo
(1440: 244 → 244; 1920: 325 → 325). **No era codi mort**, com hauria semblat
mesurant només en tauleta.

**Què ha canviat.** Es queda mesurat, però:

- passa a `useLayoutEffect` (**abans del pintat** quan els elements ja hi són);
- **fora el bucle de `requestAnimationFrame`** que reintentava indefinidament; el
  substitueix un `MutationObserver` que mesura quan apareix la graella i es
  desconnecta tot seguit;
- es deixa d'escoltar el `scroll`; el `resize` es queda.

**Per què cal esperar.** El logo i la graella arriben amb el chunk de la
capçalera, cap a **1,1 s després del `load`**: no existeixen al primer pintat, i
per això la mesura no pot ser mai d'un sol intent.

---

## 5. Checklist del pla

```
Pre-etapes
  [x] E1. Eliminar MainHeader.jsx i useRouteLayout.js            (040ce4f)
  [x] E2. Decidit: /lab/proves, CollectionPage.jsx i companyia FORA
                                                                  (ce2171a)

Etapa A (TANCADA)
  [x] A1. laneForViewport(vw) al model + carrilAmple de les 5     (d2e87b2)
  [x] A2. heroBandTopPx / heroIconsTopPx / heroBottomBandTopPx -> calc()
                                                                  (fb9b8a4, 4f82371)
  [x] A3. pushDownPx / posterExtraPx                              (f03d94b)
  [x] A4. zeroLeftOffsetPx -> useLayoutEffect abans del pintat     (222bce8)

Etapa B (pendent)
  [ ] B1. Component unic nou amb parametres; sense tocar /lab/proves
  [ ] B2. CollectionMobile fora de l'abast
  [ ] B3. Animacions i delays com a parametres per colleccio (R2)
  [ ] Ordre: Cube -> First Contact -> Miscellania -> The Human Inside -> Austen

Etapa C (pendent, al final)
  [ ] C1. setMegaHeroRowHeight  -> model (mateixa formula que rowHeight)
  [ ] C2. setRootRemPx          -> model
  [ ] C3. setBleedGuardExpandPx -> model
  [ ] C4. setMegaInsetsPx       -> model
  [ ] C5. setStripeRowPadPx / setStripeRowPadXPx / setLockBtnTop
          -> useLayoutEffect (abans del pintat)
  [ ] C6. Neteja d'efectes morts; avaluacio final de reescriptura
```

---

## 6. Els set estats de mesura de les pàgines de col·lecció

| estat | decisió del revisor | estat |
|---|---|---|
| `rowHeight` | càlcul | **fet** (les cinc pàgines) |
| `carrilAmple` | al model | **fet** (A1) |
| `heroBandTopPx` | `calc()` | **fet** (A2, eliminat) |
| `heroIconsTopPx` | `calc()` | **fet** (A2, eliminat) |
| `heroBottomBandTopPx` | `calc()` | **fet** (A2, eliminat) |
| `posterExtraPx` | càlcul | **fet** (A3, eliminat) |
| `pushDownPx` | càlcul o mesura abans del pintat | **fet** (A3, variable CSS) |
| `zeroLeftOffsetPx` | mesurat amb `useLayoutEffect` | **fet** (A4) |

A les cinc pàgines ja **no hi ha cap `setTimeout`** ni cap bucle de
`requestAnimationFrame` de mesura.

---

## 7. Protocol de verificació (què s'ha executat)

| comprovació | resultat |
|---|---|
| `npx vitest run` | **462 proves / 38 fitxers**, tot verd |
| `npm run compara-vistes` | **OK** (vertical i horitzontal, tolerància 0,5/1,5 px) |
| `npx vite build` | **OK** (i verificat també contra el build servit a part) |
| Traces amb timestamps (R3), 7 rutes × 5 amplades | **cap element amb més d'un estat**; cap canvi després del primer frame |
| Equivalència amb el commit anterior (dos servidors alhora) | a A2, A3 i A4: **idèntic** al centèsim de px |

Les traces cobreixen: les cinc col·leccions, la PDP (`/austen/keep-calm`),
l'inici (`/`) i el megaslide, a 768/1024/1280/1440/1920 px.

---

## 8. Història de commits d'aquesta feina

| commit | què |
|---|---|
| `dc6aa0b` | Pla exhaustiu per refer el header i les col·leccions |
| `3be75d6` | (causa 2.1) el rail calcula el marc ell mateix |
| `ae218fa` | (causa 2.2) les variables de layout, a `useLayoutEffect` |
| `3da8e1e` | (causa 2.3) l'alçada de la hero, en CSS |
| `46cf829` | (causa 2.4) el `padding-top` del main no s'anima al primer pintat |
| `daf9865` | (causa 2.6) el moviment era la transició de pàgina (`y: 10`) |
| `fa4163c` | Etapa A: model únic de layout (`utils/layoutModel.js`) |
| `040ce4f` | E1: `MainHeader.jsx` i `useRouteLayout.js` fora |
| `d2e87b2` | A1: `laneForViewport` i les cinc col·leccions |
| `43b3ad4` | Pla: revisió externa incorporada (esmenes i riscos) |
| `fb9b8a4` | A2: les tres mides de la hero, a `calc()` |
| `4f82371` | A2 (correcció): les icones tornen a la seva posició |
| `de2e26b` | Informe d'estat (primera versió) |
| `2448246` | Informe: annex amb la verificació independent |
| `f03d94b` | A3: `pushDownPx` i `posterExtraPx`; risc del carril |
| `ce2171a` | E2: `/lab/proves` i companyia, fora |
| `222bce8` | A4: `zeroLeftOffsetPx` abans del pintat, sense bucle rAF |

Els commits de **documentació del pla** (`aa7e529`, `b3f7128`, `f8f7e69`) no hi
són perquè no són feina d'execució, sinó del document.

---

## 9. Decisió E2: resolta

Vegeu el punt 4.5. `CollectionPage.jsx`, `SupabaseCollectionRoute.jsx` i
`config/collections.js` són fora, amb la ruta i tots els enllaços. És la decisió
que el revisor demanava abans de començar l'Etapa B, i ja no bloqueja res.

---

## 10. Següent pas: Etapa B

**Objectiu**: un component únic per a la **vista vertical** de les cinc pàgines de
col·lecció, amb paràmetres.

**Què s'ha de conservar** (verificat una a una a cada fitxer abans de fusionar):

- l'alçada de la hero i la franja blanca que toca el separador del header;
- les icones de col·lecció i la seva posició de pantalla;
- la graella de fitxes (files, `rowHeight`, offsets);
- el `TramFinal`: pòster, subtítol «ALTRES HISTÒRIES» i rail;
- les diferències reals entre col·leccions: frases del pòster, imatges i, a
  Austen, les files de més (`posterExtraPx`).

**Com**: d'una col·lecció en una, començant per la més simple, comparant
l'equivalència amb el commit anterior a cada pas, i amb les **animacions i els
*delays* de framer-motion com a paràmetre per col·lecció** (risc R2: les captures
no detecten diferències de transició).

**Ordre**: Cube → First Contact → Miscel·lània → The Human Inside → Austen.

---

## 11. Annex: els tres punts de la verificació independent, resolts

La verificació independent (annex de la primera versió d'aquest informe) va
deixar tres punts. Tots tres estan tancats:

1. **Correccions de dades** — «2 commits pendents de pujar» era cert quan es va
   escriure; ara tot és a `origin/main`. La taula del punt 8 ja no omet
   `aa7e529`, `b3f7128` i `f8f7e69`, i diu per què són a part.
2. **Sondes temporals d'A3** — decidit: **s'esborren**, tal com mana la regla de
   la casa. No se'n converteix cap en mesura permanent perquè l'stack de
   verificació permanent ja existeix (`compara-vistes`, `vitest` i les traces,
   que es tornen a escriure quan calen).
3. **`carrilAmple` congelat en resize** — resolt amb la sortida 2 (recalcular-lo),
   dins el mateix `useLayoutEffect` que publica `--hg-hero-top`, i verificat amb
   traces que no reintrodueix moviment al girar la tauleta (punt 4.4).

---

## 12. Segona verificació independent (22/09/2026, després del tancament de l'A)

Aquest document s'ha tornat a contrastar punt per punt contra el codi
(`47b13fc`). **Resultat: el 100% de les afirmacions es completen.**

| afirmació del document | verificació al codi |
|---|---|
| A3: fora `setTimeout` i el bucle de punt fix | ✔ cap `setPushDownPx` ni `setTimeout` a cap de les cinc pàgines; el push-down és ara la variable `--hg-push-down`, publicada dins d'un `useLayoutEffect` i consumida amb `calc()` al `marginTop` |
| A3: `posterExtraPx` a càlcul | ✔ `Math.round(carrilAmple * 0.857)` a Austen, amb l'equivalència documentada (463/617/771/868/1157 px a les cinc mides) |
| A4: `zeroLeftOffsetPx` amb `useLayoutEffect` | ✔ línia 274 d'Austen i equivalents; sense bucle rAF |
| E2: `/lab/proves` fora | ✔ `CollectionPage.jsx`, `SupabaseCollectionRoute.jsx` i `config/collections.js` esborrats de `src/` |
| Sondes temporals esborrades | ✔ cap `scripts/_tmp*` |
| Arbre net, tot pujat | ✔ `main` sincronitzada amb `origin/main` |

### Observacions per a l'Etapa B (no bloquegen res)

1. **Punt de partida ideal**: les cinc pàgines comparteixen ara la mateixa
   estructura (dos números mesurats abans del pintat + la resta en `calc()`),
   que és exactament el que el component únic haurà de parametritzar.
2. **Artefactes velts**: `dist-prod/` i `test-results/lighthouse/` encara
   referencien els fitxers esborrats per E2. No fan mal (són generats), però al
   proper `vite build` es refrescaran; no confondre'ls amb codi viu en cerques.
3. **Captures de referència abans de fusionar**: el projecte està estable i el
   layout quiet — és el moment ideal per desar la captura «abans» de cada
   col·lecció (les cinc, a les cinc amplades) a `docs/comparacio/`, perquè cada
   pas de la fusió tingui una referència visual fixa, a més de les traces.
