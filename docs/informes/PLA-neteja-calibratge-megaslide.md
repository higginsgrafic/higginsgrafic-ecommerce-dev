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
| 3 | **Fet**: els tres bucles del **pare** (mides de la graella, marges de la columna, tira de colors) són una sola passada: un estat, una instantània, un `rAF`, una confirmació, un observador. Queden els **dos del fill** (les dues files i el bloc de fletxes) per al pas 4 | `compara-vistes` OK, 514 proves, un sol estat pintat a 4 finestres, 0,00 px de tinta |
| 4 | **Passar els dos bucles del fill a la mateixa passada**: `CercadorDibuixosGraella` deixa de mesurar (les dues files i el bloc de fletxes) i els valors li arriben per props; `MegaslidePagina2` reparteix la seva instantània | ídem + les 14 clics |
| 5 | **`pageLift` i l'escala de la franja**: declarar el que es pugui i deixar una sola mesura de confirmació | ídem + la franja a la vista vertical i apaïsada |
| 6 | **Esborrar els temporitzadors que quedin sense feina** i deixar documentat el sol repàs | bateria sencera |

Cada pas es fa amb la mesura al davant i es comiteja sol. Si un pas no millora
cap xifra, es descarta (com es va fer amb la convergència amb `flushSync`).

---

## 4 bis. Les mides manuals, i com treure-les (26/09/2026)

L'amo ho va dir: «Eliminar les mides manuals, també.» Inventari del que hi ha:

| què | quantes | on |
|---|---|---|
| desplaçament i escala de cada dibuix sobre la seva samarreta | **238 → 35 entrades** (fet el 26/09) | `STRIPE_DRAWING_CALIBRATIONS` (`stripeCalibrations.js`) |
| calibratge de la franja (dx, dy, escala) | 3 | `STRIPE_LAYOUT_DEFAULTS.stripe` |
| overlay de la samarreta (hero, fitxes) | 3 + 3 | `SHIRT_DRAWING_OVERLAY_DEFAULTS`, `STRIPE_DRAWING_OVERLAY_DEFAULTS` |
| passos de gap i marge de la vista vertical | 3 | `PASSOS_ESCALA_GAP_DIBUIX_VERTICAL`, `GAP_MOVIMENT_DIBUIX_VERTICAL` |
| ajustos als components | 1+ | `FRANJA_AJUST_PX`, marges de 10/20 px |
| valors desats al navegador (HUD) | ~30 claus | `useMegaStripeDebugState` → variables CSS |

### La prova que es poden declarar

Verificat avui contra les xifres mesurades a 1512×900 (DPR 2):

```
amplada de la filera de la franja, DECLARADA (altura × mides del fitxer): 852,05
amplada de la filera, MESURADA al DOM:                                    852
factor declarat (carril / amplada):                                       0,7580
factor que s'aplica de debò:                                              0,7929
```

Els dos darrers difereixen **només** pel calibratge manual desat al navegador
(`--megaStripeScale` = 1,159 en comptes del nominal 1,2125): 1,2125/1,159 =
1,046. O sigui que la geometria declarada ja quadra al centèsim i el que hi
sobra és el número calibrat a mà.

### Les substitucions concretes

1. **Les 244 entrades per dibuix → una regla**: el fitxer de la franja JA
   declara la seva graella de samarretes (`FRACCIO_COSSOS_FRANJA = 2740/2866` i
   `FRACCIO_MARGE_ESQUERRE_FRANJA = 65/2866`). La casa `i` de 14 comença a
   `marge + i × cos`, i el dibuix s'hi centra. És una funció de `i` i del carril,
   no 244 números.
2. ~~**L'escala de la franja → `carril / amplada declarada`**. Fora el factor
   manual.~~ **Fet a la pràctica, i no cal res**: mesurat el 26/09/2026 canviant
   `--megaStripeScale` a 0,9 (i al nominal):

   | valor de la variable | amplada de la franja | transform efectiva |
   |---|---|---|
   | el desat (1,2125) | 818,92 | 0,961333 |
   | el nominal (1,2125) | 818,92 | 0,961333 |
   | 0,9 | 818,92 | 0,961333 |

   El hook calcula el factor **contra** l'escala que la franja porta posada, o
   sigui que el producte és sempre `objectiu / amplada` i el valor manual es
   cancel·la exactament. La franja no en depèn. (Jo havia dit que hi havia un
   4,6 % de diferència: era una deducció meva, i la mesura la desmenteix.)
   La variable es queda perquè la vista vertical la fa servir per encongir la
   franja dues files (`1,17`), i allà el hook no hi actua.
3. **L'overlay de la samarreta → les mateixes fraccions del fitxer** (el pit de
   la samarreta és una zona coneguda de la imatge).
4. **Els ajustos de 10/20 px i `FRANJA_AJUST_PX` → a la taula declarada** de
   `geometriaMegaslide`, amb la prova unitària que els fixa.
5. **El HUD i les seves ~30 claus desades → fora del camí de la geometria**
   (pot quedar com a eina de diagnòstic, però que no publiqui variables que la
   composició consumeixi).

### Ordre

Cada substitució es fa **sola**, amb la mesura abans/després (`compara-vistes`,
els probes d'obertura i de càrrega, el comptador de textos/imatges) i amb el
vist-i-plau de l'amo sobre el resultat visual, perquè **treure un calibratge
canvia el que es veu avui** (en el cas de la franja, un 4,6 % de mida).

1. `geometriaMegaslide.js` amb els números declarats que ja quadren (carril, x,
   mides de la graella, amplada de la filera de la franja) + proves unitàries.
2. L'escala de la franja declarada (fora el factor manual).
3. ~~Les 244 entrades per dibuix → la regla de les fraccions.~~ **FET** (`0990d91`): 189 entrades de la banda fora del mapa, la regla declarada (`escalaDibuixFranja`, 80 unitats = 41 % del cos) i una prova que vigila que no hi tornin. Comprovat al navegador: `ncc-1701` 35,0 px (la regla) i `nx-01` 24,6 px (l'excepció, conservada).
4. Els ajustos de 10/20 px i `FRANJA_AJUST_PX`.
5. ~~El HUD fora del camí de la geometria.~~ **FET el 26/09** (la part que toca la composicio): l'override del HUD al `localStorage` (`MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC`) **nome's mana en desenvolupament**; en producció la composicio es sempre la del modul. El HUD es queda com a eina de taller.

## 5. Què NO es toca

- `--hg-mega-w` i `--hg-mega-x`: tocar-los desquadra la franja (mesurat).
- Les regles de la bateria (constitució).
- Els calibratges que l'amo ha validat (HUD, `stripeCalibrations`).
- El servidor de desenvolupament del port 3003.

## 6. La cadena vertical de la pàgina 2, mesurada (26/09/2026)

El que queda per declarar (les dues files, el centratge del selector, la tira de
colors, els marges i l'espai fins a la franja) depèn de la **mateixa referència
vertical**, i aquesta **creua les dues pàgines**. Mesurat relatiu al viewport de
la pàgina 2; l'alçada de la finestra no hi influeix (800, 946 i 1300 donen el
mateix):

| peça | 1920×946 | 1440×800 | 1512×900 | 2560×1306 | 1680×900 |
|---|---|---|---|---|---|
| contenidor de la filera (`top`) | −43,21 | −42,43 | −42,57 | −44,29 | −42,84 |
| filera (`data-p2-cercador-row`) | −3,20 | −2,42 | −2,56 | −4,28 | −2,83 |
| retall de la graella | −3,70 | −2,92 | −3,06 | −4,78 | −3,33 |
| contenidor del selector | 40,00 | 40,00 | 40,00 | 40,00 | 40,00 |
| pastilla del selector | 1,86 (119) | 1,34 (89,06) | 1,37 (93,59) | 2,44 (159) | 1,57 (104,06) |
| franja (`visual-content`) | 137,86 | 108,51 | 112,89 | 176,96 | 123,18 |
| **selector de la PÀGINA 1** | 56,78 | 47,58 | 48,96 | 69,04 | 52,18 |

D'on surt:

- El contenidor de la filera és `bar-top + topVisualAlignmentY + 20`; a 1920 val
  −43,21, o sigui **`topVisualAlignmentY` = −63,21**.
- La pastilla del selector cau **38,14 px** per sobre del seu contenidor (el
  `topVisualAlignmentY + selectorCentratgeY`); `selectorCentratgeY` = **17,03** a
  1920 (la diferència amb els 38,14 és el `mt-2` de 8 px de la pastilla).
- La referència de tot plegat és el **selector de la pàgina 1** (56,78), que
  `MegaslidePagina2` mesura i converteix en `topVisualAlignmentY` amb el bucle.
- I la franja depèn de `page1PageLift` i de `visualOffsetY`.

**El top de LAYOUT de la franja JA NO ES MESURA (26/09/2026).** No era una
alçada emergent del panell: és la reserva de la graella vella més el marge del
seu bloc. El que queda mesurat de la cadena vertical és **només la referència de
la pàgina 1 (`topVisualAlignmentY`)**, i de la franja se'n mesura només la seva
pròpia alçada (la tira escalada al carril: el que assegura el preescalfat abans
d'obrir el panell).

El sostre de la franja, declarat:

    top = 32 (el `py-8` del panell) + (carril − 8 × 12 × escala) / 9 + 13,96
          + translateY(−15 si no és banda estreta)
          + visualOffsetY

amb `alcadaReservaGraellaPanell`, `esBandaEstretaFranja` i
`visualOffsetYFranjaPagina2` a `geometriaMegaslide.js`. Comprovat contra el
`getBoundingClientRect()` de la franja a 1920, 2000, 1680, 1512, 1440, 1400,
2560, 1366×768, 1280×720, 1024×768 i 768×1024: 0,01 px als escriptoris i 0,3 px
a les tauletes.

Declarat fins ara (26/09/2026):

| valor | commit |
|---|---|
| l'amplada del retall de la graella | `5b51495` |
| l'alçada del selector i de les seves tres cel·les | `3c4a639` |
| el centratge del selector i `desplacTopSelector` | `bf5cb9d` |
| el desnivell de les dues files (`desnivellsLiniesGraella`) | `d476357` |
| la tira de colors (`desnivellColorsGraella`, `ampladaColumnaGraella`) | `2afe067` |
| el marge del bloc de fletxes (`margeBaixFletxesGraella`) | `ced00d6` |
| el `margeDalt` de la columna (`desplacTop − selectorCentratgeY`) | `0f153f1` |
| el `pageLift` de la pàgina 1 (`pageLiftPagina1`) | `f443066` |
| el coixi vertical del panell (`MARGE_DALT_BLOC_FRANJA_PX`) | aquest pas |
| el sostre de la franja (`topFranjaPagina2`, `alcadaReservaGraellaPanell`, `visualOffsetYFranjaPagina2`) | aquest pas |

Tots amb la prova unitària a `tests/unit/geometria-megaslide.test.js` i la
comprovació al navegador: el valor declarat coincideix amb el que s'aplicava,
amb diferències de 0,00-0,04 px (0,3 px a les tauletes, on l'escala del belt que
publica el CSS és 1 i la real és 0,998).

## 7. Què queda mesurat, amb xifres (26/09/2026)

Després dels passos 6 i 7 de la secció anterior, a la cadena vertical de la
pàgina 2 hi queden **dues mesures**, i cap de les dues és geometria de la
pàgina 2:

**1. `topVisualAlignmentY`: la referència de la pàgina 1.** És l'únic que el
bucle d'alineació segueix mesurant. El seu punt fix està comprovat i és exacte:

    top del selector de la pàgina 2 = top del selector de la pàgina 1
                                     + offset (10 a la banda estreta, 0 si no)
                                     + selectorCentratgeY (declarat)

Mesurat (el `selectorCentratgeY` aplicat, llegit del `translateY` de
l'embolcall del selector menys `topVisualAlignmentY`, contra el declarat):

| finestra | `selectorCentratgeY` aplicat = declarat |
|---|---|
| 1920×946 | 17,03 |
| 1440×800 | 15,76 |
| 1366×768 | −17,06 |
| 1280×720 | −17,83 |
| 1024×768 | −20,12 |
| 768×1024 | 5,62 |

(`midaSelector` és 120 als escriptoris i **112,8 a les tauletes**: la pastilla
també va escalada pel `scale(0,94)` del contenidor. Amb aquest valor, la
fórmula declarada dona exactament el número aplicat a totes sis finestres.)

El que falta per declarar `topVisualAlignmentY` és el **top del botó del
selector de la pàgina 1** (no el del seu contenidor, que ja és declarat):

- El contenidor del selector de la pàgina 1 cau a **39,52 px** del capdamunt
  del panell a TOTES les finestres: comprovat a 768×1024 (on `pageLift` = 0, i
  per tant es veu el valor natural): el contenidor hi és a 39,52 px =
  els 32 del `py-8` + els 8 del `mt-2` escalats pel `scale(0,94)` del
  contenidor de la graella (8 × 0,94 = 7,52).
- El botó («Color») cau **~1/3 de l'alçada de la pastilla** més avall del
  contenidor: 36,78 px amb una pastilla de 109,42 a 1920 (o sigui `h/3` + 0,31),
  27,58 de 81,84 a 1440, 25,20 de 74,67 a 1366×768 i 31,49 de 93,56 a
  768×1024 (i la pastilla és `aspect-[1/2] w-1/2`, o sigui geometria del
  MegaColumn de la pàgina 1: el que la secció 5 diu que no es toca).
- Amb això, `topVisualAlignmentY` val −63,21 / −62,43 / −64,29 / −62,57 /
  −62,84 / −62,37 a 1920×946 / 1440×800 / 2560×1306 / 1512×900 / 1680×900 /
  1400×900, −77,72 / −79,54 / −84,90 a 1366×768 / 1280×720 / 1024×768 i
  −46,91 a 768×1024.

**2. L'alçada de la franja.** El top de la franja és declarat (§6), però el seu
`bottom` no: la tira s'escala per encabir-se al carril
(`useEscalaFranjaCarril` mesura l'amplada natural de la filera) i aquesta
amplada depèn de les imatges. És exactament el que assegura el preescalfat
abans d'obrir el panell (les 128 imatges a memòria: mesurat amb
`scripts/_tmp-carrega-obert2.mjs`, opacitat 0 → 1 en una sola animació).
`margesEnllacos.baix` i `midesGraellaCompacta` (la deducció de l'alçada del
dibuix i de la seva separació, que depèn de `sostre − daltGraella`) en depenen
tots dos: el `sostre` ja és declarat, i `daltGraella` (el top del retall) penja
de `topVisualAlignmentY`, o sigui del punt 1.

La resta de mesures que queden al voltant del megaslide són fora de la cadena
vertical: `stripeRowPadXPx` (el coixi horitzontal del panell, que sí que és
responsiu: 40 px a l'escriptori i 24 a la tauleta vertical) i les mides
declarades que encara es confirmen al DOM amb un avís de desenvolupament
(`ampladaRetallGraella`).

## 8. Feina pendent (26/09/2026)

### 8.1 Arrossegar amb el dit la tira de colors i la franja — FET (`7e0a696`)

**Què demanava l'amo (26/09/2026):** «que tant la tira de colors 14x1 (selector
de colors) com la stripe es puguin moure amb el dit». Fet al commit `7e0a696`,
després de donar la pàgina 2 per bona:

- `src/hooks/useArrossegamentPas.js` (nou): un arrossegament horitzontal fa el
  mateix que la rodeta (un pas cada 30 px, cap a l'esquerra avança) i un toc
  segueix sent un clic (el punter només es captura passats 6 px).
- La franja (`MegaStripePanel`) i la tira de colors (`CercadorTextRow`) porten
  `touch-action: pan-y`: el gest horitzontal és nostre i el vertical segueix
  fent el desplaçament de la pàgina.
- Comprovat amb events de punter sintètics: 96 px de dit sobre la franja avancen
  la tira (la casa 0 passa de `dj-vader` a `nx-01`).

**Com està ara:**

- **La franja** (`MegaStripePanel`) només té la **rodeta**: el panell escolta
  `wheel` sobre la filera i en fa el pas (`onStripeStripWheel`, que ve de
  `MegaslidePagina2` i mou `stripeStripOffset`, el desplaçament de la tira de 64
  dibuixos). Amb el dit (touch) no fa res.
- **La tira de colors** (`CercadorColorsGrid`, dins `CercadorTextRow`) té la
  rodeta (`rodeta`, que passa a la barra del costat) i, a més, un **arrossegament
  que tria el color que hi ha sota el dit** (`onPointerDown/onPointerMove` →
  `triaAmbElDit`). O sigui que amb el dit canvia el color triat, però no
  «llisca» la tira.

**Què caldrà fer:** un gest d'arrossegar compartit (pointer events, que cobreixen
ratolí i touch) que faci el mateix que la rodeta: un pas per cada pas de dit, amb
un llindar per no confondre's amb un toc (que ha de seguir triant el color o el
dibuix) ni amb el desplaçament vertical de la pàgina; i, si l'amo vol que
«llisqui», el desplaçament continu de la tira de colors amb el dit. Caldrà
comprovar-ho amb `deviceScaleFactor` i `hasTouch` al Playwright (i amb
`_tmp-errors2.mjs`, que ja comprova que el clic segueix funcionant).

### 8.2 El que encara espera confirmació de l'amo

Els dos commits del vel (`3298b36`, el vel no taca mai una samarreta activa, i
`7c189ca`, el vel cau a sobre de les samarretes) van sortir de mesures, però
l'amo encara no els ha vist: si el vel continua fallant, cal saber **on** (quina
casa, quina vista) i **què** s'hi veu.

## 9. Punt de recuperacio: la pagina 2 es estable (26/09/2026)

L'amo ho va donar per bo («Punt de recuperació: Pàgina dos estable»). Aquest es
el punt on tornar si alguna cosa es desquadra:

- **`26442f5`** — la pagina 2 estable: el vel cau a sobre de les samarretes
  (`7c189ca`), no taca mai una samarreta activa (`3298b36`), la franja arrenca ja
  centrada i no gira en obrir (`e6c9806`), la porta d'obertura espera les
  imatges (`2c586cb`) i el megaslide es queda invisible fins que la composicio
  esta quadrada (`26442f5`).
- **`7e0a696`** — a sobre, el gest del dit (seccio 8.1). No toca cap geometria:
  nome's afegeix el gest i el `touch-action`.

Bateria del punt de recuperacio: 570 proves (45 fitxers), eslint amb els
mateixos comptes que la linia base a cada fitxer tocat, `vite build`,
`compara-vistes` OK, `mesura-formats` 0 i 0 i `_tmp-errors2` sense errors.
