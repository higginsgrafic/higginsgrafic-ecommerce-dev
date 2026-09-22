# MEMÒRIA PER A LA SESSIÓ SEGÜENT

**Data de la sessió que es resumeix:** 22/09/2026 (tarda-vespre)
**Últim commit:** `c47b094`
**Projecte:** `higginsgrafic-ecommerce-dev`
**Servidor de desenvolupament:** `http://127.0.0.1:3003` — **ja corria, NO se n'ha
d'aixecar cap altre**

---

## 1. En quin estat queda el projecte

Tot commitejat i pujat a `origin/main`. `git status` net. Cap script temporal.

| comprovació | resultat |
|---|---|
| `npx vitest run` | **462 proves, 38 fitxers, totes passen** |
| `npm run compara-vistes` | **OK** (vertical i horitzontal donen les mateixes mides) |
| `npx vite build` | **OK** |
| `npx eslint src/components/FullWideSlideHeader.jsx` | **15 errors preexistents** (no s'han d'augmentar) |
| Desbordament horitzontal | cap, a cap de les cinc mides |

### Mides que es fan servir per verificar

```
1920 × 1080
1440 ×  900
1280 ×  720
1024 ×  768
 768 × 1024   <- la tauleta que controlem, i l'única vista vertical
```

---

## 2. Què s'ha fet en aquesta sessió

### Fases del pla completades

- **Fase 0 — la referència congelada** (`0ba6b03`): eina permanent
  `scripts/captures-referencia.mjs`.
- **Fase 1 — la unitat única** (`0ba6b03`): `src/foundation.css`.

### Nou coses arreglades, amb la causa

| símptoma | causa real | commit |
|---|---|---|
| La capçalera quedava tallada | la pàgina desbordava 68 px: `TambeRail` fa 694 dins una cel·la de 540. Preexistent. | `ab2a971` |
| La franja de baix de la hero no arribava al fons | l'alçada comptava des del sostre de la finestra i la hero comença 107 px més avall | `713ef69` |
| Les TDP cavalcaven sobre la hero | el desplaçament deixava 24 px; sense, cauen 62 px sobre la hero a 768 i 233 a 1024 | `2ca54c6` |
| El pòster queia sobre les fitxes | `marginTop` fix; el pòster depèn de l'amplada del carril. Preexistent. | `ad71fa8`, `4d46cab` |
| El peu no era a la distància del marge | `marginTop` fix a `App.jsx`; el peu depèn del seu propi marge → correcció iterativa | `23079d8` |
| «Altres històries» no s'alineava | el títol es mesura pel contenidor (540) i les fitxes pel carril (736) | `2566815`, `75d7154` |
| Les fitxes de l'inici no eren com les de col·lecció | cada pàgina calculava pel seu compte + `scale(0.94)` | `81005be`, `6774e60` |
| La distribució no coincidia | depenia del **tipus de dispositiu** i no de **l'amplada** | `06d17ac` |
| El menú a 1440 feia 8,25 px | el text anava lligat a l'escala del megaslide | `dc75622` |

### Header (feina pròpia, al final)

- `08ecb2e` — **El separador al mig.** A la vertical la capçalera fa 123 px amb
  dues files: abans 80/43 (separador a 120) i ara **61/62** (separador a 101).
  Contingut centrat a cada fila (icones a 71, menú a 133). També s'hi ha tret el
  desplaçament propi del `nav` (`marginTop: 10px` + `translateY(4px)`).
- `dc75622` — **Terra de llegibilitat al menú.** El `font-size` era
  `carrilPx(11)` = `calc(11px * var(--hg-escala-mega, 1))`; a 1440 l'escala val
  0,75 i el text quedava a 8,25 px. Ara `max(12px, …)`.
- `430f7aa`, `49cac59` — **Terra al text del megaslide, a 10 px.** Mateixa causa,
  cinc llocs: `CercadorTextRow.jsx` (3 mides) i `firstContactPanels.jsx` (1).

---

## 3. L'estat mesurat, que és el contracte

### Fitxes de producte (TDP)

**Idèntiques a l'inici i a col·lecció**, perquè surten de `tdpMidaFitxa`
(`src/utils/tdpMida.js`), que és l'única font de veritat.

| amplada | per fila | mida de la fitxa |
|---|---|---|
| 1920 | 4 | 321 × 401 |
| 1440 | 4 | 236 × 295 |
| 1280 | 3 | 285 × 356 |
| 1024 | 3 | 225 × 281 |
| 768 | 2 | 259 × 324 |

**La regla de columnes és d'AMPLADA, no de dispositiu** (`tdpColumnes`):

```
> 1366      -> 4
>= 1024     -> 3
si no       -> 2
```

**L'alçada és proporcional a l'amplada de la fitxa (5:4)**, no al carril. Abans
la proporció canviava entre mides (1,45 a 768 i 1,30 a 1920).

### Capçalera

| mida | alçada | files | font del menú |
|---|---|---|---|
| 1920 / 1440 / 1280 / 1024 | 81 px | 1 | 12 px |
| 768 (vertical) | **123 px** | **61 / 62** | 11,5 px |

### Pàgina d'inici

- Hero: **701..1004** a 768, o sigui **20 px del fons de la pantalla**.
- Títol de col·lecció a 1050 (46 px sota la hero, sense solapar).
- Fitxes: 3 per fila (que és el que toca a 768 amb la regla d'amplada).

---

## 4. El que QUEDA, i per què no s'ha fet

### 4.1 La hero de l'inici — la tasca pendent més important

Documentada sencera a `docs/informes/PLA-arquitectura-nova.md`, **secció 9**.

**Té tres factors d'escala encadenats:**

1. El `transform: scale(0.705)` de la pròpia hero. **No és un ajust fi: és qui
   defineix la seva mida.** La mida visible és sempre el 70,5 % de la caixa
   (a 768: 381×303 visibles amb una caixa de 541×430).
2. Un `transform: translateX(-270)` en un ancestre, que **trenca `position:
   fixed`**.
3. **Un tercer factor en un ancestre** que fa que la compensació surti al doble:
   en compensar la caixa (×1,4184 = 1/0,705) el resultat va ser **767×610** en
   comptes de 381×303.

També: **el bloc contenidor no és el viewport**. Posicionar amb `100vh` dona un
desplaçament de **225 px**, i cada correcció en trenca una altra.

**S'hi ha provat QUATRE vegades** i cada intent parcial ha trencat la pàgina:

- el títol de col·lecció va arribar a quedar **214 px endins de la hero**;
- una taula de dues files va quedar **225 px desplaçada**;
- la pàgina va quedar trencada dues vegades.

**Estat actual:** funciona, però amb un desplaçament **mesurat des de
JavaScript** (`heroOffsetPx` a `Home.jsx`, amb correcció iterativa i un topall de
5 passades).

**Conclusió a què es va arribar: NO s'ha de fer a estones.** Cada intent parcial
falla. És una tasca amb principi i final.

### 4.2 La migració (fases 2 a 7 del pla)

**El fonament existeix però NO TÉ CAP CONSUMIDOR.** `--u` i `--esp-*` només es
fan servir dins `src/foundation.css`. Migrar vol dir refer cada pàgina perquè els
faci servir:

- fase 2: la pàgina d'inici
- fase 3: una col·lecció
- fase 4: les cinc col·leccions
- fase 5: el constructor
- fase 6: la PDP
- fase 7: el header (**3.196 línies**, i el megaslide a dins)

### 4.3 La incoherència de proporcions del megaslide

**Detectada per l'usuari i NO resolta.** Dins el megaslide conviuen **dos
sistemes de mesura**: el text es dimensiona amb `carrilPx` (lligat al llenç de
1920) i les files amb valors propis de cada dispositiu. Per això la relació
text/fila no és la mateixa a cada versió.

Els terra de 10 px i 12 px són pedaços: milloren la llegibilitat, però la
incoherència de fons continua.

### 4.4 L'objectiu tàctil

**Les files del selector fan 11 px d'alçada.** L'usuari ha dit que **no es poden
expandir**. Però 11 px **no és toca-ble amb el dit** (el mínim recomanat són 44).
Cal repensar-ho amb el disseny al davant, no amb un pedaç.

---

## 5. La troballa que deixa el camí més curt

> **A 1920 i 1440, l'escala del megaslide i la unitat nova són EL MATEIX
> nombre** (1,0 i 0,75).

| mida | escala megaslide | `--u` | coincideixen |
|---|---|---|---|
| 1920 | 1,0 | 1,0 | **sí** |
| 1440 | 0,7504 | 0,75 | **sí** |
| 1280 | 1,0 | 0,6563 | no |
| 1024 | 1,0 | terra | no |
| 768 | 1,0 | terra | no |

O sigui: **la unificació ja és feta a escriptori.** El que falta no és dissenyar
res, és que el lloc faci servir la unitat nova. **La migració és més mecànica del
que semblava.**

A tauleta no coincideixen perquè el megaslide té disseny propi i no s'escala
(l'escala val 1) mentre el sistema nou hi té un terra de 0,6667.

---

## 6. Regles de la casa (no negociables)

1. **Tot en català**: commits, comentaris i respostes.
2. **El servidor del 3003 ja corre. NO aixecar-ne cap altre.**
3. **Verificar amb les tres comandes**: `npx vitest run`, `npm run compara-vistes`,
   `npx vite build`.
4. **Els scripts temporals** van a `scripts/_tmp-*.mjs` i **s'esborren**.
5. **Les captures** van a `docs/comparacio/` (gitignorat).
6. **Els commits expliquen la CAUSA**, no el símptoma.
7. **Una instrucció alhora.** L'usuari ho ha demanat explícitament.
8. **Els 15 errors d'eslint del header són preexistents: no s'han d'augmentar.**
9. **No tocar el megaslide** sense que ho demani: està calibrat a un llenç de
   1920 i es descalibra fàcilment.
10. **No tocar el `font-size` de l'arrel**: 315 fitxers fan servir `rem`.
11. **Pedaços, si es poden evitar, no**: és la regla 15 de
    `docs/constitucio.md`. Un pedaç només s'accepta si la causa no es pot tocar
    encara, i llavors s'escriu al costat quina causa tapa.

## 7. Com treballa l'usuari (après aquesta sessió)

- **Detecta les incoherències de proporcions a ull** i té raó: quan diu «el
  selector sembla diferent a cada versió», hi ha una causa tècnica darrere.
- **No vol captures** perquè ho veu en directe. Però **sí que vol que li
  dibuixin** els contenidors quan cal discutir una geometria.
- **Atura quan veu que es fan intents a cegues**, i fa bé. Quan diu «atura», s'ha
  d'aturar i revertir, no continuar provant.
- **Prefereix una decisió honesta que un pedaç.** Valora que es digui «això no
  ho puc acabar avui i aquí està el motiu».
- **Verifica les afirmacions**: si es diu que una cosa funciona, ha d'estar
  mesurada.
