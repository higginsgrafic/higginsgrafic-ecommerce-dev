# Productes en Blanc de Gelato

Sistema per obtenir i guardar dades de productes en blanc de Gelato per a comparació i referència.

## Què són els productes en blanc?

Els productes en blanc són les samarretes, sudaderes i altres articles base que Gelato ofereix abans d'aplicar-hi cap disseny. Aquestes dades són útils per:

- Comparar especificacions tècniques (pes, composició, mides)
- Veure preus base dels productes
- Analitzar variants disponibles (talles, colors)
- Guardar referències de productes específics (com el Gildan 5000)

## Base de Dades

### Taula: `gelato_blank_products`

Estructura:
- `id` - UUID únic
- `gelato_product_uid` - ID del producte a Gelato
- `product_name` - Nom del producte
- `product_type` - Tipus (tshirt, hoodie, etc)
- `brand` - Marca (Gildan, Bella+Canvas, etc)
- `full_data` - JSON amb totes les dades del producte
- `variants_data` - JSON amb variants/dimensions
- `pricing_data` - JSON amb preus
- `available_sizes` - Array de talles disponibles
- `available_colors` - Array de colors disponibles
- `notes` - Notes i observacions
- `fetched_at` - Quan es va obtenir la informació
- `created_at` / `updated_at` - Timestamps

## Com Utilitzar

### 1. Obtenir Productes

Utilitza l'script per buscar i guardar productes:

```bash
# Buscar per nom de producte
npm run fetch-blank "Gildan 5000"

# Buscar per tipus
npm run fetch-blank "t-shirt"

# Buscar per marca
npm run fetch-blank "gildan"
```

**Descàrrega d'Imatges:**
L'script automàticament intenta descarregar totes les imatges/mockups disponibles dels productes i les guarda a Supabase Storage (`product-images/gelato-blank/`). Les URLs locals es guarden al camp `stored_images`.

### 2. Visualitzar Dades

Accedeix a la pàgina administrativa:

```
http://localhost:3000/admin/gelato-blank
```

Aquesta pàgina mostra:
- Tots els productes guardats
- Especificacions tècniques
- Preus i variants
- Dades JSON completes (expandibles)

### 3. Dades Disponibles

Per cada producte guardat pots veure:

**Informació Bàsica:**
- Categoria i subcategoria
- Talla i color
- Tipus de tall (unisex, mens, womens)
- Qualitat (classic, premium, etc)

**Especificacions Tècniques:**
- Pes (grams)
- GSM (grams per metre quadrat)
- Composició de la tela (100% Cotton, etc)
- Dimensions (amplada, altura)
- Codi HEX del color

**Preus:**
- Preu base
- Moneda
- País de referència
- Quantitat

**Fabricant:**
- Nom del fabricant
- SKU del fabricant (si disponible)

## Exemples de Cerca

### Cercar Samarretes
```bash
npm run fetch-blank "t-shirt"
```

Troba tots els productes de tipus "t-shirt" al catàleg.

### Cercar Productes Gildan
```bash
npm run fetch-blank "gildan"
```

Troba tots els productes que continguin "gildan" en el nom o UID.

### Cercar Model Específic
```bash
npm run fetch-blank "18000"
```

Cerca el model específic Gildan 18000 (sweatshirt).

## Notes Importants

1. **Productes Individuals**: L'API de Gelato retorna productes individuals amb variants específiques. Per exemple, "t-shirt XL military-green" és un producte separat de "t-shirt M white".

2. **Actualitzacions**: Si tornes a executar la cerca pel mateix producte, les dades s'actualitzen automàticament.

3. **Marca**: Actualment molts productes no especifiquen la marca al camp `ApparelManufacturer`. La marca s'extrau del UID del producte quan és possible.

4. **Catàleg**: El catàleg retorna 100 productes. Pot contenir posters, canvas, cards, etc. Utilitza termes específics per filtrar.

## Estructura de Dades Completes

### Full Data (full_data)
```json
{
  "productUid": "apparel_product_gca_t-shirt_...",
  "weight": { "value": 177, "measureUnit": "grams" },
  "attributes": {
    "GarmentCategory": "t-shirt",
    "GarmentSize": "XL",
    "GarmentColor": "military-green",
    "GarmentQuality": "classic",
    "GarmentCut": "unisex"
  },
  "dimensions": {
    "GSM": { "value": "153", "measureUnit": "g/m2" },
    "Fabric Composition": { "value": "100% Cotton" },
    "Color HEX Code": { "value": "#5E7461" }
  }
}
```

### Pricing Data (pricing_data)
```json
[
  {
    "price": 14.29,
    "currency": "USD",
    "country": "US",
    "quantity": 1,
    "productUid": "apparel_product_..."
  }
]
```

## Desenvolupament Futur

Possibles millores:
- Cerca avançada amb filtres (per talla, color, preu)
- Comparació entre productes
- Exportació de dades a CSV/JSON
- Historial de canvis de preus
- Integració amb el sistema de productes principal

## Scripts Relacionats

- `scripts/fetch-blank-product.js` - Script principal per obtenir dades
- `src/pages/GelatoBlankProductsPage.jsx` - Pàgina de visualització
- `supabase/migrations/*_create_gelato_blank_products_table.sql` - Migració DB
