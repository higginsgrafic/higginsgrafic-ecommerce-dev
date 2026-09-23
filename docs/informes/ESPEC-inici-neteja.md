# ESPECIFICACIÓ DE L'INICI — la versió neta

> Document de treball per a `/nova/inici`. **Substitueix la geometria de la
> pàgina vella**, no la seva aparença: el text, les mides de fitxa i els dibuixos
> són els mateixos, i el que canvia és com es col·loquen les coses.
>
> Data: 23/09/2026. Referència de l'estat actual: commit `3846415`.

---

## 0. Per què existeix aquest document

La pàgina d'inici actual té **un sol defecte d'origen**, i tota la resta són
conseqüències seves:

> **El títol de col·lecció desborda la seva pròpia caixa.** Amb
> `line-height: 0.85` i un cos de 4,4vw, la caixa fa 71,8 px i el text pintat en
> fa 125: **27 unitats per dalt i 26 per baix**.

Mesurat al navegador canviant només el `line-height`:

| `line-height` | caixa | text pintat | desbordament per dalt |
|---|---|---|---|
| **0,85 (avui)** | 71,8 | 125,0 | **27,0** |
| 1 | 84,5 | 125,0 | 21,0 |
| 1,2 | 101,4 | 125,0 | 12,0 |
| normal | 125,0 | 125,0 | **0,0** |

D'aquí surt tota la cadena de pedaços de la pàgina vella:

- com que el text surt de la caixa, **cal moure el títol** amb un `mt-[27px]` i
  uns offsets per col·lecció (0, −1, −4, 13, 9);
- com que el títol es mou, **cal compensar-ho** amb quatre marges calibrats a mà
  (129, 162, 104, 124);
- com que els marges són quatre, **la distància entre col·leccions no és la
  mateixa** (319, 352, 294, 314 px);
- com que la píndola és `absolute`, **cal reservar-li l'espai** amb un
  `paddingBottom` i una fórmula que el compensi.

**Una sola cosa mal feta, sis pedaços per tapar-la.** Aquest document defineix la
pàgina sense el defecte, i els pedaços no calen.

---

## 1. Les unitats

| unitat | què és | on mana |
|---|---|---|
| **`--u`** | 1 px de disseny sobre el llenç de 1920 = `100vw / 1920` | tota la **geometria**: mides, aires, posicions |
| **`rem`** | el text, amb el `font-size` de l'arrel (16 px) | **llegibilitat** del text corrent |
| **carril** | `min(var(--u) * 1350, 1350px)`, el 70,3125 % de la finestra amb topall | l'amplada de tot |

**Per què el carril té topall i la unitat no.** El carril és el llenç de disseny
projectat: a 1920 fa 1350 i a partir d'allà no creix, perquè el disseny no
preveu pantalles més amples. La unitat de disseny, en canvi, ha de continuar
escalant: és la que fa que un text de 84 unitats sigui llegible a qualsevol
amplada i quedi proporcionat a la caixa.

**El text, sense terra a la geometria.** La llegibilitat es resol amb `rem` (que
no depèn de res) i no amb un terra a `--u`, que el que faria és **desproporcionar
la geometria**: amb el terra de 0,6667, a 768 el carril fa 540 i l'aire de
secció en feia 1.280. Aquesta és la correcció que ja s'ha fet (`cab4158`) i és
la que fa possible aquest document.

---

## 2. Els contenidors: dos, i no es barregen

| contenidor | amplada | què hi va |
|---|---|---|
| **`.hg-carril`** | el carril sencer (1350 a 1920) | la hero i les **graelles de fitxes** |
| **`.hg-marc__contingut`** | el carril menys `--esp-3` per banda (1270) | el **text** de la pàgina |

**Per què dos.** Les fitxes de l'inici fan la mateixa mida que les de les
pàgines de col·lecció (320,6 × 504,6 a 1920), i això només surt si la seva
graella té el carril sencer. El text, en canvi, no ha d'arribar a la vora: té
`--esp-3` de marge.

**El que això prohibeix:** una peça que visqui a mig camí. Avui la galeria és
**dins** del contingut amb marge i recupera el carril amb un `left: 50%` +
`translateX(-50%)`; això funciona, però vol dir que l'amplada del bloc (1270) i
la del seu contingut (1350) no són la mateixa, i per això el `paddingBottom` de
la píndola queia 10 unitats curt. **Cada peça ha de viure en un contenidor i prou.**

---

## 3. L'anatomia d'una secció

Les set seccions de l'inici són totes la mateixa cosa:

| secció | contingut |
|---|---|
| 01 hero | una caixa de 952 × 401 amb el carrusel a dins |
| 02–06 col·lecció ×5 | títol + graella de fitxes + píndola |
| 07 pòster | un text gran |

I una col·lecció és, literalment, **tres coses en columna**:

```
section.hg-seccio               <- l'aire de sobre, i prou
  h2.titol                      <- la caixa CONTÉ el text (line-height normal)
  div.graella                   <- N columnes de fitxa, gap 22,5 unitats
  a.pindola                     <- «SI EN VOLS SABER +»
```

**Al flux, els tres.** Ni `absolute`, ni `top`, ni marge negatiu, ni
desplaçaments per col·lecció. La píndola és el tercer element de la columna, i
per tant **el bloc la conté per construcció**: no cal reservar-li cap espai.

---

## 4. L'escala d'aires, amb nom

Cada número viu en un sol lloc. **Tots en unitats de disseny** (`--u`), i per
tant tots escalen igual i cap depèn de la mida.

| nom | valor | entre què i què |
|---|---|---|
| `--esp-3` | 40 | el text i la vora del carril |
| `--esp-4` | 120 | **dues seccions** (l'aire de sobre de cada galeria) |
| `--titol-cos` | 84,5 | el cos del títol de col·lecció |
| `--titol-cards` | **76,8** | la **caixa** del títol i les fitxes (vegeu §4 bis) |
| `--pindola-top` | 130 | les fitxes i la píndola |
| `--graella-gap` | 22,5 | entre columnes |
| `--fitxa-ample` | 320,625 | l'amplada d'una fitxa amb 4 columnes |

### 4 bis. Per què `--titol-cards` val 76,8 i no 130

És el número que fa que **el text no es mogui** quan es canvia el `line-height`.
La pàgina vella el té a **130**, i per sobre hi ha el `mt-[27px]` del component
del títol: el text pintat arrenca 27 unitats **més amunt** del que la seva caixa
diu.

Amb `line-height: normal` el text ja no surt de la caixa, o sigui que **la caixa
créixer cap avall** i el text baixaria. Perquè quedi on és, el marge ha de
disminuir exactament el que ha crescut la caixa:

```
marge_nou = 130 − (caixa_normal − caixa_0,85)
```

I aquesta diferència és constant en unitats de disseny, perquè la caixa i el cos
del títol escalen tots dos amb la mateixa unitat:

| carril | caixa 0,85 | caixa normal | diferència | marge nou |
|---|---|---|---|---|
| 1350 | 71,8 | 125,0 | 53,2 | **76,8** |
| 1012,5 | 53,9 | 94,0 | 40,1 | 89,9 |

O sigui: **el text no es mou gens** i el que canvia és el número que hi ha escrit
al costat. Aquesta és la prova que el desbordament era el defecte i el marge la
seva conseqüència.

---

## 5. La regla que substitueix la fórmula

La pàgina vella necessita, avui, una fórmula de divuit termes perquè l'aire
entre galeries surti bé:

```
marge = --esp-4 + 151,9px − 0,0708 · 100vw        <- PEDAC
```

Amb aquesta especificació, la mateixa cosa s'escriu:

```css
.hg-seccio + .hg-seccio { margin-block-start: var(--esp-4); }
```

**Per què la fórmula desapareix.** Els seus dos termes eren desbordaments:
el de la píndola (que era `absolute` i no creixia el pare) i el del títol (que
no cap a la seva caixa). Sense cap dels dos, el marge **és** l'aire.

---

## 6. EL QUE QUEDA FORA, A PROPOSIT

**Les proporcions.** Aquesta especificació fa que tot escali amb la unitat, però
**no decideix quant ha de valer cada cosa a cada mida**. Mesurat a la pàgina
vella, l'escala real és `finestra / 1920` sense terra (1,00 / 0,75 / 0,667 /
0,533 / 0,40), i amb aquesta especificació la pàgina la segueix sola. El que no
està decidit és si **a 768 la pàgina ha de ser el 40 % de la de 1920** o si hi ha
un mínim per sota del qual el disseny es reajusta. És la decisió que l'amo va
deixar per més endavant, i aquest document no la pren.

**La capçalera i el peu.** Depenen de la fase 7 i del marc de pàgina.

**El contingut de la hero.** La caixa ja fa la mida que ha de fer; les
diapositives a dins són una passa propia.

---

## 7. La porta de sortida

Cada canvi es verifica amb el mateix invariant, a les cinc mides
(1920×1080, 1440×900, 1280×720, 1024×768, 768×1024):

| invariant | ha de donar |
|---|---|
| **posició del TEXT del títol** de cada col·lecció | la mateixa que ara |
| **posició de les fitxes** | la mateixa que ara |
| **mida de la fitxa** | 320,6 × 504,6 / 236,3 × 383,3 / 285 × 454 / 225 × 368 / 258,8 × 417,8 |
| **aire entre galeries** | `--esp-4`, igual a totes |
| elements `position: absolute` a la pàgina | **0** |
| marges negatius | **0** |
| números de píxels al JSX | **0** |

---

## 8. Les passes, i on són

| # | què | estat |
|---|---|---|
| 1 | **El títol amb la caixa que conté el text** (`line-height: normal`) i `--titol-cards` a 76,8 | **FETA** (`074744b`): sobreeixit 0,0 a les cinc mides, i els desplaçaments per col·lecció, fora |
| 2 | **La píndola al flux**, i fora la reserva i el voladís | **FETA** (`9140f21`): fora `reservaPindola`, `PINDOLA_VOLADIS` i el `position: relative` del bloc. Els absoluts de la pàgina baixen de 30 a 25, i els 25 que queden són dibuix |
| 3 | **La galeria al carril sencer** | **FETA** (`71db3c4`) |
| 4 | **Fora la fórmula de l'aire**; `margin-block-start: var(--esp-4)` | **REFORMULADA** (`28ad56b`): la fórmula NO es pot treure encara. **MESURAT**: `--esp-4` sol dona 120,0 px d'aire a 1920 on ara n'hi ha 271,9, perquè **el text del títol no arrenca a l'inici del seu bloc**. La fórmula queda escrita amb el perquè de cada terme, i desapareixerà quan el títol hi arrenqui |
| 5 | **Una sola escala d'aires** | **PENDENT**, i és la que necessita la decisió de les proporcions |
| — | **El marc de pàgina** (fase 1 del pla) | **FETA** per a l'inici (`911fc25`): `MarcInici`, 67 línies, i la pàgina comença al fons de la capçalera sense cap excepció |

### El que la passa 2 ha deixat a la vista

Un cop la píndola és al flux, **el marge de la secció ÉS l'aire** que es veu, i per
tant la fórmula de la passa 4 ja no cal: `--esp-4` donaria l'aire exacte. El que
passa és que l'aire baixaria de 283,3 a 271,9 px a 1920, perquè fins ara el marge
es gastava part en compensar el voladís. **És la decisió que queda per al
propietari**: quants d'aire vol entre col·leccions.

### Les passes que falten, i el que costen

- **Passa 4**: traure la fórmula i deixar `--esp-4`. Petit, però depèn de la
  decisió de dalt.
- **Passa 5**: separar `--escala` de `--escala-text` i decidir si la pàgina escala
  amb el carril o amb la finestra. És la decisió de les proporcions que el
  propietari va deixar per més endavant, i **bloqueja** l'alçada de la taula i la
  mida dels textos a les mides petites.
- **La capçalera** (fase 7 del pla): 3.196 línies, i és l'única peça que encara
  no comparteix les unitats de la pàgina.

## 9. El que això no és

No és la migració de la resta del lloc. El títol de col·lecció és el mateix
component a les pàgines de col·lecció, i canviar-lo allà és una decisió del
propietari. Aquesta especificació es prova a `/nova/inici`, on no toca ningú.

---

## 5 bis. Què vol dir «lleugera i robusta», amb números

La pàgina d'inici és la **columna vertebral** del lloc, i per tant no es pot
permetre una excepció: si aquí una cosa no està ben construïda, es propaga a
totes les pàgines que en pengin. Aquests són els criteris, mesurats.

### Lleugera

| mesura | `/` (vella) | `/nova/inici` | objectiu |
|---|---|---|---|
| nodes del `main` | 480 | **435** | no créixer |
| **codi JS de la pàgina** | 21 KB | **5,1 KB** | **no créixer** |
| absoluts | 51 | 30 | no créixer |
| `top` en línia | 57 | 36 | no créixer |
| transformacions | 84 | 61 | no créixer |

**El pes del DOM no és el codi de la pàgina: són les fitxes i la capçalera.** Els
435 nodes es reparteixen així: 20 fitxes (~16 nodes cada una, ~320), la
capçalera, i la resta. La columna vertebral pròpiament dita —les set seccions i
els seus aires— és petita, i per això la pàgina nova pesa **una quarta part** que
la vella tot i fer el mateix.

**El que això obliga:** cap peça del bloc no pot créixer per resoldre un cas.
Si una secció necessita una cosa que les altres no, va a la seva configuració,
no al component.

### Robusta

La prova no és que avui es vegi bé: és que **tocar una cosa no en mogui una
altra**. Aquesta és la propietat que la pàgina vella no té, i està mesurada:
tocar la píndola movia les col·leccions, i tocar el títol movia els marges.

L'invariant, verificable a cada passa:

| prova | ha de donar |
|---|---|
| canviar l'aire d'**una** secció | la resta de seccions no es mou |
| canviar el contingut d'**una** fitxa | la seva fila i les altres files no es mouen |
| la mateixa regla a les cinc mides | el **mateix** valor en unitats de disseny |
| elements absolut en el flux de la pàgina | **0** (els absoluts son decoració: el fons degradat i el número de fons) |
| expressions `calc` amb `vw` fora de l'escala | **0** |

**Per què els absoluts no són tots dolents.** Dels 30 que té la pàgina nova, 25
són dibuix: el fons degradat de cada fitxa (20, que ha de sobresortir de la seva
caixa) i el número de fons de cada col·lecció (5). Son decoració i no
participen de la col·locació. Els **5 que són un problema** són les píndoles,
perquè **sí** que són contingut i han d'ocupar lloc.

**La regla:** un `absolute` només s'accepta si en treure'l de la col·locació no
es perd res. La píndola no la compleix; el degradat i el número, sí.
