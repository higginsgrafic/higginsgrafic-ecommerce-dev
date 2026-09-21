# Pla per refer el header i la pàgina de col·lecció

**Data**: 22 de setembre de 2026
**Autor**: l'agent
**Per a**: revisió externa (GLM 5.3 flash) abans de continuar
**Objectiu**: refer de zero el header (`FullWideSlideHeader` i el seu sistema de mides) i la pàgina de col·lecció (hero + graella + TramFinal), mantenint el resultat visual i les funcions actuals, i eliminant les causes del moviment del layout (mesures tardanes, estats que arriben després del pintat i transicions al muntatge).

---

## 1. El problema, amb mesures

L'amo descriu el símptoma així: *"la pàgina es munta malament. Tot tremola i s'ajusta, continua tremolant, es continua reajustant i al final acaba que tot és al damunt de tot"*, i ho acota: *"1440 cap amunt no hi ha problema; a partir de 1280 i les tauletes les col·leccions es mouen"*.

Mesurat amb Playwright mostrejant cada 150 ms:

| què es movia | quant | quan |
|---|---|---|
| Les targetes del rail | **327 px** (de x=−669 a x=−996 a 1280 px) | en arribar les guies de dev, ~1,1 s |
| La pàgina de col·lecció sencera | 40 px | en dos o tres passos, ~1 s |
| L'alçada de la hero | 962 → 919 → 914 px | en tres passos |
| El top del contingut | 166 → 157 → 156 px | en dos passos |

---

## 2. Causes trobades (cada una amb la seva evidència)

### 2.1 El rail llegia variables de desenvolupament

`TambeRail.jsx` ancorava el rail amb `--belt2-xL/--belt2-xR`. Aquestes variables **només** les publica `BeltReferenceOverlay`, que viu a `src/components/dev/` i es munta amb `import.meta.env.DEV`. O sigui: en desenvolupament arriben tard (i per tant el rail es reancorava), i **en producció no existeixen mai**, de manera que dev i producció pintaven coses diferents.

Evidència: traça a 1280 px — `960 ms: belt2 buit, targetes a x=−669` / `1080 ms: belt2=16/1264, targetes a x=−996`.

**Arreglat** (commit `3be75d6`): el rail calcula el marc ell mateix amb `computeSiteFrame()`.

### 2.2 Les variables de layout es publicaven després del pintat

`App.jsx` publicava `--appHeaderOffset`, `--rulerInset` i `--globalHeaderTopOffset` amb `useEffect`, que s'executa **després** del pintat. Com que la capçalera, la hero i els paddings pengen d'aquestes variables, la pàgina es pintava amb el valor vell i es recol·locava al segon pas.

**Arreglat** (commit `ae218fa`): passades a `useLayoutEffect`.

### 2.3 L'alçada de la hero es mesurava amb JavaScript

A les cinc pàgines de col·lecció:

```js
height: heroHeightPx != null ? `${heroHeightPx}px` : `calc(100vh - 62px)`
// i, en un temporitzador de 300 ms:
setHeroHeightPx(Math.round(window.innerHeight - heroTop))
```

La hero canviava de mida en dos o tres passos i arrossegava tota la pàgina.

**Arreglat** (commit `3da8e1e`): `height: 'calc(100vh - var(--appHeaderOffset, 62px))'`, a les cinc pàgines.

### 2.4 La transició del `padding-top` del `<main>`

El `<main>` porta `transition-[padding-top] duration-[350ms]`. Qualsevol canvi del layout no salta: **llisca** durant 350 ms. Això és el que fa que el moviment es vegi com un "tremolor" i no com un salt.

**Arreglat** (commit `46cf829`): la transició només s'activa un cop pintat, així el muntatge inicial és quiet.

### 2.5 La fórmula de l'alçada de capçalera estava duplicada

- `App.jsx`: `isPortraitTablet ? 116 : (isLargeScreen ? 80 : (isMobile ? 80 : 64))`
- `hooks/useRouteLayout.js`: `isLargeScreen ? 80 : 64`

Dues fórmules diferents per al mateix número. `useRouteLayout.js` **no s'usa enlloc** (codi mort), així que avui no fa mal, però és una trampa per al futur.

### 2.6 El residu de 10 px: la transicio de pagina (RESOLT)

Un cop arreglats els punts 2.1 a 2.5, la colleccio encara s'assentava uns 10 px.
La investigacio (amb instrumentacio, no a cop d'ull) va descartar, una a una:

- el bucle de punt fix de `pushDownPx` (canviar el `setTimeout` per un
  `requestAnimationFrame` no ho arregla);
- l'alcada de fila `rowHeight`, que era un estat mesurat -ara es calcula:
  `carril x 0.0280625 - 2.875`, validat a 540, 720 i 900 px-;
- `--appHeaderOffset`, que val **156 px des del primer render i no canvia mai**
  (instrumentats els seus quatre termes: base 116, ofertes 0, banner 40, ruler 0);
- el `padding-top` del `<main>`, constant a 156 px;
- la hero, que te alcada constant (868 px) i marges constants.

El que si que passava: **el fill de `<main>` arrencava a 166 px i lliscava fins a
156**. La causa era la transicio de pagina de `src/routes/AppRoutes.jsx`:

```js
const pageTransition = {
  initial: { opacity: 0, y: 10 },   // <-- aquests 10 px
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
};
```

Cada ruta es muntava 10 px avall i hi lliscava (framer-motion ho escriu com
`opacity: 0; transform: translateY(10px); transition: all`), i allo movia TOT el
contingut a cada muntatge: colleccions, PDP i inici.

**Arreglat** (commit `daf9865`): s'ha tret el desplaçament i s'ha deixat el fons
(l'opacitat). Mateixa sensacio d'entrada, zero moviment.

---

## 3. Mapa del que s'ha de refer

| peça | línies | què porta a dins |
|---|---|---|
| `src/components/FullWideSlideHeader.jsx` | **3.340** | 44 efectes (36 `useEffect` + 8 `useLayoutEffect`) i 8 mesures de layout |
| `src/pages/CollectionAustenPage.jsx` | 625 | 7 estats de mesura |
| `src/pages/CollectionCubePage.jsx` | 582 | ídem |
| `src/pages/CollectionFirstContactPage.jsx` | 591 | ídem |
| `src/pages/CollectionMiscellaniaPage.jsx` | 592 | ídem |
| `src/pages/CollectionTheHumanInsidePage.jsx` | 611 | ídem |
| `src/components/home/TramFinal.jsx` | 147 | pòster + subtítol + rail |
| `src/components/layout/SiteFrame.jsx` | 90 | el marc (aquest ja està bé) |

Les cinc pàgines de col·lecció són quasi idèntiques: entre elles només difereixen en 125-265 línies de ~600 (comparació ignorant els dígits). Són unes **2.400 línies duplicades**.

Qui fa servir el header: `App.jsx`, `FullWideSlideHeaderMegaMenuContained.jsx`, `LoadingScreen.jsx`, `FullWideSlidePage.jsx`, les cinc pàgines de col·lecció, `ConstructorColleccioPage.jsx`, `PlantillaCatalegComponentsPage.jsx`, `dev/BeltReferenceOverlay.jsx`.

Els 7 estats de mesura de cada pàgina de col·lecció: `heroBandTopPx`, `heroBottomBandTopPx`, `heroIconsTopPx`, `posterExtraPx`, `pushDownPx`, `rowHeight`, `zeroLeftOffsetPx`.

---

## 4. El pla, en tres etapes

### Etapa A — Un sol model de layout, pur i síncron

**Objectiu**: que cap mida de layout surti de mesurar el DOM. Totes han de ser funcions pures de (amplada, alçada, banderes de ruta).

**Què s'ha fet ja** (commit `fa4163c`):

- `src/utils/layoutModel.js` (nou): `deviceLayoutFromViewport(vw, vh)`, `headerHeightFor(deviceLayout)`, `siteFrameForViewport({vw, vh, rulerInset})`, `computeLayoutModel({...})`, `publishLayoutModel(model)`.
- `App.jsx` i `SiteFrame.jsx` ja el fan servir.
- **Provat i descartat**: publicar el model abans que React munti. No pot saber si hi ha ofertes ni banners, publicava 116 px quan el valor bo és 156 px, i **creava** un salt de 40 px. Està documentat al mateix fitxer perquè no es torni a intentar.

**Què queda per fer a l'Etapa A**:

1. Migrar els 7 estats de mesura de cada pàgina de col·lecció al model (o eliminar-los si el càlcul és directe). Ja fets: `rowHeight` (calculat a les cinc pàgines, `carril x 0.0280625 - 2.875`). Candidats que queden: `heroBandTopPx`, `heroIconsTopPx` i `heroBottomBandTopPx` (es poden expressar amb `calc()` sobre `--appHeaderOffset` i l'alçada de la finestra, com ja s'ha fet amb la hero), `posterExtraPx` i `pushDownPx` (depenen de quantes files té la graella: és un càlcul, no una mesura), `zeroLeftOffsetPx`.
2. ~~Esbrinar el desplaçament residual~~ **FET**: era la transició de pàgina (punt 2.6).
3. Passar el header a llegir el model (les seves 8 mesures) — això és el pont cap a l'Etapa C.

**Risc**: mitjà. Cada estat que es treu és un càlcul que ha de donar exactament el mateix número. La mitigació és verificar vista per vista amb traces (vegeu el punt 5).

### Etapa B — Una sola pàgina de col·lecció

**Objectiu**: els cinc fitxers es converteixen en un component amb paràmetres.

**Proposta d'interfície**:

```jsx
<CollectionPage
  slug="austen"
  nom="AUSTEN"
  imatgeHero="/placeholders/hero/...jpg"
  frasesPoster={[...]}          // el text gran de TramFinal
  seccions={[...]}              // les files de fitxes, amb els seus títols
  separacions={{ heroTdp: '338px', ... }}
  menuColleccions={COLLECTIONS_MENU}
/>
```

**Què s'ha de conservar** (verificat una a una a cada fitxer abans de fusionar):

- L'alçada de la hero (ja en CSS) i la franja blanca que toca el separador del header.
- Les icones de col·lecció i la seva posició de pantalla.
- La graella de fitxes (files, `rowHeight`, offsets).
- El `TramFinal`: pòster, subtítol "ALTRES HISTÒRIES" i rail.
- Les diferències reals entre col·leccions: Austen té més files (té `posterExtraPx`), i les frases del pòster i les imatges són diferents a cada una.

**Risc**: mitjà-alt (és fusionar cinc pàgines que avui funcionen). **Mitigació**: fer-ho d'una col·lecció en una, començant per la més simple, i comparar captures abans/després de cada una; deixar l'antiga al costat fins que la nova doni el mateix.

### Etapa C — El header, refet sobre el model

**Objectiu**: eliminar les 8 mesures i els efectes que les alimenten, i que el header es dimensioni **només** amb el model.

**Com, en passos petits (no una reescriptura de 3.340 línies d'un cop)**:

1. Inventariar les mesures i classificar-les. **FET (ronda 11)**. N'hi ha set, i aquesta es la classificacio:

   | mesura | linia | que es | classe |
   |---|---|---|---|
   | `setMegaHeroRowHeight` | 2235 | alcada de la fila de la hero del megaslide (24 files sobre l'alcada d'una graella) | **(a) calculable** (mateixa formula que `rowHeight` de les colleccions: carril x 0.0280625 - 2.875) |
   | `setMegaInsetsPx` | 2362 | marges interiors del megaslide | **(a) calculable** (deriva del carril i del marc) |
   | `setBleedGuardExpandPx` | 417 | expansio esquerra/dreta del "bleed guard" | **(a) calculable** (deriva del marc del lloc) |
   | `setRootRemPx` | 2820 | mida base `rem` de l'aplicacio | **(a) calculable** (es una funcio de l'amplada; de fet ja te el fallback 16) |
   | `setStripeRowPadPx` | 1967 | padding vertical de la filera de la franja | **(b) depen de contingut** (alcada real de les targetes) |
   | `setStripeRowPadXPx` | 1970 | padding horitzontal de la filera de la franja | **(b) depen de contingut** |
   | `setLockBtnTop` | 2025 | posicio vertical del cadenat | **(b) depen de posicio** (penja d'un ancoratge del DOM) |

   Es a dir: **quatre de les set son calculables** i son les candidates a passar al
   model; les tres restants depenen de contingut o d'ancoratges i s'han de quedar
   (pero s'han de poder mesurar **abans del pintat**, amb `useLayoutEffect`).
2. Substituir les de tipus (a) pel model, una a una, verificant.
3. Un cop no en quedi cap, simplificar el JSX que les consumia i treure els efectes morts.
4. Al final, avaluar si val la pena reescriure el fitxer sencer o si ja ha quedat net.

**Risc**: alt. Per això va **al final**, amb A i B validats, i amb el header funcionant a totes les rutes que el fan servir.

---

### Estat de la verificacio (ronda 10)

Traces fetes amb 20-24 mostres cada 120 ms a 768 px. **Un sol estat vol dir que
la pagina no es mou.** Resultat actual:

| vista | estats |
|---|---|
| colleccio /austen | 1 |
| colleccio /cube | 1 |
| colleccio /first-contact | 1 |
| colleccio /miscellania | 1 |
| colleccio /the-human-inside | 1 |
| PDP /austen/keep-calm | 1 |
| inici / | 1 |
| megaslide (austen i cube) | 1 |
| constructor/colleccio | 1 |

I tambe a 1280 i 1440 px a la colleccio. O sigui: **el moviment del layout esta
eliminat** a tot allo que s'ha pogut mesurar. El que queda de l'objectiu es
refer (etapes B i C), no arreglar moviment.

## 5. Protocol de verificació (igual a cada etapa)

1. `npx vitest run` → 462 proves, 38 fitxers, tot verd.
2. `npm run compara-vistes` → vertical i horitzontal donen les mateixes mides (tolerància 0,5 / 1,5 px).
3. `npx vite build` → compila.
4. **Traces al navegador**: per a cada combinació de 768, 1024, 1280, 1440 i 1920 px, en vertical, horapaisada i escriptori, mostrejar cada 150 ms durant 3,5 s i comprovar que cada element té **un sol estat** (que no es mou). Aquest és el criteri que defineix "arreglat".
5. Captura abans/després de les vistes que es toquin, desades a `docs/comparacio/` (gitignored).

## 6. Criteri d'èxit

L'objectiu estarà acomplert quan, a les traces del punt 5, **cap element tingui més d'un estat** a cap de les quinze combinacions, i les 462 proves i `compara-vistes` segueixin verds.

---

## 7. Preguntes al revisor (RESPOSTES a la seccio 8)

1. **L'ordre de les etapes** (A → B → C). Alternativa: B abans d'A, perquè B toca codi més fàcil i A és més fina.
2. **El disseny del model** (`utils/layoutModel.js`): funcions pures + publicació amb `useLayoutEffect` a App. És raonable, o hi ha una manera més robusta de garantir que el primer pintat ja tingui els números bons quan hi ha ofertes i banners (que depenen de dades)?
3. **La fusió de les cinc pàgines de col·lecció**: un sol component amb paràmetres, o millor un component base + variants? Hi ha risc de perdre diferències subtils entre col·leccions.
4. **El header**: reescriure'l o netejar-lo per passos? El meu pla diu per passos (punt 4, Etapa C); vull confirmació o correcció.
5. **El que queda de l'Etapa A**: dels set estats de mesura de cada pàgina de col·lecció, `rowHeight` ja està calculat; els altres sis (`heroBandTopPx`, `heroIconsTopPx`, `heroBottomBandTopPx`, `posterExtraPx`, `pushDownPx`, `zeroLeftOffsetPx`) encara es mesuren. Val la pena convertir-los tots, o n'hi ha que és més sa deixar mesurats (mesurant sempre abans del pintat)?

---

## 8. Verificació independent del pla (22/09/2026)

El codi s'ha tornat a verificar punt per punt contra aquest document. Resultat: **tots els commits citats existeixen i totes les correccions descrites són aplicades** (model `layoutModel.js` present, `heroHeightPx` eliminat i CSS pur a les cinc pàgines, `pageTransition` sense desplaçament, `rowHeight` calculat amb `carril * 0.0280625 - 2.875` a les cinc pàgines, `FullWideSlideHeader.jsx` amb 3.340 línies). La comparació, però, ha destapat **tres forats que el pla no cobreix**:

### 8.1 Hi ha un segon header mort: `MainHeader.jsx` (1.116 línies)

El pla parla del `FullWideSlideHeader` com l'únic header a refer, però `src/components/MainHeader.jsx` **no és importat enlloc del projecte**: és codi mort, igual que `useRouteLayout.js` (punt 2.5). Abans de començar l'Etapa C cal decidir si s'esborra: si algú el "reviu", tornaria a portar mesures propies i duplicaria el sistema de mides.

### 8.2 Ja existeix una pàgina de col·lecció genèrica, i l'Etapa B no en parla

`src/pages/CollectionPage.jsx` (285 línies) + `src/config/collections.js` (les 5 col·leccions amb `collectionSlug`, `productSlugs`, texts i SEO) + `ProductGrid` és, de facto, la versió anterior del component amb paràmetres que l'Etapa B proposa crear. Cal decidir:

1. Si aquesta ruta encara és viva o és un altre codi mort.
2. Si la fusió de les cinc pàgines es fa **sobre** aquesta base (ampliant-la amb hero/pauta/TramFinal) o si se n'ignora i es crea de nou.

És una decisió que afecta directament la pregunta 3 del punt 7 i que el revisor hauria de tenir al abast.

### 8.3 Risc residual no documentat: `getSafeBelt()` a les pàgines

A les cinc pàgines de col·lecció, `carrilAmple` ve de `getSafeBelt().width` amb `try/catch` i fallback 540. Però `getSafeBelt()` **prioritza `--belt2-*`** (les variables que només publica l'overlay de dev) quan són vàlides — el mateix problema del punt 2.1, però ara a nivell de pàgina en lloc de dins del rail: el `rowHeight` (i per tant la posició de la hero) pot diferir entre dev i producció. És el candidat següent a migrar al `layoutModel`, abans o dins de l'Etapa A.

### Conseqüències per al pla

- **Etapa A**: afegir-hi la migració de `carrilAmple`/`getSafeBelt()` de les cinc pàgines al model (8.3).
- **Etapa B**: resoldre abans la relació amb `CollectionPage.jsx` + `config/collections.js` (8.2).
- **Etapa C**: afegir-hi l'eliminació (o arxiu explícit) de `MainHeader.jsx` (8.1).
- **Punt 7 (preguntes al revisor)**: la pregunta 3 hauria d'incloure la decisió de 8.2; i n'apareix una de nova: què fem amb el codi mort (`MainHeader.jsx`, `useRouteLayout.js`)?

---

## 8. Revisió externa (GLM 5.3 flash) i pla d'execució

**Veredicte**: PLA APROVAT amb **4 esmenes obligatòries** i 2 recomanacions. Les
sis causes del punt 2 són reals i el document i el codi quadren. Ordre A → B → C
confirmat. Les esmenes afegeixen feina, no la substitueixen.

### 8.1 Respostes a les preguntes del punt 7

1. **Ordre A → B → C: confirmat.** Fer B primer obligaria a tornar a tocar la
   pàgina acabada de fusionar (les cinc llegirien encara `getSafeBelt()` i les
   variables tardanes).
2. **Model: aprovat amb matís.** Ofertes i banners són **estats asíncrons**: la
   solució és reservar l'espai (pitjor cas o *skeleton* de la mateixa alçada) i
   acceptar **un sol recol·locament, sense transicions** — mai avançar la
   publicació abans de React (ja provat i descartat, correctament). Cal afegir
   `laneForViewport(vw)` i que **cap codi de producció llegeixi mai més
   `--belt2-*`** (esmena A1).
3. **Fusió: aprovada amb dues decisions prèvies** (B1 i B2).
4. **Header: neteja per passos confirmada** (no reescriptura), amb l'esmena C1.
5. **Estats pendents: conversió selectiva** (vegeu 8.3).

### 8.2 Esmenes obligatòries

- **A1 — `laneForViewport`.** `getSafeBelt()` prioritza `--belt2-*` (només DEV):
  és el mateix tipus de bug que el 2.1 i avui encara fa `dev != producció` al
  `rowHeight` i a la posició de la hero de les cinc col·leccions. Convertir-ho al
  model i no llegir mai més aquestes variables. **FET** (commit `d2e87b2`),
  amb l'equivalència verificada a 768/1024/1280/1440/1920 px (risc R1).
- **B1 — `CollectionPage.jsx` no és la base.** És viva, però **només** a
  `/lab/proves` (`SupabaseCollectionRoute`, `AppRoutes.jsx:131`): no és ruta
  pública i no té hero, pauta, `TdpPage` ni `TramFinal`. L'Etapa B es fa sobre
  **codi nou** i **no toca `/lab/proves`** (abast separat).
- **B2 — `CollectionMobile` fora de la fusió.** Les cinc pàgines el renderitzen
  per a mòbil; ja és únic i parametritzat. La fusió és de la **vista vertical**.
  Cal parametritzar també les diferències per vista que el pla no esmentava:
  els marges `-30px` / `-120px` del `marginTop` de la graella segons
  `esTauletaApaisada` / vertical.
- **C1 — `MainHeader.jsx` mort.** 1.116 línies sense cap import: eliminar-lo en
  un commit propi **abans** de començar l'Etapa C. **FET** (commit `040ce4f`),
  juntament amb `useRouteLayout.js`.

### 8.3 Conversió selectiva dels estats (pregunta 5)

Es converteix a càlcul el que és **geometria pura** (només viewport i carril) i
es deixa **mesurat amb `useLayoutEffect`** el que depèn del contingut real:

| estat | decisió |
|---|---|
| `rowHeight` | fet (càlcul) |
| `carrilAmple` | **convertit al model** (A1, fet) |
| `heroBandTopPx`, `heroIconsTopPx`, `heroBottomBandTopPx` | convertir a `calc()` sobre `--appHeaderOffset` i `100vh` |
| `posterExtraPx`, `pushDownPx` | convertir a càlcul sobre el nombre de files (dada del config); el bucle de punt fix amb `setTimeout` desapareix |
| `zeroLeftOffsetPx` | **es queda mesurat**, però amb `useLayoutEffect` (depèn de la posició real del logotip) |

### 8.4 Riscos nous que afegeix la revisió

- **R1** — Migrar `carrilAmple` toca el `rowHeight` de les cinc pàgines alhora:
  verificar l'equivalència a cinc mides **abans** del canvi i fer-ho en un commit
  revertible. **Mitigat** (valors idèntics a les cinc mides).
- **R2** — La fusió (B) amb framer-motion: les animacions i els *delays* han de
  quedar **per col·lecció com a paràmetre**, no duplicats; si no, el primer
  commit de B treu diferències visuals que el "compara-captures" no detecta (són
  transicions, no estats finals).
- **R3** — El criteri "un sol estat" no mesura el **temps**: dues passades
  idèntiques a 100 ms compleixen el criteri i l'ull encara veu el salt. A les
  traces cal **enregistrar el timestamp** de cada canvi i exigir que, un cop
  estabilitzat, no n'hi hagi cap després del primer frame (~50 ms).

### 8.5 Checklist d'execució

```
Pre-etapes
  [x] E1. Eliminar MainHeader.jsx i useRouteLayout.js            (040ce4f)
  [ ] E2. Decidir el desti de /lab/proves i CollectionPage.jsx
          (es queda com a eina de lab o s'elimina; NO es base de B)

Etapa A (cua ampliada)
  [x] A1. laneForViewport(vw) al model + carrilAmple de les 5     (d2e87b2)
  [ ] A2. heroBandTopPx / heroIconsTopPx / heroBottomBandTopPx -> calc()
  [ ] A3. pushDownPx / posterExtraPx -> calcul sobre nombre de files
  [ ] A4. zeroLeftOffsetPx -> useLayoutEffect
  (El punt 3 del pla, "passar el header al model", passa a ser
   l'inici de l'Etapa C, no de l'A.)

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

Verificacio a cada pas: protocol del punt 5 + traces amb timestamps (R3).
```
