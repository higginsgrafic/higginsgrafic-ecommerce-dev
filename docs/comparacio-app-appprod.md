# Comparació `App.jsx` / `AppProd.jsx`

**Data:** 2026-09-12
**Estat:** anàlisi, sense cap modificació feta.

---

## El resum en cinc línies

| | `App.jsx` | `AppProd.jsx` |
|---|---|---|
| Línies | 330 | 257 |
| Commits que l'han tocat | **69** | 12 |
| Qui el carrega | `main.jsx` (desenvolupament) | `main-prod.jsx` (producció) |
| Té la part mòbil | **Sí** | No |
| Té els títols SEO per defecte | No | **Sí** |

Línies diferents: **326** de 587.

**La conclusió important:** cap dels dos no és superior a l'altre. **Cadascun té
coses que l'altre ha perdut.** Esborrar un i quedar-se l'altre faria
desaparèixer funcionalitat real.

I la direcció de la deriva és clara: `App.jsx` és el que es desenvolupa (69
commits), i `AppProd.jsx` n'és un derivat que s'actualitza de tant en tant (12).
Les coses que `AppProd` té i `App` no van ser afegides directament a producció i
**mai es van tornar a portar a l'original**.

---

## A. El que NOMÉS té `App.jsx`

Si es fes servir `AppProd.jsx`, això desapareixeria:

| # | Què | On | Impacte |
|---|---|---|---|
| A1 | **Els tres components mòbils**: `BottomTabBar`, `CollectionIconsBar`, `MobileCercadorSheet` | línies 282-284 | **Alt**: en producció la barra inferior del mòbil no es renderitza gens |
| A2 | `DebugLayer` (carregat a demanda) | línia 294 | Mitjà: eines de desenvolupament i inspecció |
| A3 | `useTransition` + `deferredLocation` | inici del cos | Baix-mitjà: navegació diferida, millora de fluïdesa |
| A4 | `debugState` i el `rulerInset` aplicat a tots els offsets de capçalera | varis | Mitjà: la regla de mesura deixa de descomptar-se |
| A5 | `devHeaderVisible` i `heroSettingsDevHeaderHeight` | varis | Baix: capçalera de les eines de desenvolupament |
| A6 | `getTotalPrice`, `removeFromCart`, `updateSize` del context | destructuring | Cal comprovar si s'usen |

**A1 és el més greu.** Producció no té la barra inferior del mòbil perquè
`AppProd.jsx` no la importa ni la renderitza.

---

## B. El que NOMÉS té `AppProd.jsx`

Si es fes servir `App.jsx`, això desapareixeria:

| # | Què | Impacte |
|---|---|---|
| B1 | `<Helmet defaultTitle="GRAFC - Samarretes Premium…" titleTemplate="%s \| GRAFC" />` | **Alt**: són els títols per defecte que veuen Google i les pestanyes del navegador |
| B2 | La branca `shouldRedirect` amb pantalla negra mentre es redirigeix | Mitjà: evita veure un flaix de contingut equivocat |
| B3 | Condicions més estrictes a la pantalla de càrrega (`&& !isFullScreenRoute && !shouldRedirect`) | Mitjà: menys pantalles de càrrega innecessàries |
| B4 | `<AdminBanner rulerInset={0} />` amb el valor explícit | Baix: cal comprovar com ho fa `App.jsx` |

**B1 és el més important.** `App.jsx` no té cap `Helmet`: si unifiquéssim cap a
`App.jsx` sense més, **es perdrien els títols SEO de tot el lloc**.

---

### ⚠️ ACTUALITZACIÓ (12/09/2026, després d'aplicar-ho)

**B2 va resultar ser un consell equivocat.** Es va portar la branca
`shouldRedirect` (pantalla negra) a `App.jsx`, i això **va deixar l'aplicació
en blanc, tant en desenvolupament com en producció**.

El motiu: `AppProd.jsx` tenia aquella branca **perquè va néixer com a versió de
producció**, on el lloc està en construcció i s'ha de redirigir. `App.jsx` no
la tenia **a propòsit**: en desenvolupament has de poder veure la botiga mentre
hi treballes.

La lliçó, que val per a tota aquesta comparació: **una diferència entre els dos
fitxers no és automàticament una funcionalitat que s'ha de conservar.** Pot ser
una diferència deliberada entre entorns. Cal preguntar-se *per què* existeix
abans de portar-la.

Estat final: B1 (Helmet) i B3 (condicions de càrrega) sí que es van portar i són
correctes. B2 s'ha revertit. B4 no calia.


---

## C. Diferències que no són pèrdues

- **Ordre dels hooks**: `App.jsx` els té tots a dalt; `AppProd.jsx` els
  intercala amb càlculs. `App.jsx` ho fa millor i és el que cal conservar.
- `isDemoStyleLayoutRoute` amb parèntesis innecessaris a `App.jsx`.
- Una classe `text-black` en un encapçalament d'error, que només és a `App.jsx`.

---

## D. La meva recomanació

**Agafar `App.jsx` com a base i portar-hi les quatre coses de `AppProd.jsx`.**

El motiu: `App.jsx` és el que es desenvolupa (69 commits contra 12), té la part
mòbil i té els hooks en bon ordre. Però abans de fer-lo servir a producció,
cal incorporar-hi el que `AppProd` va guanyar pel seu compte — sobretot el
`Helmet`, que és el que et dona els títols a Google.

En passar, els dos fitxers d'entrada (`main.jsx` i `main-prod.jsx`) podrien
apuntar al mateix, i `AppProd.jsx` desapareixeria.

### Per què no el camí fàcil

El camí fàcil seria "esborro `AppProd.jsx` i faig que producció faci servir
`App.jsx`". Amb el que he vist, **això trencaria els títols SEO de tot el lloc
i la gestió de redireccions** — i no ho sabríem fins que Google comencés a
mostrar títols estranys o algú veiés un flaix en navegar.

Per això la comparació s'ha de fer diferència a diferència, i no a cop de
"aquest fitxer sembla més nou".

---

## E. Què necessito de tu per seguir

Res per a la part d'anàlisi: ja està feta.

Per a l'aplicació, la teva aprovació de dues coses:

1. **Que la base sigui `App.jsx`** (és el que es desenvolupa i té el mòbil).
2. **Que portem les quatre coses de la llista B** abans de fer-la servir a
   producció, especialment el `Helmet`.

Si hi estàs d'acord, ho aplico i ho verifico amb els 128 tests i l'edificació.
Si prefereixes que la base sigui `AppProd.jsx` (perquè és el que avui va a
producció), també es pot fer, però llavors cal portar-hi **sis** coses en lloc
de quatre, i la més feixuga és tota la part mòbil.

---

## F. Una advertència sobre el mòbil

Recorda el que em vas dir: la versió mòbil no està acabada i el mega-slide no
s'ha traduït.

Això vol dir que **A1 no és "recuperar una funcionalitat perduda", sinó
"recuperar una funcionalitat a mig fer"**. Si unifiquem cap a `App.jsx`, la
barra inferior del mòbil tornarà a producció — cosa que és correcta, però no
converteix el mòbil en una versió acabada. Només el deixa on tocava.
