# PROMPT D'INICI PER A LA SESSIÓ SEGÜENT

> Copia i enganxa això tal qual com a primer missatge de la sessió nova.

---

Treballes al projecte `higginsgrafic-ecommerce-dev`
(`/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/BOTIGUES/ECOMMERCE/PROJECTE/ECOMMERCE-WEB/higginsgrafic-ecommerce-dev`).

**PRIMER DE TOT, llegeix aquests dos documents i no facis res més fins a
haver-los llegit:**

1. `docs/informes/MEMORIA-sessio-seguent.md` — l'estat del projecte, el que s'ha
   fet, el que queda i **per què** no s'ha fet.
2. `docs/informes/PLA-arquitectura-nova.md` — especialment la **secció 9** (la
   hero de l'inici, amb els tres factors d'escala) i la **secció 10** (l'informe
   de la sessió anterior).

## Regles de la casa, no negociables

1. **Tot en català**: commits, comentaris i respostes.
2. **El servidor de desenvolupament ja corre a `http://127.0.0.1:3003`. NO
   aixequis cap altre servidor** i no el reinicis.
3. **Verifica sempre amb les tres comandes**: `npx vitest run` (han de passar
   462 proves), `npm run compara-vistes` (ha de dir OK), `npx vite build`.
4. **Els scripts temporals** van a `scripts/_tmp-*.mjs` i **s'esborren** en
   acabar. No es commitegen mai.
5. **Els commits expliquen la CAUSA** del problema, no el símptoma.
6. **Una instrucció alhora.** No avancis sense que t'ho digui.
7. **No toquis el megaslide** sense que t'ho demani: està calibrat a un llenç de
   1920 i es descalibra fàcilment.
8. **No toquis el `font-size` de l'arrel**: 315 fitxers fan servir `rem`.
9. **Els 15 errors d'eslint de `FullWideSlideHeader.jsx` són preexistents.** No
   n'has d'afegir cap.

## Com vull que treballis

- **Verifica les teves afirmacions amb mesures.** Si dius que una cosa funciona,
  ha d'estar mesurada a les cinc mides (1920×1080, 1440×900, 1280×720,
  1024×768 i 768×1024). **La que controlem és 768×1024.**
- **Abans de tocar una pàgina, mesura'n l'estat i digue'm què has trobat.**
- **Si un número et surt absurd, atura't.** No l'apliquis mai. A la sessió
  anterior es va arribar a escriure `top: 5749px` perquè una mesura estava
  malament i no es va detectar.
- **No facis intents a cegues.** Si una cosa falla dues vegades, atura't i
  explica per què abans de provar una tercera.
- **Avisa'm si estàs a punt de tocar alguna cosa que sembli calibrada a mà.**
- **No em calen captures**: ho veig en directe. Però si cal discutir una
  geometria, dibuixa'm els contenidors.

## La feina pendent, per ordre

### 1. La hero de la pàgina d'inici (el que jo triaria)

És el que està documentat a la **secció 9** del pla, i **s'hi ha fracassat quatre
vegades**. Té **tres factors d'escala encadenats** i el bloc contenidor **no és
el viewport**. Ara funciona, però amb una mesura des de JavaScript.

**No ho intentis a estones.** Si hi entrem, és una tasca amb principi i final:
primer mesures i documentes, després el canvi, i al final verifiques que **la mida
visible no ha canviat** i que el fons queda a 20 px del fons de la pantalla.

### 2. La migració del pla (fases 2 a 7)

El fonament (`src/foundation.css`) existeix però **no té cap consumidor**. La
migració és **més mecànica del que semblava**, perquè a 1920 i 1440 l'escala del
megaslide i la unitat nova **ja són el mateix nombre**.

Ordre: la pàgina d'inici → una col·lecció → les cinc col·leccions → el
constructor → la PDP → el header.

### 3. La incoherència de proporcions del megaslide

Dins el megaslide conviuen **dos sistemes de mesura** (el text amb `carrilPx`,
lligat al llenç de 1920, i les files amb valors propis de cada dispositiu). Els
terra de 10 px i 12 px que hi ha són pedaços.

### 4. L'objectiu tàctil del selector

Les files fan **11 px d'alçada** i no es poden expandir. Però **11 px no és
toca-ble amb el dit**. Cal repensar-ho amb el disseny al davant.

---

**Comença llegint els dos documents i digue'm en quin estat veus el projecte i
quina de les quatre feines proposes atacar. No toquis res encara.**
