# Estat del projecte: header i col·leccions

**Data**: 22 de setembre de 2026
**Abast**: des del començament dels canvis fins ara (inclou A3)
**Font de veritat del pla**: `docs/informes/PLA-header-i-colleccions.md`
**Revisió externa**: GLM 5.3 flash, incorporada al pla (secció 8)

---

## 1. Resum en tres línies

El moviment del layout (el "tremolor") **està eliminat i verificat** a tot el que
s'ha pogut mesurar. El que queda de l'objectiu és **refer** les peces (etapes B i
C), no arreglar moviment. Dels quatre passos de l'Etapa A, **A1, A2 i A3 estan
fets** i **E2 està decidit**. Queda **A4**. L'arbre és net i tot està pujat a
`origin/main` llevat de la feina d'A3.

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
- **B1** — `CollectionPage.jsx` **no** és la base de la fusió: només vivia a
  `/lab/proves`. L'Etapa B es fa sobre codi nou. → **E2 decidit: eliminat**
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
  [x] E2. Decidit: /lab/proves, CollectionPage.jsx i companyia FORA
          (es queda com a eina de lab o s'elimina; NO es base de B)

Etapa A (cua ampliada)
  [x] A1. laneForViewport(vw) al model + carrilAmple de les 5     (d2e87b2)
  [x] A2. heroBandTopPx / heroIconsTopPx / heroBottomBandTopPx -> calc()
                                                                  (fb9b8a4, 4f82371)
  [x] A3. pushDownPx / posterExtraPx -> calcul sobre nombre de files
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

Estat real després d'A1, A2 i A3:

| estat | decisió del revisor | estat |
|---|---|---|
| `rowHeight` | càlcul | **fet** (les cinc pàgines) |
| `carrilAmple` | al model | **fet** (A1) |
| `heroBandTopPx` | `calc()` | **fet** (A2, eliminat) |
| `heroIconsTopPx` | `calc()` | **fet** (A2, eliminat) |
| `heroBottomBandTopPx` | `calc()` | **fet** (A2, eliminat) |
| `pushDownPx` | càlcul sobre el nombre de files | **fet** (A3: mesurat abans del pintat + variable CSS) |
| `posterExtraPx` | càlcul sobre el nombre de files | **fet** (A3: càlcul pur) |
| `zeroLeftOffsetPx` | es queda mesurat, però amb `useLayoutEffect` | **pendent (A4)** |

El `setTimeout(mesura, 300)` ja **no existeix** a cap de les cinc pàgines.

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
| `aa7e529` | Pla en text pla, per copiar (documentació del pla) |
| `b3f7128` | Pla: secció 8, verificació independent del pla |
| `f8f7e69` | Pla: revisió externa de GLM 5.3 flash |
| `fb9b8a4` | **Esmena A2**: les tres mides de la hero, a `calc()` |
| `4f82371` | **A2 (correcció)**: les icones tornen a la seva posició |
| `de2e26b` | Informe d'estat (aquest document, primera versió) |
| `(A3)` | **Esmena A3**: `pushDownPx` i `posterExtraPx`; fora el bucle de punt fix i el `setTimeout` |

---

## 9. E2 — Decidit: `/lab/proves` i companyia, FORA (ronda 13)

`src/pages/CollectionPage.jsx` (285 línies) era una pàgina de col·lecció genèrica
que no tenia hero, ni pauta, ni `TdpPage`, ni `TramFinal`: una llista de catàleg
que llegia la col·lecció de Supabase. El revisor va dir que **no és base de la
fusió**, i la decisió presa és **eliminar-la**:

| què | estat |
|---|---|
| `src/pages/SupabaseCollectionRoute.jsx` | **esborrat** |
| `src/pages/CollectionPage.jsx` | **esborrat** |
| `src/config/collections.js` | **esborrat** |
| ruta `/lab/proves` | **fora** d'`AppRoutes.jsx` |
| redirecció `/proves` → `/lab/proves` | **fora** |
| entrada de `/lab/proves` a `pagesManifest.js` | **fora** |
| enllaços des de `/lab`, `/lab/demos` i `/lab/wip` | **fora** |

Comprovat abans d'esborrar que res mes no en penjava: `ProductGrid` i
`FullBleedUnderHeader` (que `CollectionPage` feia servir) tenen consumidors propis
i es queden. Efecte col·lateral positiu: el bundle principal baixa
d'aproximadament 514 kB a 479 kB.

**Verificacio**: 462 proves / 38 fitxers, `compara-vistes` OK, `vite build` OK, i
rutes comprovades al navegador (`/lab`, `/lab/demos` i `/lab/wip` responen;
`/lab/proves` i `/proves` ja no existeixen; cap error de consola).

**Nota**: la ruta `/lab/proves` no passava per `ProtectedRoute` (era pública a
produccio). Amb l'eliminacio, aquest forat desapareix tambe.

---

## 10. Següent pas immediat: A4

**Objectiu**: `zeroLeftOffsetPx` (la posicio del "00" respecte del logotip GRAFC)
es queda **mesurat**, però ha de passar a un `useLayoutEffect` perquè el valor hi
sigui **abans del pintat**.

Avui es mesura en un `useEffect` amb un bucle de `requestAnimationFrame` que
espera que existeixin el logotip i la graella. El canvi és el mateix patró que A2
i A3: publicar el número abans del pintat i eliminar la cursa.

**Verificació que tocarà**: el protocol del punt 7 sencer, més l'equivalència amb
el commit d'A3 a les cinc amplades.

---

## 10b. A3 fet: què ha canviat (ronda 13)

**`posterExtraPx` (Austen) → càlcul pur.** Era
`Math.round(getSafeBelt().width * 0.857)` dins de l'efecte; ara és
`Math.round(carrilAmple * 0.857)` en el render. Fora l'estat i fora la mesura.
Verificat a les cinc mides: 463 / 617 / 771 / 868 / 1157 px, exactament igual.

**`pushDownPx` → mesurat ABANS del pintat i publicat com a variable CSS.** La
comprovació descarta el càlcul pur: depèn de l'alçada de la finestra i de la
posicio natural de la graella (files fixes amb pitch variable), i la graella
també es mou amb el desplaçament aplicat. Es queda com a mesura, però:

- al `useLayoutEffect` que ja hi era (**abans del pintat**);
- publicada com a `--hg-push-down`, sense re-render de React ni estat nou;
- **sense el bucle de punt fix** (`base = topActual - prev`);
- **sense el `setTimeout(mesura, 300)`**.

Verificat contra el commit d'A2: la posicio de la primera TDP i el marge del
TramFinal són idèntiques a 768/1024/1280/1440/1920 px (999,52 / 1349,19 / 790,88
/ 923,75 / 1179,33 px). Traces amb timestamps, ara vigilant també la TDP i el
TramFinal: cap canvi d'estat.

---

## 11. Annex: observacions de la verificació independent (22/09/2026)

Aquest annex afegeix el que la segona revisió del codi (contra aquest document)
ha trobat. No canvia cap conclusió: el progrés descrit és real i el quadre del
punt 5 és exacte.

### 11.1 Correccions de dades

1. **"2 commits pendents de pujar" ja no és cert.** En el moment d'escriure
   l'informe ho era; ara `main` i `origin/main` estan al mateix commit
   (`de2e26b`): tot pujat. Aquest document inclòs.
2. **La taula de commits (punt 8) omet tres commits d'aquesta tongada**:
   `aa7e529` (pla en text pla), `b3f7128` (secció 8 del pla, verificació
   independent) i `f8f7e69` (revisió externa GLM).

### 11.2 A3 ja està començat: fitxers temporals sense tracció

Hi ha sis fitxers temporals nous al workspace, no commitejats:
`scripts/_tmp-a3-base.mjs`, `_tmp-a3-deriva.mjs`, `_tmp-a3-poster.mjs`,
`_tmp-a3-poster2.mjs`, `_tmp-a3.cssvar.mjs` i `_tmp-mesura-a3.mjs`. Són sondes
de mesura per a A3 (el treball ja ha començat). Quan A3 es tanqui cal
decidir-ne el destí: netejar-los o convertir-ne algun en mesura permanent.

### 11.3 Risc tècnic nou d'A1, pendent de tancar a A3: `carrilAmple` en resize

El codi nou d'A1 a les cinc pàgines és:

```js
const [carrilAmple] = useState(() => laneForViewport());
```

Abans `carrilAmple` es recalculava (l'efecte de mesura escoltava el resize);
ara **queda congelat al valor del primer render**: no hi ha setter ni
observador. En redimensionar la finestra (o girar una tauleta), `rowHeight` i la
posició de la hero no s'actualitzaran fins a una recàrrega.

Potser és una decisió deliberada (el resize complet pot recarregar la vista
vertical), però no està documentada. **A3 l'ha de tancar explícitament**, d'una
de les dues maneres:

1. Documentar que `carrilAmple` és intencionadament fix (i per què), o
2. Derivar-lo d'una variable que sí que s'actualitza (per exemple recalcular
   dins el mateix `useLayoutEffect` que ja publica `--hg-hero-top`, que sí que
   s'executa en resize).

Si s'opta per la 2, cal verificar amb traces que no reintrodueix cap moviment
al girar la tauleta (l'escenari original del problema).

> **RESOLT** (ronda 13): s'ha triat la sortida 2 i s'ha verificat. Vegeu el
> punt 12.3. Els punts 11.1 i 11.2 també estan resolts (punt 12.1 i 12.2).

---

## 12. Resolució dels tres punts de l'annex (ronda 13)

### 12.1 Correccions de dades — fetes

- **"2 commits pendents de pujar"**: era cert quan es va escriure l'informe; ara
  `main` i `origin/main` van al mateix commit. Els punts 1 i 8 d'aquest document
  ja ho diuen.
- **La taula de commits (punt 8)**: hi falten… ja no hi falten. S'hi han afegit
  `aa7e529` (pla en text pla), `b3f7128` (secció 8, verificació independent) i
  `f8f7e69` (revisió externa GLM). Eren commits de **documentació del pla**, no
  de codi, i per això no sortien a la llista de la feina d'execució; s'hi han
  posat amb aquesta nota.

### 12.2 Sondes temporals d'A3 — decidit: s'esborren

El destí de les sondes és **esborrar-les**, tal com mana la regla de la casa
(`scripts/_tmp-*` s'esborren en acabar). No se'n converteix cap en mesura
permanent perquè l'stack de verificació permanent ja existeix i és més bo:

- `scripts/compara-vistes.mjs` (l'única comprovació que queda al repositori);
- `npx vitest run`;
- les traces amb timestamps, que es tornen a escriure a cada pas quan calen.

A3 es dona per tancat, així que les sondes d'A3 s'han eliminat.

### 12.3 `carrilAmple` en resize — tancat amb la sortida 2

S'ha triat la **sortida 2** (recalcular-lo), que és la que conserva el
comportament anterior a A1:

```js
const [carrilAmple, setCarrilAmple] = useState(() => laneForViewport());
// dins del mateix useLayoutEffect que ja publica --hg-hero-top:
const sincronitzaCarril = () => {
  const nou = laneForViewport();
  setCarrilAmple((prev) => (Math.abs(prev - nou) < 0.5 ? prev : nou));
};
const onResize = () => { mesura(); sincronitzaCarril(); };
window.addEventListener('resize', onResize);
```

`laneForViewport()` depen **nomes de l'amplada**, i s'ha comprovat que dona el
mateix número a les tres classes de dispositiu (600→422, 768→540, 1024→720,
1280→900, 1440→1013, 1920→1350; no hi ha cap salt a 1366/1367). Per tant el
recalcul no pot introduir cap canvi de dispositiu sobtat.

**Verificació de l'avís** (que la sortida 2 no reintrodueixi moviment al girar la
tauleta), amb traces cada 40 ms:

| escenari | resultat |
|---|---|
| Només canvia l'alçada (768x1024 → 768x900) | **cap moviment** (107,4 → 107,4) |
| Canvia l'amplada (768x1024 → 1024x768) | s'assenta en **una** passa (67,1 → 63,0) i ja no es mou més |
| Tornar a girar (1024x768 → 768x1024) | s'assenta en **una** passa (113,4 → 107,4) i ja no es mou més |

És a dir: la posició final és la correcta i estable; el que es veu en girar és la
recomposició del viewport, no un moviment de layout que s'arrossegui.

**Nota**: el muntatge (el cas que defineix "arreglat") continua amb **un sol
estat** a totes les combinacions, verificat després d'aquest canvi.
