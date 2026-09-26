# PLA — neteja de l'estructura de calibratge del megaslide

**Data:** 26/09/2026 · **Branca:** `main` · **Pendent de pujar:** 17 commits

L'amo ho va demanar així: «Et proposo que netegis l'estructura i les relacions
entre elles.» Aquest document és l'inventari del que hi ha, els problemes que
he mesurat aquesta nit (cada un amb el seu símptoma i la seva xifra) i l'ordre
amb què proposo arreglar-ho. **No és un canvi encara**: és el mapa.

---

## 1. Inventari: qui mesura què, i qui ho fa servir

Tots els valors calibrats del megaslide, amb el seu productor, la seva font, els
seus disparadors i els seus consumidors. Tots viuen al mateix arbre de
components i cap no té un propietari únic.

| valor | qui el mesura | d'on surt | quan es mesura | qui el consumeix |
|---|---|---|---|---|
| `midesGraella` (`dibuix`, `gapH`, `gapV`) | `CercadorTextRow` | amplada del retall + `top` de la franja | layout + `ResizeObserver` + repàs 400 ms | mida de les peces, `alcadaFila`, alçada del retall |
| `desnivellsLinies` (`primera`, `segona`) | `CercadorTextRow` | centres de les 2 files vs cel·les BLANC/COLOR | `rAF` + 250/400 ms | `top` de cada fila de dibuixos |
| `desnivellColors` | `CercadorTextRow` | centre de la tira de colors vs cel·la NEGRE | `rAF` + 250/400 ms | `marginTop` de la tira de colors |
| `margeBaixFletxes` | `CercadorTextRow` | baix del selector − baix del retall | `rAF` + 250/400 ms | `bottom` del bloc de fletxes |
| `margesEnllacos` (`dalt`, `baix`) | `CercadorTextRow` | `top` de la filera/selector, `bottom` franja/filera | layout + 250/400 ms + RO de la franja | marges de la columna de col·leccions |
| `desplac` | `CercadorDibuixosGraella` | centre del grup actiu vs finestra | muntatge + canvi de col·lecció | `translateX` de la tira de dibuixos |
| `topVisualAlignmentY` | `MegaslidePagina2` | selector de la pàgina 1 vs el de la 2 | layout + `rAF` + 180/340 ms | `top` de la filera **i** `translateY` del selector |
| `selectorCentratgeY` | `MegaslidePagina2` | centre de la filera vs centre del selector | igual (mateix efecte) | `translateY` del selector |
| `pageLift` | `MegaStripePanelP1` | selector vs capdamunt del panell | layout + RO del panell | lift de la pàgina 1 **i** `visualOffsetY` de la franja |
| `factorCarrilFranja` / `centre` | `useEscalaFranjaCarril` | amplada de la filera vs carril | layout + RO + `MutationObserver` de l'estil | `transform: scale()` de la franja |
| `stripeStripOffset` | `MegaslidePagina2` | fletxes/rodeta/arrossegament | interacció | quin dibuix surt a cada casa |
| `--hg-mega-w`, `--hg-mega-x` | `FullWideSlideHeader` | model de layout | efecte del header | carril de tot (header, pàgines, franja, rail de la PDP) |
| `--megaStripeScale`, `--megaStripeDx/Dy` | HUD de calibratge | desat al navegador | muntatge | escala i desplaçament de la franja |

### Com es relacionen (això és el que està embolicat)

```
                    --hg-mega-w / --hg-escala-mega
                              │
        ┌─────────────────────┼──────────────────────────┐
        ▼                     ▼                          ▼
  midesGraella ──► alcadaCarrusel ──► alçada de la filera ──► margesEnllacos
        │                     │                                   ▲
        ▼                     ▼                                   │
  desnivellsLinies      (baix del retall) ──► margeBaixFletxes     │
        │                                          ▲              │
        ▼                                          │              │
   posició de les files                        selector ◄── selectorCentratgeY
                                                     ▲              ▲
                                                     │              │
                                              topVisualAlignmentY ──┘
                                                     ▲
                                                     │
                                     pageLift ──► visualOffsetY ──► franja
                                                     ▲              ▲
                                                     │              │
                                        factorCarrilFranja ─────────┘
```

Cada fletxa és una mesura que depèn d'una altra, i tres d'elles les mesura el
**fill abans que el pare** hagi aplicat la seva.

---

## 2. Problemes mesurats aquesta nit (cada un amb la seva xifra)

1. **Els efectes de layout dels fills corren abans que els del pare.** La
   graella mesurava amb la filera sense alinear i la franja sense assentar:
   el retall naixia a **71,9 px** i passava a **95,2**; la segona filera de
   dibuixos saltava 11 px i la tira de colors 23 px.
2. **Els acumuladors amb `ref` escrita dins del bucle compten dues vegades la
   mateixa correcció** quan dos passos cauen a la mateixa tasca (els
   temporitzadors expiren junts amb el fil ocupat): el bucle de les files
   acabava **3 de 6 obertures en fred a 13,6 i 15,9 px** de les seves cel·les.
3. **Els temporitzadors són el mecanisme d'assentament** (180, 250, 340 i
   400 ms, un joc per bucle): les correccions arriben amb el panell ja obert
   (la tira de colors saltava 19 px a 1920 i 37 px a 1512; el bloc de fletxes,
   20–42 px).
4. **Declarat contra mesurat.** La finestra de la graella es declara i les
   files es mesuren: **0,89 px de tinta tallada** a la fila de dalt. El pas
   vertical alineat es declarava només quan hi havia franja mesurada.
5. **Una geometria que depèn d'un recurs que arriba tard.** La filera de la
   franja fa l'amplada de la seva imatge, i fins que la imatge no arriba
   l'amplada és **zero**: l'escala no es podia calcular i la franja es pintava
   **1,58 cops** massa gran fins als ~300 ms, i s'enduia el seu baix i el marge
   de la columna de col·leccions.
6. **Els probes de posicions són cecs els primers ~400 ms** (el fil principal
   està muntant el panell). Tot el que passa «al principi» s'ha de mesurar amb
   una sonda DINS dels bucles; si no, es veu un sol estat i sembla que no es
   mogui res.

---

## 3. Cap a on hauria d'anar

Cinc regles, i res més:

1. **Declarar primer.** Tot el que es pot derivar de la composició (carril,
   mides de cel·la, passos, mides d'actius) es declara i **no es mesura**; la
   mesura només confirma. El carril declarat ja s'usa a la PDP i a l'escala de
   la franja.
2. **Una sola passada de mesura**, en un sol lloc, després del layout del
   panell i **abans del primer pintat**: tots els valors derivats de la
   MATEIXA instantània del DOM. Avui cada valor té el seu effect i el seu joc
   de timers.
3. **Un propietari per valor.** Cap valor escrit per dos bucles; el consumidor
   no remesura el que ja sap un altre.
4. **Idempotència.** Els acumuladors parteixen sempre del valor **pintat**, no
   del que s'ha decidit (ja fet a dos dels bucles).
5. **Un sol mecanisme d'assentament.** Una passada a `rAF` (abans del primer
   pintat) i **una** confirmació als ~400 ms per a tots els valors, en comptes
   de quatre jocs de temporitzadors. I els recursos que defineixen geometria
   (imatges de la franja) han de tenir mida declarada o estar decodificats
   abans del primer pintat.

---

## 4. Ordre proposat (cada pas amb la seva porta)

| # | pas | porta |
|---|---|---|
| 1 | **Fet** (`3e24b43`, `aec0074`, `0ea261d`): idempotència dels acumuladors i primera passada en `rAF` | les obertures donen un sol estat pintat |
| 2 | **Fet** (`262f79b`): mides dels actius per atribut i carril declarat a l'escala de la franja | la franja neix a la mida a les dues finestres |
| 3 | **Unificar els quatre bucles de `CercadorTextRow`** (files, tira de colors, fletxes, enllaços) en una sola passada amb una taula de valors: una instantània, un `rAF`, una confirmació | `compara-vistes` + els probes d'obertura i de càrrega + 514 proves |
| 4 | **Passar la mesura del pare a la mateixa passada**: `MegaslidePagina2` llegeix la seva instantània i reparteix els valors per props (avui el fill mesura i el pare torna a mesurar) | ídem + les 14 clics |
| 5 | **`pageLift` i l'escala de la franja**: declarar el que es pugui i deixar una sola mesura de confirmació | ídem + la franja a la vista vertical i apaïsada |
| 6 | **Esborrar els temporitzadors que quedin sense feina** i deixar documentat el sol repàs | bateria sencera |

Cada pas es fa amb la mesura al davant i es comiteja sol. Si un pas no millora
cap xifra, es descarta (com es va fer amb la convergència amb `flushSync`).

---

## 5. Què NO es toca

- `--hg-mega-w` i `--hg-mega-x`: tocar-los desquadra la franja (mesurat).
- Les regles de la bateria (constitució).
- Els calibratges que l'amo ha validat (HUD, `stripeCalibrations`).
- El servidor de desenvolupament del port 3003.
