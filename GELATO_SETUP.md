# Configuració de Gelato Print on Demand

## ✅ CONFIGURACIÓ COMPLETADA!

La clau API de Gelato ja està configurada i el sistema està preparat per sincronitzar productes reals!

**Clau API configurada**: `065e87f5-53b9-462c-9106-c184736ea1e9...`

## Estat actual de la configuració

**Clau API**: ✅ Configurada
**Endpoints**: ✅ Actualitzats a Gelato API v3
**Base de dades**: ✅ Supabase preparada
**Col·leccions**: ✅ Limitades a 4 productes (showroom)

### Endpoints utilitzats:
- `https://product.gelatoapis.com/v3` - API de productes
- `https://order.gelatoapis.com/v4` - API de comandes

### Canvis realitzats:

1. **Configuració `.env`**:
   - Clau API de Gelato afegida
   - Mode sandbox desactivat (producció)

2. **Codi actualitzat**:
   - Client Gelato actualitzat per utilitzar API v3
   - Suport per múltiples catàlegs
   - Millor gestió d'errors

3. **Showroom de col·leccions**:
   - Cada pàgina de col·lecció mostra només 4 productes
   - FirstContactPage, TheHumanInsidePage, OutcastedPage, AustenPage, CubePage

## Com sincronitzar els productes reals

Ara que tot està configurat, podeu sincronitzar els productes reals de Gelato:

### Pas 1: Iniciar el servidor de desenvolupament

```bash
npm run dev
```

### Pas 2: Anar a la pàgina d'administració

1. Obriu el navegador i aneu a `http://localhost:3000/admin`
2. Feu clic al botó **"Sincronitzar amb Gelato"**
3. El sistema farà el següent:
   - Baixarà els primers 30 productes disponibles al vostre compte Gelato
   - Els distribuirà automàticament entre les 5 col·leccions (first-contact, the-human-inside, austen, cube, outcasted)
   - Guardarà cada producte a la base de dades Supabase
   - Mostrarà un resum amb el nombre de productes sincronitzats
4. Veureu un missatge confirmant la sincronització

**Nota important**: La sincronització utilitza els productes que teniu configurats al vostre compte de Gelato. Assegureu-vos de tenir productes al vostre catàleg abans de sincronitzar.

**Primera sincronització**: La sincronització pot trigar 1-2 minuts. Podeu veure el progr és a la consola del navegador (F12).

## Estat actual del projecte

**Productes mock a Supabase**: 60 productes amb imatges SVG

Els productes mock actuals són:
- **First Contact**: 12 productes (FC-001 a FC-012)
- **The Human Inside**: 12 productes (THI-001 a THI-012)
- **Outcasted**: 12 productes (OUT-001 a OUT-012)
- **Austen**: 14 productes (AUS-001 a AUS-014)
- **Cube**: 10 productes (CUBE-001 a CUBE-010)

**Visualització de col·leccions**: Cada pàgina de col·lecció mostra només **4 productes com a showroom** (showroom limitat).

Després de sincronitzar amb Gelato, aquests productes mock es poden mantenir o substituir pels productes reals de Gelato.

## Mapejat de productes

Els productes de Gelato es distribueixen automàticament entre les 5 col·leccions de forma equitativa:

- **first-contact**: Productes assignats algorítmicament
- **the-human-inside**: Productes assignats algorítmicament
- **austen**: Productes assignats algorítmicament
- **cube**: Productes assignats algorítmicament
- **outcasted**: Productes assignats algorítmicament

Cada producte obté:
- **Nom**: Generat des del `productNameUid` de Gelato
- **Descripció**: Nom + "- Print on Demand"
- **Preu**: 29.99 EUR (podeu canviar-ho després)
- **Imatges**: URL placeholder temporal (hauríeu de pujar imatges reals)
- **Talles**: Extretes de les dimensions del producte Gelato

Podeu personalitzar aquest mapejat editant el fitxer `src/api/gelato.js`.

## ⚠️ Important: Configuració del catàleg Gelato

Els productes sincronitzats són els que teniu al vostre compte de Gelato. Si el vostre compte és nou o no té productes configurats, haureu de:

1. **Anar al [Gelato Dashboard](https://dashboard.gelato.com)**
2. **Crear o importar productes al vostre catàleg**:
   - Aneu a "Products" o "Catalog"
   - Afegiu productes de samarretes (t-shirts)
   - Configureu les opcions de print on demand
3. **Torneu a sincronitzar**:
   - Un cop tingueu productes al catàleg, torneu a fer la sincronització

**Nota**: Si no veieu els productes que espereu, potser el vostre catàleg conté altres tipus de productes (posters, canvas, etc.). El sistema sincronitzarà el que tingueu disponible.

## Troubleshooting

### Error: "No s'han trobat productes a Gelato"

Això significa que el vostre compte Gelato no té productes configurats:
1. Aneu al [Gelato Dashboard](https://dashboard.gelato.com)
2. Configureu el vostre catàleg de productes
3. Assegureu-vos que els productes estan "Published" o "Activated"
4. Torneu a intentar la sincronització

### Error: "Gelato API error" o "HTTP 401"

Això indica que hi ha un problema amb l'autenticació:
1. Verifiqueu que la clau API és correcta al fitxer `.env`
2. Assegureu-vos que la clau no ha expirat al dashboard de Gelato
3. Reinicieu el servidor de desenvolupament: `Ctrl+C` i després `npm run dev`

### Error: "No s'han trobat catàlegs"

Això pot passar si:
1. El vostre compte de Gelato és nou i encara no té catàlegs
2. La clau API no té els permisos necessaris
3. Comproveu al [Gelato Dashboard](https://dashboard.gelato.com) que teniu catàlegs disponibles

### Els productes no es sincronitzen

1. Comproveu la consola del navegador (F12) per veure errors detallats
2. Comproveu que teniu connexió a Internet
3. Reviseu que la base de dades Supabase és accessible
4. Intenteu sincronitzar els productes mock primer per verificar la connexió a Supabase

### Els productes es sincronitzen però no es veuen

1. Aneu a `/admin` i feu clic a "Recarregar productes"
2. Comproveu que `VITE_USE_MOCK_DATA=false` al fitxer `.env`
3. Reinicieu el servidor

## API Reference

### Endpoints de Productes (v3)

Base URL: `https://product.gelatoapis.com/v3`

- `GET /catalogs` - Llistar catàlegs disponibles
- `GET /products?catalogUid={uid}` - Cercar productes d'un catàleg
- `GET /products/{productUid}` - Obtenir detalls d'un producte
- `GET /products/{productUid}/prices` - Obtenir preus d'un producte

### Endpoints de Comandes (v4)

Base URL: `https://order.gelatoapis.com/v4`

- `POST /orders` - Crear una comanda
- `GET /orders/{orderId}` - Obtenir estat d'una comanda
- `DELETE /orders/{orderId}` - Cancel·lar una comanda
- `POST /quotes` - Obtenir pressupost per una comanda

### Autenticació

Totes les peticions requereixen el header:
```
X-API-KEY: la_vostra_clau_api
```

Documentació completa: [Gelato API Docs](https://dashboard.gelato.com/docs/)
