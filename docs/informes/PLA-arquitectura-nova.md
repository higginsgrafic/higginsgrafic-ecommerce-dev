# Pla d'arquitectura: refer la fonamenta de la pàgina

> Document de treball. **Cap canvi de codi no es fa fins que aquest pla estigui
> aprovat.** L'objectiu no és reescriure el projecte sinó treure'n l'orfebreria:
> que les coses funcionin perquè estan ben construïdes, no perquè algú hi va
> posar el número que tocava.

---

## 1. El diagnòstic, amb números

Mesurat al projecte (22/09/2026):

| fet | valor |
|---|---|
| fitxers de codi | 315 |
| línies | **86.616** |
| rutes definides | 98 |
| rutes del camí del client | **~12** |
| rutes d'eines (admin, dev, constructors) | 31 |

I el que de debò explica el problema, mesurat a la pàgina de col·lecció:

| | `/austen` (col·lecció) | `/austen/keep-calm` (PDP) |
|---|---|---|
| elements | 654 | 399 |
| `position: absolute` | **61** | 41 |
| posicions `top` en px fixos | **61** | — |
| alçades fixes > 40 px | **47** | — |
| graelles amb `aspect-ratio` fix | **3** | **0** |
| fondària d'anidament | **16 nivells** | — |

**Conclusió.** La PDP funciona perquè està **en flux**. La pàgina de col·lecció
no: està feta de 61 coordenades calibrades a mà sobre graelles d'aspecte fix,
amb marges negatius per sobreposar blocs. Per això **cada cop que el contingut
canvia una mica, un altre número deixa de quadrar**, i per això cada pedaç en
trenca dos. No hi ha cap columna vertebral de la pàgina: hi ha 61 acords
particulars.

**L'orfebreria no és a tot arreu: és concentrada.** L'inici (1.123 línies) està
en flux i es veu bé; les pàgines llegals, el checkout i les eines també. El pou
és el header (3.184 línies) i la composició de les col·leccions.

---

## 2. Abast: què es refà i què no

### Es refà (la fonamenta i les pàgines del client)

- el **marc de pàgina** (com es munten les pàgines, dalt a baix)
- el **sistema d'espaiat vertical** (4 números en un lloc, no 61 coordenades)
- la **composició de les 5 col·leccions**
- la **composició de l'inici** (quan toqui)
- la **composició de la PDP** (quan toqui)

### Es conserva (ha costat i està bé)

- el **header** i la barra de navegació (es refan **després**, en fase pròpia)
- el **megaslide** (el panell del cercador): va en flux i es veu bé
- les **targetes** de producte, preus, talles, noms partits
- la **hero**, la franja, els degradats, el pòster
- el **peu**
- les **dades**, els colors, les rutes, les imatges
- les **eines**: admin, dev, constructors, settings → **no es toquen**
- les pàgines **llegals**, checkout, compte → **no es toquen**
- els **462 tests**

### Es jubila (quan la nova pàgina estigui verificada)

- `CollectionVerticalPage.jsx` i la seva geometria calculada
- `Pauta4ColsOverlay` com a **esquelet** (es queda com a eina de depuració)
- els marges negatius de col·locació (`marginTop: -1366px` i companys)

---

## 2 bis. La troballa que ho explica tot: són dos projectes en un

Mesurat (22/09/2026):

| | línies |
|---|---|
| **Projecte HEADER**: `FullWideSlideHeader`, `MegaStripeHud`, tot `fullwide/` i `megaslide/`, `layoutMetrics`, `useMegaStripeDebugState` | **20.647** |
| **La pàgina de col·lecció sencera** (config, fitxa, rail, bloc final) | **2.471** |
| Total del projecte | 86.616 |
| **El header és** | **23,8 %** |

I la comunicació entre els dos:

- El **header** publica 7 variables CSS: `--hg-hero-top`, `--hg-header-bottom`,
  `--hg-mega-w`, `--hg-escala-mega`, `--hg-band-w`, `--hg-mega-x`,
  `--hg-tdp-xL/xR`.
- La **pàgina de col·lecció** en consumeix 4 per decidir on va la hero
  (`--hg-hero-top`, `--hg-header-bottom`) i on van les fitxes (`--hg-tdp-xL/xR`).

**Son dos sistemes de coordenades diferents que es parlen per variables CSS.**

- **El del lloc**: carril → pauta (files de 12,28 px a 768) → fitxes.
- **El del header**: `belt` → `--hg-escala-mega` → megaslide (calibrat sobre un
  llenç de disseny de 1920×1080).

El header no és una peça del lloc: és **una segona aplicació allotjada a dins**
(un configurator amb el seu propi llenç, la seva calibració i la seva
instrumentació de desenvolupament). La pàgina de col·lecció no hi pot encaixar
perquè **les dues no comparteixen cap unitat de mesura**.

### Què implica per al pla

1. **El problema del header no és de mida: és de frontera.** No cal
   "racionalitzar 3.184 línies"; cal donar-li **una interfície petita**:
   que publiqui la seva alçada i prou.
2. **La pàgina nova no ha de dependre de cap de les 4 variables.** Ha de tenir
   la seva pròpia columna vertebral i, com a molt, llegir una única dada
   (l'alçada del header) per començar més avall.
3. **El megaslide es conserva com una capa pròpia**, amb el seu estat i la seva
   calibració, muntada a sobre de la pàgina però **sense participar-hi**. És el
   que ja fa, però ara quedarà escrit.
4. **Per això la fase 7 (el header) és viable**: quan la pàgina no en depengui,
   el header només ha de pintar la seva franja i publicar la seva alçada.

> Aquesta és la raó de fons de l'orfebreria: **cada cop que el llenguatge del
> disseny (el llenç del megaslide) i el llenguatge de la pàgina (el flux del
> contingut) s'han de tocar, algú hi ha posat un número**. Aquells números són
> els 61 `top` fixos i els 10 marges negatius.

---

## 2 ter. La unitat única (decisió presa)

Mesurat: **el carril del lloc i el belt del header NO són proporcionals.**

| ample | belt (header) | carril (lloc) | carril/belt |
|---|---|---|---|
| 768 | 992 | 540 | 0,544 |
| 1024 | 992 | 720 | 0,726 |
| 1280 | 992 | 900 | 0,907 |
| 1440 | 1013 | 1013 | 1,000 |
| 1920 | 1350 | 1350 | 1,000 |

A 768 i 1024 el header manté el belt a 992 mentre el carril del lloc val 540 i
720. **No es pot traduir d'un sistema a l'altre amb cap factor: la traducció no
existeix.** Els dos escalen amb regles diferents, i per aixo cada encontre entre
tots dos ha acabat amb un numero calibrat a ma.

### La unitat nova

**Una sola unitat: 1 unitat = 1 píxel de disseny sobre el llenç de 1920.**

Es publica una vegada a l'arrel i la fan servir TOTS els blocs, tant els del lloc
com els del header i el megaslide:

    --escala:  ample de la finestra / 1920
    html { font-size: calc(var(--escala) * 16px); }   /* 1rem = 16 unitats de disseny */

D'aqui surten dues maneres d'escriure el mateix, i totes dues son **identiques al
disseny a 1920**:

| per aixo | s'escriu | vol dir |
|---|---|---|
| tipografia i espaiat que ha de créixer amb la pantalla | `font-size: 1.5rem` | 24 px de disseny |
| elements que no han de canviar de mida relativa | `width: 47%` | proporció del pare |
| llenç del megaslide | `--escala` | la mateixa que el lloc |

**Un sol `--escala` mana de tot.** Ni `carrilPx`, ni `carrilPct`, ni
`escalaMegaslide`, ni `getSafeBelt`, ni `--hg-escala-mega`: una variable.

### Per que funciona

- A **1920** l'escala val 1 i tot queda **exactament com el disseny**, o sigui
  que el megaslide (que esta calibrat a 1920) **no es mou gens**.
- A **1440** val 0,75 i el megaslide ja fa servir exactament aquest valor
  (mesurat: `--hg-escala-mega` = 0,7504). **Coincideix.**
- A **taula** (768/1024) avui el megaslide no s'escala (escala 1). Amb la unitat
  nova s'escalaria a 0,40 i 0,53. **Aixo es l'unica cosa que canvia d'aspecte** i
  es pot triar: o s'accepta que tot escali igual, o es fixa un terra
  (`--escala: max(0,667, ample/1920)`) perque el text no quedi petit.

### L'accessibilitat

El `font-size` de l'arrel no pot baixar indefinidament. Regla: `rem` per a
tipografia i espaiat, i **terra d'escala a 0,667** (el text no baixa de 2/3).
Per sota d'aquest terra, el disseny es reajusta (no s'encongeix mes).

---

## 3. Les regles de la fonamenta nova

1. **Una sola columna vertebral.** Cada pàgina és una successió de seccions
   **en flux normal**, en ordre de document. Res es col·loca amb `top` fix ni
   amb marge negatiu.
2. **L'alçada la mana el contingut.** Cap secció no té alçada pròpia; la treu
   del que hi ha a dins.
3. **Els aires es declaren, no es mesuren.** Una sola escala:
   `--esp-1` (petit), `--esp-2` (normal), `--esp-3` (secció), `--esp-4` (gran),
   una vegada per classe de dispositiu. Cap mesura de DOM per decidir un espai.
4. **Les graelles d'aspecte fix són decoració, mai esquelet.** El fons degradat
   d'una fitxa pot sortir de la seva caixa; el lloc on va la fitxa no.
5. **El peu cau sol**, perquè la pàgina acaba on acaba el contingut. Cap càlcul
   de marge.
6. **Una cosa, un lloc.** Si un número s'ha de tocar per canviar l'aspecte
   d'una pàgina, ha de ser a la configuració, amb nom, i en un sol lloc.

---

## 4. El full de ruta

| fase | què | porta de sortida |
|---|---|---|
| **0** | **Congelar la referència** | captures de les 5 col·leccions + inici a 768/1024/1440 |
| **1** | **La fonamenta**: marc de pàgina, escala d'espaiat, blocs buits | traces sense moviment a les 6 mides |
| **2** | **L'inici** (el cas més simple i compartit) | `/` idèntica o millor, verificada |
| **3** | **Una col·lecció** (`/cube`, la més curta) | `/cube` verificada a les 6 mides |
| **4** | **Les cinc col·leccions** | les 5 verificades i sense regressions |
| **5** | **El constructor de col·lecció** | `/constructor/colleccio` amb els mateixos aires |
| **6** | **La PDP i la resta del camí** | verificades |
| **7** | **El header** (fase pròpia i separada) | pla propi |

**Cada fase té la seva porta de sortida.** No es passa a la següent sense
complir-la.

---

## 5. Com es verifica

- **462 tests** (`npx vitest run`) — el nombre no pot baixar.
- `npm run compara-vistes` ha de dir **OK**.
- **Captures deterministes** de les 5 col·leccions × 5 mides
  (`scripts/captures-colleccions.mjs` + `compara-captures.mjs`).
- **Traces d'estabilitat**: cada element visible ha de tenir **un sol estat**
  (cap moviment) a 768/1024/1280/1440/1920.
- **Mesura d'aires**: una eina nova que comprova que les distàncies declarades
  es compleixen, i que **no hi ha cap element que desbordi el seu pare**.
- `npx vite build` ha de passar, i **no ha d'augmentar** de mida.

---

## 6. Com es construeix en paral·lel

- La pàgina vella **no es toca** mentre es construeix la nova.
- La nova viu al costat, **darrere d'una bandera de ruta** (es veu a
  `/nova/...` o amb un paràmetre), i es prova sense afectar ningú.
- Quan compleix la porta de sortida, **es canvia la ruta en un commit** (i es
  pot tornar enrere en un commit).
- **Cap esborrat** de codi vell fins que la ruta nova porta dies funcionant.

---

## 7. Fora d'abast (explícit)

- No es toquen les 31 rutes d'eines ni les pàgines llegals.
- No es toca la capa de dades ni el backend.
- No es canvia cap text, preu ni imatge.
- No es refan els tests existents; se n'afegeixen de nous per a la fonamenta.

---

## 8. Riscos i com els evito

| risc | mitigació |
|---|---|
| la pàgina nova no arriba a l'aspecte de l'actual | les captures de la fase 0 són el contracte |
| es trenca alguna cosa que funcionava | la ruta vella queda viva fins al final |
| el megaslide no encaixa a la pàgina nova | se li dona un forat net i no es toca per dins |
| el treball s'allarga i queda a mitges | cada fase deixa el projecte **en un estat millor o igual** |
| es perd el que s'ha après avui | tot el que hem après és aquí, com a regles |

---

## 9. La hero de la pàgina d'inici: estat documentat

Mesurat el 22/09/2026, abans de tocar-la. **La hero funciona**: a 768 queda a 20 px
del fons de la pantalla, que és el que es volia. El que té és que ho aconsegueix
amb dues coses que volem treure.

### Com està feta ara

```
<div gridColumn="1 / 4" gridRow="10 / 25"
     top="calc(-5px - rowHeight/2 - 50px + 25px + baixadaHero + heroOffsetPx)"
     height="430px" (a la vista vertical)
     transform="scale(0.705)" transformOrigin="center center">
```

- **`transform: scale(0.705)`**: la mida VISIBLE és el 70,5 % de la mida de la
  caixa. O sigui que el `scale` no és un ajust fi: **és qui defineix la mida de
  la hero**. Treure'l sense compensar-lo la faria un 42 % més gran.
- **`heroOffsetPx`**: un desplaçament **mesurat des de JavaScript** (un
  `useLayoutEffect` amb correcció iterativa) perquè el fons caigui a 20 px del
  fons de la pantalla. És el pedaç.
- **`top` amb cinc sumands** calibrats.

### Mides mesurades

| mida | hero visible | mida de la caixa | alçada de la caixa | aire al fons |
|---|---|---|---|---|
| 1920×1080 | 952×401 | 1351×569 | `calc(100% + 2px)` | 124 px |
| 1440×900 | 715×301 | 1014×427 | `calc(100% + 2px)` | 121 px |
| 1280×720 | 635×268 | 901×380 | `calc(100% + 2px)` | **−7 px** |
| 1024×768 | 508×214 | 721×304 | `calc(100% + 2px)` | 95 px |
| 768×1024 | 381×303 | 541×430 | **430 px, fixa** | **20 px** |

### El bloc contenidor no és el viewport

Els avantpassats de la hero, cap amunt:

```
0  hero                    relative   tf = scale(0.705)
1  cel·la de la graella    relative
2  contenidor              relative   tf = translateX(-270)   <- TRENCA `fixed`
3  div                     static
4  main                    static
```

`position: fixed` **no serveix** (l'avantpassat 2 té `transform`). I posicionar
amb `top: calc(100vh - ...)` dóna un resultat desplaçat, perquè el bloc
contenidor no és el viewport: **es va mesurar un desplaçament de 225 px** en
intentar-ho, i cada correcció en trencava una altra.

### El que caldrà fer

1. **Compensar el `scale`**: la caixa ha de fer `1 / 0,705` del que fa ara si es
   treu la transformació, o bé escalar-ne el contingut.
2. **Fer que l'alçada surti de la capçalera** en comptes de la cel·la de la
   graella: `100vh − fons de la capçalera`.
3. **Treure la mesura de JavaScript** i el `top` de cinc sumands.
4. Verificar a les cinc mides: que el fons quedi a 20 px del fons de la pantalla
   i que la mida visual no canviï.

**NO s'ha de fer a estones.** Cada intent parcial ha trencat la pàgina (el títol
de col·lecció ha arribat a quedar 214 px endins de la hero, i la taula de dues
files ha quedat 225 px desplaçada). És una tasca amb principi i final.
