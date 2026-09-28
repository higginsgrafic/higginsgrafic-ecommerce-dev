# Continuar: la columna de col·leccions (vertical, pàgina 2)

**Data**: 28/09/2026, vespre · **Branca**: `main` · Tot el que diu aquest document està **desat i pujat**.

---

## La feina pendent, en una frase

Donar l'**índex** al `map` de les files de la columna de col·leccions i ancorar la pastilla blanca **a dalt** quan és la primera filera i **a baix** quan és l'última, amb el mateix coixí de 5 px. Així la pastilla (que fa els 24,6 px del selector i no s'ha de modificar) té sempre el mateix aire respecte de la vora de la caixa que li queda més a prop.

### Per què cal

Amb **9 files de 27,15 px**, una pastilla de **24,6 px** no pot tenir 5 px a dalt i 5 a baix alhora: la filera hauria de fer 36,6 px i 9 files en són 329 contra els 244,4 de la caixa. Ancorant-la a la vora que li toca, el coixí sí que queda igual a dalt i a baix de la columna.

### Els dos llocs exactes

Fitxer: **`src/components/fullwide/CercadorTextRow.jsx`**, component `CercadorColleccionsColumna`, branca `if (caixes)` (la de la taula vertical).

1. **El map de les files** (cap a la línia 1198). Avui és una fletxa amb **retorn implícit**:

   ```jsx
   {llista.map(({ key, label }) => (
     <button … >…</button>
   ))}
   ```

   S'ha de convertir a bloc (les dues edicions **alhora**, si no no compila):

   ```jsx
   {llista.map(({ key, label }, idxFila) => {
     const ultima = idxFila === llista.length - 1;
     return (
       <button … >…</button>
     );
   })}
   ```

   Dues temptatives fetes avui han fallat precisament aquí (el tancament no era on el buscava) i **el fitxer es va quedar intacte**: comprova sempre l'estat amb `git status` abans i després.

2. **L'estil del botó** (cap a la línia 1236). Avui té:

   ```js
   height: key === activeKey ? '24.6px' : '100%',
   alignSelf: 'flex-start',
   marginTop: key === activeKey ? '5px' : 0,
   ```

   i ha de quedar:

   ```js
   height: key === activeKey ? '24.6px' : '100%',
   alignSelf: key === activeKey ? (ultima ? 'flex-end' : 'flex-start') : 'center',
   marginTop: key === activeKey && !ultima ? '5px' : 0,
   marginBottom: key === activeKey && ultima ? '5px' : 0,
   ```

### Com es comprova

- `node scripts/_tmp-offset-pastilles.mjs` mesura la caixa, la pastilla i els offsets de les dues (selector i columna). Ha de donar: selector **93,8 × 24,6** i columna **118,6 × 24,6**; offsets esquerra/dreta **6** i, amb FIRST CONTACT actiu, dalt **6**; amb CUBE o MISCEL·LÀNIA actiu, baix **6**.
- `node scripts/_tmp-vert-foto2.mjs <etiqueta>` captura les taules de la p1 i la p2 i diu si hi ha errors de consola.
- Bateria (quan l'amo digui «ja està»): `npx vitest run` (595 proves / 46 fitxers), `npx eslint <fitxers tocats>` amb els comptes de `HEAD`, i les de disseny.

---

## El que s'ha après avui (per no repetir errors)

- **Dues taules que es confonen** a `src/config/stripeCalibrationsVertical.js`, totes dues indexades per **imatge** i no per nom:
  - `STRIPE_DRAWING_DY_VERTICAL` → el **desplaçament vertical** (valors ~28).
  - `STRIPE_DRAWING_ESCALA_VERTICAL` → la **mida** (factors com 1,1; el Cybercube ja hi era).
  Avui vaig multiplicar la primera creient que era la mida i el que vaig fer va ser moure el dibuix.
- **La pastilla i el coixí**: la mida de la del selector són **24,6 px**; l'inset de 5 px el fixa `sliderInset` al selector i `calc(100% - 10px)` a la columna; la **vora d'1 px** de la caixa fa que des de fora siguin 6.
- **El pas de les caselles de la franja** (`MegaStripePanel.jsx`, bloc `rectsMascara`): les caselles es reparteixen `100/7` i s'obren amb un factor (`* 1.0025` = +0,25%); la **primera queda clavada a 0**. S'hi van provar el 2%, el 5% i el 20%.
- **`scripts/vector-franja.mjs`** regenera `src/config/vectorFranja.js` des de l'SVG de la franja. La constant `VECTOR_FRANJA_VIEWBOX_OBERT` ja no porta el número vell (694,05), que era la causa de l'osca del retall als dibuixos.
- **Els dibuixos de la franja**: l'escala general és 1,155 (`--hgStripeDrawingExtraScale`); els desplaçaments són `--hgStripeDrawingExtraDx/Dy` i, per a la filera de dalt, `...DxFilaDalt` i `...DyFilaDalt`, que desplacem per separat.
- **Regla de la casa** (constitució, regla 1): **commit i push sempre; desplegar, mai.** No cal esperar el «ja està» ni la bateria per desar.

---

## Altres coses obertes (cap d'urgent)

- La **p1 vertical** té el mateix bloc de caselles (`MegaStripePanelP1.jsx`) i no s'hi ha aplicat l'obertura del 0,25%.
- **Cyberman «corre» en fer scroll** (descrit per l'amo, no reproduït): les quatre variants són a les dues taules i al component dels dibuixos no hi ha cap transició. Caldrà precisar si salta o llisca.
- **«LOOKING FOR MY D…»** surt tallat a la columna (l'amplada de la casella).
- Els **`_tmp-*`** (captures i guions de mesura) són sense seguir. Els guions que valen la pena es poden quedar; els PNG es poden esborrar.
- **La bateria sencera** no s'ha passat avui.
