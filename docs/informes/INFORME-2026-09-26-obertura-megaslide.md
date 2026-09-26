# INFORME — el megaslide no s'obre fins que el contingut hi és (26/09/2026)

Segueix el `PROMPT-continuar-2026-09-26.md`. Allà hi havia **una sola cosa
oberta**: el megaslide s'obria abans d'estar a punt i es veia arribar el
contingut. Això és el que s'ha fet i com s'ha comprovat.

---

## La causa

El panell es muntava amb l'estat `active` i, en el mateix commit de React,
demanava les seves imatges. El primer pintat arribava abans que acabessin de
baixar, i l'obertura (340 ms) no sempre ho amagava.

Mesurat aquí, en carregar `?active=first_contact` (1920×946, DPR 1), al primer
fotograma pintat:

| | abans | després |
|---|---|---|
| imatges del retall decodificades | **94 / 128** | **128 / 128** |
| imatge base de la franja | 2866 | 2866 |
| textos | 0 | 0 |

A la màquina de l'amo l'abans era **0 / 128**.

## Què s'ha fet

**Una sola cosa:** precarregar les imatges i no muntar el panell fins que hi
siguin. La porta és l'estat `active` del header, per on passen tots els camins
(la URL amb `?active=`, `pageshow`, `popstate`, el clic de la icona de cerca i
els enllaços de col·lecció).

- **La llista:** les 64 imatges del retall (`images_grid_trim`, una per dibuix
  de `dibuixosGraella16x4`, ara amb el camp `dibuix`), les de la franja de la
  col·lecció activa (`computeStripeTileOverlaySrcs`, amb la mateixa variant P2 i
  el mateix color mostrat que `MegaslidePagina2`) i la **imatge base de la
  franja** (`full-white-stripe.webp`, sense la qual la franja neix blanca).
- **El senyal:** `decode()` de cada imatge. Mesurat que resol abans que
  l'esdeveniment `load` (màxim ~210–415 ms contra ~420–1072 ms), o sigui que és
  el senyal bo.
- **El topall:** 400 ms, perquè cap xarxa lenta no bloquegi l'obertura.
- **El muntatge:** condicional (`{potMuntarElPanell ? <MegaMenuPanel …/> : null}`).
  La porta només es torna a passar **en obrir**; en tancar es baixa a fals.
- Els dibuixos de la graella passen de `loading="lazy"` a `"eager"`: amb el
  panell ja precarregat, `lazy` encara esperava el seu propi fotograma per
  aplicar les imatges de la memòria.

## Com s'ha comprovat (les tres coses, en la mateixa passada)

1. **`scripts/_tmp-carrega-obert2.mjs`** — el comptador de contingut. En 10
   obertures en fred: 8 amb `128/128` i `franjaImg=2866` al **primer fotograma**
   (opacitat 0). En les 2 que el topall va disparar, el primer fotograma té part
   de les imatges (opacitat 0, invisible) i el **primer fotograma visible**
   (opacitat ≥ 0,21) ja és sencer.
2. **`npm run compara-vistes`** — **OK**, mateixes mides i alineacions a 768,
   1024, 1366 i 1440.
3. **`scripts/_tmp-errors2.mjs`** — **0 errors de consola** i el clic d'obertura
   funciona (`v2: true`, `bar: true`, 130 peces).

A més, el camí del clic (`_tmp-carrega-clic.mjs`): primer fotograma i primer
fotograma visible amb `128/128` i `franjaImg=2866`.

## Trampes (perquè no es torni a caure)

- **No es pot gatejar amb la prop `active` a `null`.** Renderitzar
  `MegaMenuPanel` amb `active=null` i després amb valor fa que React digui
  «Expected static flag was missing» (l'error intern del muntatge dels hooks).
  El muntatge ha de ser **condicional**.
- **Tornar a passar la porta a cada canvi d'`active` fa parpellejar.** Amb la
  clau per col·lecció, canviar de col·lecció desmuntava el panell **199 ms**
  (mesurat amb `_tmp-canvi-forat.mjs`). Amb el booleà i la porta només en obrir,
  el forat és **0 ms**.
- **El topall de 400 ms mana quan la xarxa va lenta.** Amb el servidor de
  desenvolupament carregat, el `decode()` de 72 imatges pot passar de 400 ms
  (1 de cada 6–8 obertures). Llavors el primer fotograma és parcial, però
  l'animació (340 ms, arrenca a opacitat 0) el tapa: el primer fotograma amb
  opacitat > 0 ja és sencer.
- **Sense la imatge base de la franja a la llista, la franja neix blanca**,
  encara que tots els dibuixos hi siguin.

## La bateria

| comprovació | resultat |
|---|---|
| `npx vitest run` | 525 proves, 45 fitxers, totes passen |
| `npx vite build` | OK |
| `npm run compara-vistes` | OK |
| `node scripts/mesura-formats.mjs` | 0 i 0 |
| `npx eslint` (fitxers tocats) | `FullWideSlideHeader` 15/12 i `CercadorTextRow` 0/6 (línies base) |
| errors de consola a l'obertura | 0 |

## Què queda obert

- **Xarxa molt lenta:** si el `decode()` passa de 400 ms, el topall obre amb part
  del contingut. És el preu del topall. Si l'amo ho veu, el número a revisar és
  `TOPALL_PRECARREGA_MS`.
- **Canvi de col·lecció amb el panell obert:** la graella i la base ja són a la
  memòria, però els dibuixos de la franja de la col·lecció nova no es gategen
  (es carreguen mentre el panell ja és obert). No s'ha tocat perquè gatejar-ho
  desmuntant el panell fa parpellejar. Si l'amo ho veu, el següent pas és
  gatejar-ho **sense desmuntar** (ensenyar l'antiga fins que la nova estigui a
  punt).
