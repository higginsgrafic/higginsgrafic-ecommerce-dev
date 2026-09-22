# Estat del projecte: header i col·leccions

**Data**: 22 de setembre de 2026
**Abast**: des del començament dels canvis fins ara
**Font de veritat del pla**: `docs/informes/PLA-header-i-colleccions.md` (411 línies)
**Revisió externa**: GLM 5.3 flash, incorporada al pla (secció 8)

---

## 1. Resum en tres línies

El moviment del layout (el "tremolor") **està eliminat i verificat** a tot el que
s'ha pogut mesurar. El que queda de l'objectiu és **refer** les peces (etapes B i
C), no arreglar moviment. Dels quatre passos de l'Etapa A, **A1 i A2 estan fets**;
queden **A3 i A4**. L'arbre és net i hi ha **2 commits pendents de pujar**.

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

Les sis causes trobades (totes amb la seva evidència al pla, secció 2) i el seu
estat:

| # | causa | estat |
|---|---|---|
| 2.1 | El rail llegia variables només de dev (`--belt2-*`) | **arreglat** (`3be75d6`) |
| 2.2 | Les variables de layout es publicaven després del pintat | **arreglat** (`ae218fa`) |
| 2.3 | L'alçada de la hero es mesurava amb JS | **arreglat** (`3da8e1e`) |
| 2.4 | La transició del `padding-top` del `<main>` | **arreglat** (`46cf829`) |
| 2.5 | La fórmula de l'alçada de capçalera estava duplicada | **arreglat** (`040ce4f`, codi mort fora) |
| 2.6 | El residu de 10 px: la transició de pàgina (`y: 10`) | **arreglat** (`daf9865`) |

---

## 3. El pla: tres etapes, amb esmenes de la revisió externa

El revisor (GLM 5.3 flash) va donar el pla per **aprovat** amb **4 esmenes
obligatòries** i **3 riscos nous**. L'ordre A → B → C va quedar confirmat.

**Esmenes obligatòries**

- **A1** — `laneForViewport(vw)` al model; cap codi de producció ha de llegir mai
  més `--belt2-*`. → **FET** (`d2e87b2`)
- **B1** — `CollectionPage.jsx` **no** és la base de la fusió: només viu a
  `/lab/proves`. L'Etapa B es fa sobre codi nou. → pendent de decidir (E2)
- **B2** — `CollectionMobile` queda fora de l'abast (la fusió és de la vista vertical).
- **C1** — `MainHeader.jsx` (1.116 línies, mort) fora. → **FET** (`040ce4f`)

**Riscos nous**

- **R1** — Migrar `carrilAmple` toca el `rowHeight` de les cinc pàgines alhora:
  calia verificar l'equivalència a cinc mides en un commit revertible. → **mitigat**
- **R2** — A la fusió (B), les animacions i els *delays* de framer-motion han de
  quedar **per col·lecció com a paràmetre** (les captures no detecten diferències
  de transició). → pendent
- **R3** — El criteri "un sol estat" no mesura el temps: a les traces cal
  **enregistrar el timestamp** de cada canvi i exigir que no n'hi hagi cap després
  del primer frame. → **aplicat a totes les verificacions des d'aleshores**

---

## 4. Què s'ha fet (en aquesta tongada de feina)

### 4.1 Pre-etapa E1 — Codi mort fora (`040ce4f`)

`src/components/MainHeader.jsx` (1.116 línies) i `src/hooks/useRouteLayout.js`, cap
dels dos importat enlloc. També hi havia dues fórmules divergents per al mateix
número (l'alçada de capçalera), que era una trampa per al futur.

### 4.2 Esmena A1 — `laneForViewport` (`d2e87b2`)

`getSafeBelt()` prioritzava les guies `--belt2-*` (que **només** publica
`BeltReferenceOverlay`, en DEV, i sempre més tard). Això mantenia un
`dev != producció` al `rowHeight` i, per tant, a la posició de la hero de les cinc
col·leccions. Ara `carrilAmple` surt del model (`laneForViewport(vw)`), pur.

**Verificació (R1)**: valors idèntics a 768/1024/1280/1440/1920 px abans del canvi.

### 4.3 Esmena A2 — Les tres mides de la hero, a `calc()` (`fb9b8a4` + `4f82371`)

**Què hi havia.** A les cinc pàgines, un `useLayoutEffect` amb un
`setTimeout(mesura, 300)` omplia **tres estats**:

```js
setHeroBandTopPx(Math.max(0, Math.round(headerBottom - heroTop)));
setHeroIconsTopPx(Math.round(window.innerHeight - bandH / 2 - heroTop));
setHeroBottomBandTopPx(Math.round(window.innerHeight - bandH - heroTop));
```

Els números arribaven **300 ms després del pintat**: la franja i les icones
saltaven de lloc al muntar. Era l'últim reducte de mesura tardana de la hero.

**Què hi ha ara.** Fora els tres estats i el `bandRef`. El `useLayoutEffect` que ja
hi era publica **només dues variables**, i ho fa **abans del pintat**:

| variable | valor | per què no es pot calcular en CSS |
|---|---|---|
| `--hg-hero-top` | `round(hero.getBoundingClientRect().top)` | depèn de la fila de la graella i del `top` de la hero |
| `--hg-header-bottom` | `round(header.getBoundingClientRect().bottom)` | depèn del nombre de files d'ofertes i de banners |

I les tres mides són `calc()` sobre aquestes dues i el viewport (com que les
franges viuen **dins** del contenidor de la hero, a cada expressió s'hi resta
`--hg-hero-top`):

```js
// franja de dalt: just al separador de la capçalera
const heroBandTop       = 'calc(var(--hg-header-bottom, 163px) - var(--hg-hero-top, 107px))';
// franja de baix: el seu costat de baix toca el fons de la finestra
const heroBottomBandTop = `calc(100vh - ${BAND_HEIGHT} - var(--hg-hero-top, 107px))`;
// icones: fórmula original reescrita amb calc()
const heroIconsTop      = `calc(100vh - (${BAND_HEIGHT}) / 2 - var(--hg-hero-top, 107px))`;
```

La filera d'icones conserva el seu `transform: translateY(-50%)`.

**Verificació**

- Franja de dalt al separador i franja de baix al fons de la finestra: desviació
  màxima **0,5 px** a 768/1024/1280/1440/1920 px a les cinc col·leccions.
- **Icònica i franges idèntiques a HEAD**, comprovat amb els dos servidors alhora
  (el commit anterior i l'arbre), a les cinc amplades i a `/cube` i `/austen`,
  al centèsim de px.

**Nota honesta d'un pas enrere.** El primer commit d'A2 (`fb9b8a4`) anava acompanyat
d'una desviació que no tocava: vaig treure el `translateY(-50%)` de les icones i
les vaig posar a la vora de dalt de la franja. L'amo ho va detectar i el commit
`4f82371` **restaura exactament** la posició original. Els dos commits es queden
perquè expliquen la causa.

---

## 5. Estat del checklist d'execució

```
Pre-etapes
  [x] E1. Eliminar MainHeader.jsx i useRouteLayout.js            (040ce4f)
  [ ] E2. Decidir el desti de /lab/proves i CollectionPage.jsx
          (es queda com a eina de lab o s'elimina; NO es base de B)

Etapa A (cua ampliada)
  [x] A1. laneForViewport(vw) al model + carrilAmple de les 5     (d2e87b2)
  [x] A2. heroBandTopPx / heroIconsTopPx / heroBottomBandTopPx -> calc()
                                                                  (fb9b8a4, 4f82371)
  [ ] A3. pushDownPx / posterExtraPx -> calcul sobre nombre de files
  [ ] A4. zeroLeftOffsetPx -> useLayoutEffect

Etapa B
  [ ] B1. Component unic nou amb parametres; sense tocar /lab/proves
  [ ] B2. CollectionMobile fora de l'abast
  [ ] B3. Animacions i delays com a parametres per colleccio (R2)
  [ ] Ordre: Cube -> First Contact -> Miscellania -> The Human Inside -> Austen

Etapa C (header, per passos)
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

Estat real després d'A1 i A2:

| estat | decisió del revisor | estat |
|---|---|---|
| `rowHeight` | càlcul | **fet** (les cinc pàgines) |
| `carrilAmple` | al model | **fet** (A1) |
| `heroBandTopPx` | `calc()` | **fet** (A2, eliminat) |
| `heroIconsTopPx` | `calc()` | **fet** (A2, eliminat) |
| `heroBottomBandTopPx` | `calc()` | **fet** (A2, eliminat) |
| `pushDownPx` | càlcul sobre el nombre de files | **pendent (A3)** |
| `posterExtraPx` | càlcul sobre el nombre de files | **pendent (A3)** |
| `zeroLeftOffsetPx` | es queda mesurat, però amb `useLayoutEffect` | **pendent (A4)** |

Nota per a A3: el `setTimeout(mesura, 300)` que queda a les cinc pàgines **ja no
mesura cap mida de la hero**; només alimenta `pushDownPx` (i `posterExtraPx` a
Austen). És el que ha de desaparèixer a A3.

---

## 7. Protocol de verificació (què s'ha executat)

| comprovació | resultat |
|---|---|
| `npx vitest run` | **462 proves / 38 fitxers**, tot verd |
| `npm run compara-vistes` | **OK** (vertical i horitzontal, tolerància 0,5/1,5 px) |
| `npx vite build` | **OK** |
| Traces amb timestamps (R3), 7 rutes × 5 amplades | **cap element amb més d'un estat**; cap canvi després del primer frame |
| Equivalència amb HEAD (dos servidors alhora) | franges i icones **idèntiques** al centèsim de px |

Les traces cobreixen: les cinc col·leccions, la PDP (`/austen/keep-calm`), l'inici
(`/`) i el megaslide, a 768/1024/1280/1440/1920 px.

---

## 8. Història de commits d'aquesta feina

Del més antic al més nou:

| commit | què |
|---|---|
| `dc6aa0b` | Pla exhaustiu per refer el header i les col·leccions |
| `3be75d6` | (causa 2.1) el rail calcula el marc ell mateix |
| `ae218fa` | (causa 2.2) les variables de layout, a `useLayoutEffect` |
| `3da8e1e` | (causa 2.3) l'alçada de la hero, en CSS |
| `46cf829` | (causa 2.4) el `padding-top` del main no s'anima al primer pintat |
| `daf9865` | (causa 2.6) el moviment era la transició de pàgina (`y: 10`) |
| `fa4163c` | Etapa A: model únic de layout (`utils/layoutModel.js`) |
| `040ce4f` | Pre-etapa E1: `MainHeader.jsx` i `useRouteLayout.js` fora |
| `d2e87b2` | Esmena A1: `laneForViewport` i les cinc col·leccions |
| `43b3ad4` | Pla: revisió externa incorporada (esmenes i riscos) |
| `fb9b8a4` | **Esmena A2**: les tres mides de la hero, a `calc()` |
| `4f82371` | **A2 (correcció)**: les icones tornen a la seva posició |

---

## 9. Decisió pendent del revisor (E2)

`src/pages/CollectionPage.jsx` (285 línies) + `src/config/collections.js` és, de
facto, una versió anterior del component parametritzat que l'Etapa B proposa
crear. El revisor diu que **no és base de la fusió** i que queda **fora d'abast**,
però la decisió de si es conserva com a eina de laboratori o s'elimina encara és
oberta. No bloqueja A3 ni A4.

---

## 10. Següent pas immediat: A3

**Objectiu**: convertir `pushDownPx` i `posterExtraPx` a càlcul sobre el **nombre de
files** (dada del config). Han de desaparèixer:

- el bucle de punt fix (`setPushDownPx` amb `base = topActual - prev`);
- el `setTimeout(mesura, 300)` de les cinc pàgines.

Si el càlcul exacte acabés depenent d'una mida real de la graella, es deixa
**mesurat amb `useLayoutEffect`** i es documenta (és la lliçó d'A2: una mesura feta
abans del pintat no mou res).

**Verificació que tocarà**: el protocol del punt 7 sencer, més l'equivalència amb
HEAD a les cinc amplades.
