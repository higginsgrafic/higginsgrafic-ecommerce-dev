# Pla per refer el header i la pàgina de col·lecció

**Data**: 22 de setembre de 2026
**Autor**: l'agent
**Per a**: revisió externa (GLM 5.3 flash) abans de continuar
**Objectiu**: refer de zero el header (`FullWideSlideHeader` i el seu sistema de mides) i la pàgina de col·lecció (hero + graella + TramFinal), mantenint el resultat visual i les funcions actuals, i eliminant les causes del moviment del layout.

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

### 2.6 El que encara no està explicat

Al punt on som, el moviment de la col·lecció ha baixat de 40 px a 0-10 px segons la vista, i **queda un desplaçament vertical residual** que encara no he sabut atribuir amb certesa (el rail té l'alçada fixa, 658 px, i tot i així puja 40 px en dos passos perquè un bloc de sobre seu s'encongeix 30 px). Aquest és el candidat número u a investigar a l'Etapa A.

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

1. Migrar els 7 estats de mesura de cada pàgina de col·lecció al model (o eliminar-los si el càlcul és directe). Candidats clars: `rowHeight` (es pot derivar de l'amplada del marc), `heroBandTopPx`, `heroIconsTopPx` i `heroBottomBandTopPx` (es poden expressar amb `calc()` sobre `--appHeaderOffset` i l'alçada de la finestra, com ja s'ha fet amb la hero), `posterExtraPx` i `pushDownPx` (depenen de quantes files té la graella: és un càlcul, no una mesura), `zeroLeftOffsetPx`.
2. Esbrinar el desplaçament residual de 30 px del bloc de sobre del rail (punt 2.6).
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

1. Inventariar les 8 mesures i classificar-les: (a) les que es poden calcular (passar al model), (b) les que depenen de contingut de veritat (text de l'usuari, imatge) i per tant s'han de quedar.
2. Substituir les de tipus (a) pel model, una a una, verificant.
3. Un cop no en quedi cap, simplificar el JSX que les consumia i treure els efectes morts.
4. Al final, avaluar si val la pena reescriure el fitxer sencer o si ja ha quedat net.

**Risc**: alt. Per això va **al final**, amb A i B validats, i amb el header funcionant a totes les rutes que el fan servir.

---

## 5. Protocol de verificació (igual a cada etapa)

1. `npx vitest run` → 462 proves, 38 fitxers, tot verd.
2. `npm run compara-vistes` → vertical i horitzontal donen les mateixes mides (tolerància 0,5 / 1,5 px).
3. `npx vite build` → compila.
4. **Traces al navegador**: per a cada combinació de 768, 1024, 1280, 1440 i 1920 px, en vertical, horapaisada i escriptori, mostrejar cada 150 ms durant 3,5 s i comprovar que cada element té **un sol estat** (que no es mou). Aquest és el criteri que defineix "arreglat".
5. Captura abans/després de les vistes que es toquin, desades a `docs/comparacio/` (gitignored).

## 6. Criteri d'èxit

L'objectiu estarà acomplert quan, a les traces del punt 5, **cap element tingui més d'un estat** a cap de les quinze combinacions, i les 462 proves i `compara-vistes` segueixin verds.

---

## 7. Coses que vull que revisi el revisor

1. **L'ordre de les etapes** (A → B → C). Alternativa: B abans d'A, perquè B toca codi més fàcil i A és més fina.
2. **El disseny del model** (`utils/layoutModel.js`): funcions pures + publicació amb `useLayoutEffect` a App. És raonable, o hi ha una manera més robusta de garantir que el primer pintat ja tingui els números bons quan hi ha ofertes i banners (que depenen de dades)?
3. **La fusió de les cinc pàgines de col·lecció**: un sol component amb paràmetres, o millor un component base + variants? Hi ha risc de perdre diferències subtils entre col·leccions.
4. **El header**: reescriure'l o netejar-lo per passos? El meu pla diu per passos (punt 4, Etapa C); vull confirmació o correcció.
5. **El punt 2.6** (el residual de 30 px): tinc la sospita que ve del `Pauta4ColsOverlay`, però no ho he confirmat. Qualsevol idea de per on atacar-ho serà benvinguda.
