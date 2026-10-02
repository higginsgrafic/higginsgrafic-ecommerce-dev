# INFORME — 04/10/2026 · La taula de divisions (la hero, sense el megaslide)

> En Marc: «Calculem les divisions des del bottom del viewport fins al bottom del header. Quantes
> divisions? Tantes com calguin perquè un dels tops o bottoms de la “taula” encaixin amb el final
> del megaslide (encara que no sigui al px). A partir d'aquell punt sabràs fins on arriba el
> megaslide i podràs centrar la hero amb les divisions que et quedin del megaslide fins a baix de
> tot.» I, triat per ell entre les opcions mesurades: **«que sigui la 20. 16/2»**.

## 1. La regla

L'espai de la taula és **del bottom de la capçalera al bottom del viewport**: `100dvh −
--appHeaderOffset`. El megaslide no hi entra com a mesura: **només tria quina divisió és el seu
final**. Amb 20 divisions de sota seu, la que li toca és la `k` més propera:

```
k = round(nearest, 20 · P / (S − P), 1)        N = k + 20
```

on `S` és l'espai de la taula i `P` l'alçada del megaslide. D'aquí surt tot: la divisió fa `S / N`,
**l'aire de la hero 2 divisions i la hero 16** — o sigui 2 + 16 + 2 = 20, que són els seus 8/10 amb
l'1/10 a cada banda, ara **en divisions senceres**.

El càlcul és tot **`calc` + `round()` de CSS** (`MarcInici.jsx`, `varsHero`): el carril de la
capçalera i l'offset només existeixen com a variables de CSS (el carril es publica mesurat), i així
el primer pintat ja té la mida bona. L'efecte de repartiment llegeix **les mateixes** `k` i divisió
de les variables, i per tant el bloc del megaslide i el de la pàgina no es poden desquadrar.

Als navegadors sense `round()` (antics) es queda la fórmula de sempre: `suportaRoundCss()` decideix
quina de les dues s'escriu.

## 2. On queda la hero, mesurada a tots els formats

`node scripts/_tmp-hero-divisions.mjs` (megaslide obert, 12 formats):

| vista | S | final megaslide | divisió | k/N | hero abans | hero ara | aire dalt/baix |
|---|---|---|---|---|---|---|---|
| iPad Pro 13 1376×954 | 902 | 362 | 30,1 | 10/30 | 421,3 / 473,6 | **412,8 / 481,1** | 50,8 / 60,2 |
| iPad Air 13 1366×946 | 894 | 296 | 31,9 | 8/28 | 361,0 / 520,0 | **371,2 / 510,8** | 75,2 / 63,9 |
| Portàtil 1280×666 | 614 | 296 | 18,6 | 13/33 | 334,6 / 296,0 | **330,9 / 297,7** | 34,9 / 37,4 |
| Portàtil 1280×586 | 534 | 296 | 14,4 | 17/37 | — / 232,0 | **326,0 / 230,9** | 30,0 / 29,1 |
| iPad Air 11 1180×742 | 690 | 331 | 20,3 | 14/34 | 372,8 / 324,2 | **376,5 / 324,7** | 45,5 / 40,8 |
| Model 1200×820 | 768 | 331 | 24,0 | 12/32 | 379,6 / 386,6 | **388,0 / 384,0** | 57,0 / 48,0 |
| Model 1180×780 | 728 | 331 | 22,0 | 13/33 | 376,3 / 354,6 | **382,7 / 353,0** | 51,7 / 44,3 |
| iPad 10.2 1024×690 | 638 | 296 | 19,9 | 12/32 | 335,4 / 315,2 | **331,1 / 319,0** | 35,1 / 39,9 |
| Portàtil 1440×900 | 848 | 311,1 | 29,2 | 9/29 | 369,4 / 467,2 | **373,6 / 467,9** | 62,5 / 58,6 |
| Escriptori 1920×1080 | 1028 | 369,1 | 35,4 | 9/29 | 440,3 / 570,3 | **441,8 / 567,2** | 72,7 / 71,0 |

Els blocs quadren exactes: a 1376, `blocMega` 300,6 + `blocPagina` 601,4 = **902** = l'espai de la
taula. I a la vertical (1032×1304 i 768×952) no s'hi aplica res: la regla és de l'horitzontal.

## 3. El que guanya: la hero ja no es mou MAI

Mesurat a 1376×954, mostrejant cada 900 ms des del primer pintat, amb el megaslide **tancat** i
**obert**:

| | 900 ms | 1.800 ms | 6.000 ms |
|---|---|---|---|
| tancat | 412,8 / 481,1 | 412,8 / 481,1 | 412,8 / 481,1 |
| obert | 412,8 / 481,1 | 412,8 / 481,1 | 412,8 / 481,1 |

El panell, mentrestant, fa el seu camí (la vora va de 336 a 362 durant l'animació d'obertura) i la
hero **no se'n entera**: la seva mida i la seva posició surten de la taula, no de la vora publicada
ni de l'obertura. És la primera vegada que la hero és literalment la mateixa xifra als quatre estats
(carregar tancat, carregar obert, obrir, tancar).

## 4. No-regressió

- **13 vistes** (`node scripts/_tmp-ipad13-abans-despres.mjs`): `diff` **sense cap diferència**. El
  megaslide, la franja, el selector, la graella, la col·lecció, les cintures, el cadenat i les
  icones queden exactament igual; l'única peça que es mou és la hero (i les icones, com a molt uns
  píxels, perquè el seu bloc ara és la divisió).
- `npx vitest run` **600/600**; `npx eslint` dels fitxers tocats **0 errors**; `npx vite build` OK;
  `node scripts/mesura-formats.mjs` **0 i 0**.
- `npm run compara-vistes` falla **igual abans i després** (sortida idèntica): dues vistes on el
  clic de les 2.500 ms arriba abans que l'aplicació hagi pintat, i les cintures de 1440 (7,6 i
  7,2 px). És previ.

## 5. El que queda obert

- **El desajust del final del megaslide amb la línia.** La línia és la divisió, i el megaslide acaba
  on acaba: a 1376 la diferència és de **9,4 px** (la línia cau per sobre del panell), i per això
  l'aire de dalt de la hero es veu de 50,8 px i el de sota de 60,2. És el que va dir l'amo («encara
  que no sigui al px»). Si es volguessin els dos aires iguals, l'opció és fer acabar el megaslide
  exactament a la divisió, ajustant-li l'aire de sota (`extraAireSota`: 6 px al megaslide 1100 i
  26 px a l'iPad Pro 13) — amb 20 divisions l'ajust seria de com a molt ±11 px.
- **La vertical** (1032×1304): la regla no s'hi aplica i allà l'estimació encara va 309 px enlaire
  (diu 358 i el megaslide en fa 667). És el tema pendent de la vertical.
- `round()` de CSS demana un navegador modern (Chrome 125+, Safari 15.4+, Firefox 118+). Als antics
  queda la fórmula vella, que és correcta dins dels ~6 px de l'estimació.
