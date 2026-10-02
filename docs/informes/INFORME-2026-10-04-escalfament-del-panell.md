# INFORME — 04/10/2026 · L'escalfament del panell del megaslide

> En Marc, sobre l'experiment de la branca `feat/mega-escalfament`: «Si has d'acabar fent el
> mateix ja tant se val que acabis el que ja està començat. Si és que et serveix.»

## 1. El problema, mesurat

En carregar `/nova/inici` amb el megaslide **obert** (o en obrir-lo abans no hagi convergit), el
panell es munta i les seves peces hi viatgen mentre el contingut acaba de quadrar-se. A 1376×954,
entre els 1.800 i els 3.500 ms de la càrrega:

| peça | 1.800 ms | 2.500 ms | estable |
|---|---|---|---|
| alçada del panell | 374 px | 435 px → 309 px | 309 px |
| franja de la pàgina 2 (`top`) | 141,6 | 328,5 → 203,2 | 203,2 |
| hero (`top`) | 487,0 | 396,0 → 421,3 | 421,3 |
| `--hg-mega-bottom` | 401 → 427 | 488 → 362 | 362 |

El panell feia el **rebot 374 → 435 → 309** i la franja de la pàgina 2 viatjava **~125 px**. No és
cap retard de l'iframe: és la composició del megaslide, que no neix quadrada.

## 2. Per què no neix quadrada

- L'alçada del panell surt d'una **mesura** del fons del contingut de la pàgina 1
  (`p1ContentBottomPx`), que va canviant mentre arriben les imatges; el panell la reté fins que fa
  220 ms que no canvia (`mesuraEstable`), i mentrestant ensenya la reserva (374 px).
- La franja de la pàgina 2 s'ajusta amb el bucle d'acumulació `ajustFranjaP2Y` (només a la banda
  de tauleta apaissada, i **1376 ho és**), que hi arriba unes passades més tard (+180/340 ms i el
  `ResizeObserver`).
- I hi ha els repassos de 180/340/400 ms i les fonts.

## 3. La solució

El panell es munta **dormint** (`MegaMenuPanel`, prop `dormint`): `position: absolute; top: 0`,
`visibility: hidden`, `pointer-events: none` i **sense animació**. Com que el seu pare és un
`div.relative` propi, la geometria és exactament la mateixa que obert però **no empeny res** i no
es veu res. Així tota la convergència passa d'amagat.

A `FullWideSlideHeader` hi ha dos estats i una excepció:

| estat | què vol dir |
|---|---|
| `panellDormint` | el panell ja és al DOM, amagat. Amb el megaslide tancat s'espera **1,2 s** per no competir amb el primer pintat; si la URL ja porta col·lecció, es munta de seguida. |
| `escalfamentFet` | la composició ja és bona i el panell pot entrar en flux. |
| `ensureMegaOpen` | **l'amo mana**: tots els camins que obren el megaslide (la lupa, les icones de col·lecció, la roda) donen l'escalfament per fet i obren de seguida. |

I **escalfar no és esperar**: un retard fix no serveix, perquè el mateix retard que a una càrrega
li sobra a una altra li falta (mesurat: amb 1,4 s, una càrrega obria amb el panell a **435 px** i
una altra amb **309**, que és el bo). Qui ho sap de debò és el panell, que avisa quan la seva mesura
és estable (`onMesuraEstable`); a partir d'aquí el header espera que **tot el que es mou** (alçada
del panell, franja de la pàgina 1 i franja de la pàgina 2) faci **700 ms** que no canvia, amb un
mínim de 900 ms de son i un topall de seguretat de 3,5 s.

**Muntat no és obert.** El fons de la capçalera, la reserva d'espai i el cadenat pengen de
`panellObert`, no de «el panell existeix»: si no, el megaslide tancat pintaria l'espai reservat i la
capçalera es tornaria transparent amb el panell amagat al darrere.

## 4. La verificació, fotograma a fotograma

`node scripts/_tmp-escalfament-traca.mjs 1376 954 first_contact` recorre la càrrega fotograma a
fotograma i, de cada instant en què el panell és visible, en guarda l'alçada. Tres passades:

| | abans | després (3 passades) |
|---|---|---|
| alçades mentre **dormint** | — | 374, 435, **309** |
| alçades mentre **visible** | 374, 435, 309 | **309 i prou** |
| rebot visible | sí (2 canvis) | **cap** |
| hero visible | 487 → 421,3 | 421,3 i 396 (l'animació) |
| franja p2 visible | 328,5 → 203,2 | 177,2 → 203,2 (l'animació) |

L'únic moviment que queda durant l'obertura és el de la **pròpia animació** `mega-panel-desplega`
(el panell arrenca 26 px més amunt i baixa): la franja va de 177,2 a 203,2 i la hero l'acompanya,
que és el gest de desplegar-se. És monòton i acaba sempre al mateix lloc.

Comprovacions fetes:

- **Clic tardà** (després d'escalfar-se): als 60 ms el panell ja és en flux i fa **309 px**.
- **Clic primerenc** (als 900 ms de la càrrega): s'obre igualment de seguida, també amb 309 px.
- **Tancat**: al llarg de tota la càrrega no hi ha **cap** fotograma amb el panell visible, i la
  hero i les franges no es mouen.
- **Les 13 vistes**, `node scripts/_tmp-ipad13-abans-despres.mjs` abans i després:
  `diff` **sense cap diferència** (la geometria final de totes les vistes és la mateixa).
- **Bateria**: `npx vitest run` **600/600**, `npx eslint` dels fitxers tocats **0 errors**,
  `npx vite build` OK.
- `npm run compara-vistes` **falla igual abans i després** (sortida idèntica byte a byte): les
  tres queixes són prèvies i no són d'aquest canvi — dues vistes on el guió no troba la graella
  perquè el clic de les 2.500 ms arriba abans que l'aplicació hagi pintat, i les cintures de 1440
  (7,6 i 7,2 px). Queden pendents per a un altre torn.

## 5. Què queda pendent

- La **primera obertura que ve de la URL** espera l'escalfament: en desenvolupament són ~1,5 s
  des que el panell es munta. En producció ha de ser molt menys, però si l'amo el troba lent, el
  que s'ha de tocar és `CALMA_FRANJA_MS` / `MINIM_DORMIR_MS`, no el mecanisme.
- La hero encara **acompanya** l'animació d'obertura (26 px, monòtons). Si l'amo el vol quieta del
  tot, la mesura del cadenat hauria de llegir el panell sense el `transform` (`offsetTop` en lloc
  de `getBoundingClientRect`), i això també canvia el cadenat.
- La vertical (1032×1304): la posició de la hero encara es mou ~57 px en obrir (l'estimació fa
  `0,585 × carril` i la real és `0,620`).
