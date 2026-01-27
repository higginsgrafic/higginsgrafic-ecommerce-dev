# Sistema de Gestió de Mockups

Sistema complet per gestionar imatges de previsualització (mockups) dels productes amb suport per múltiples colors i variants.

## Estructura de la Base de Dades

### Taula `product_mockups`

```sql
- id (uuid) - Identificador únic
- collection (text) - Col·lecció (first-contact, austen, cube, etc.)
- subcategory (text) - Subcategoria nivell 1 (opcional)
- sub_subcategory (text) - Subcategoria nivell 2 (opcional)
- design_name (text) - Nom del disseny (nx-01, persuasion, etc.)
- drawing_color (text) - Color del disseny (black, white, blue)
- base_color (text) - Color base del producte (white, black, navy)
- product_type (text) - Tipus de producte (tshirt, mug, hoodie)
- file_path (text) - Ruta del fitxer mockup
- variant_id (uuid) - Enllaç a product_variants (opcional)
- is_active (boolean) - Si el mockup està actiu
- display_order (integer) - Ordre de visualització
- created_at (timestamptz)
- updated_at (timestamptz)
```

## Organització de Mockups

### Estructura bàsica (First Contact, Cube)

```
first-contact/
  ├── nx-01-black-white-tshirt.jpg
  ├── nx-01-white-black-tshirt.jpg
  ├── nx-01-black-navy-tshirt.jpg
  └── discovery-black-white-tshirt.jpg
```

### Estructura amb subcategories (Austen)

```
austen/
  ├── frases/
  │   ├── quotes/
  │   │   ├── it-is-a-truth-black-white-tshirt.jpg
  │   │   └── persuasion-black-white-tshirt.jpg
  │   └── dialogue/
  │       └── wit-black-white-tshirt.jpg
  └── encreuats/
      └── looking-for/
          └── mr-darcy-black-white-tshirt.jpg
```

### Convencions de noms

Format: `{design-name}-{drawing-color}-{base-color}-{product-type}.{ext}`

Exemples:
- `nx-01-black-white-tshirt.jpg`
- `persuasion-white-navy-tshirt.png`
- `brain-circuit-blue-black-hoodie.jpg`

## Importació de Mockups

### 1. Importar des de CSV

Crea un fitxer CSV amb aquesta estructura:

```csv
collection,subcategory,sub_subcategory,design_name,drawing_color,base_color,product_type,file_path,variant_id,display_order
first-contact,,,nx-01,black,white,tshirt,/products/first-contact-001.svg,,0
first-contact,,,nx-01,white,black,tshirt,/products/first-contact-002.svg,,1
austen,frases,quotes,it-is-a-truth,black,white,tshirt,/products/austen-001.svg,,0
```

Importar:

```bash
node scripts/import-mockups.js --csv mockups.csv
```

### 2. Escannejar directori

Organitza els mockups en carpetes seguint les convencions de noms:

```bash
node scripts/import-mockups.js --scan ./public/mockups
```

### 3. Mode dry-run (previsualització)

Prova la importació sense inserir dades:

```bash
node scripts/import-mockups.js --csv mockups.csv --dry-run
node scripts/import-mockups.js --scan ./public/mockups --dry-run
```

## API de Mockups

### src/api/mockups.js

```javascript
import { mockupsAPI } from '@/api/mockups';

// Obtenir tots els mockups
const mockups = await mockupsAPI.getAll();

// Filtrar per col·lecció
const mockups = await mockupsAPI.getAll({
  collection: 'first-contact',
  base_color: 'white'
});

// Obtenir per disseny específic
const mockups = await mockupsAPI.getByDesign('first-contact', 'nx-01');

// Obtenir variacions d'un disseny
const variations = await mockupsAPI.getVariations('nx-01', {
  base_color: 'white'
});

// Obtenir mockups d'una variant
const mockups = await mockupsAPI.getByVariant(variantId);

// Crear mockup
await mockupsAPI.create({
  collection: 'first-contact',
  design_name: 'nx-01',
  drawing_color: 'black',
  base_color: 'white',
  product_type: 'tshirt',
  file_path: '/mockups/nx-01-black-white.jpg'
});

// Actualitzar
await mockupsAPI.update(mockupId, {
  display_order: 5,
  is_active: true
});

// Eliminar
await mockupsAPI.delete(mockupId);

// Obtenir col·leccions disponibles
const collections = await mockupsAPI.getCollections();

// Obtenir dissenys d'una col·lecció
const designs = await mockupsAPI.getDesignNames('first-contact');

// Obtenir colors disponibles
const baseColors = await mockupsAPI.getColors('base');
const drawingColors = await mockupsAPI.getColors('drawing');
```

## Components React

### ProductMockups Component

Component per mostrar mockups en pàgines de producte:

```jsx
import ProductMockups from '@/components/ProductMockups';

function ProductPage() {
  return (
    <ProductMockups
      collection="first-contact"
      designName="nx-01"
      onMockupChange={(mockup) => {
        console.log('Selected mockup:', mockup);
      }}
    />
  );
}

// Amb variant específica
<ProductMockups
  collection="first-contact"
  variantId={variantId}
/>
```

### Característiques:

- Filtratge per color base i color de disseny
- Navegació entre mockups (anterior/següent)
- Galeria de miniatures
- Gestió automàtica d'errors d'imatge
- Callback quan canvia el mockup seleccionat

## Pàgina d'Administració

Accés: `/mockups`

### Funcionalitats:

1. **Filtres avançats**
   - Col·lecció
   - Disseny
   - Color base
   - Color de disseny
   - Tipus de producte
   - Estat (actiu/inactiu)

2. **Gestió de mockups**
   - Afegir nou mockup
   - Editar inline
   - Activar/desactivar
   - Eliminar
   - Ordenar

3. **Exportació**
   - Exportar a CSV tots els mockups filtrats

4. **Previsualització**
   - Miniatures de tots els mockups
   - Informació detallada de cada mockup

## Casos d'Ús

### 1. Mostrar mockups per un producte

```jsx
import { useState } from 'react';
import ProductMockups from '@/components/ProductMockups';

function ProductDetailPage({ product }) {
  const [selectedMockup, setSelectedMockup] = useState(null);

  return (
    <div>
      <ProductMockups
        collection={product.collection}
        designName={product.design}
        onMockupChange={setSelectedMockup}
      />

      {selectedMockup && (
        <div>
          <p>Color base: {selectedMockup.base_color}</p>
          <p>Color disseny: {selectedMockup.drawing_color}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. Enllaçar mockups amb variants

```javascript
// Al crear un producte, enllaça mockups amb variants
const variant = await createVariant({
  product_id: productId,
  size: 'M',
  color: 'white'
});

// Assigna mockups a la variant
await mockupsAPI.update(mockupId, {
  variant_id: variant.id
});

// Després pots obtenir els mockups de la variant
const mockups = await mockupsAPI.getByVariant(variant.id);
```

### 3. Gestió dinàmica de mockups

```javascript
// Obtenir totes les variacions d'un disseny
const variations = await mockupsAPI.getVariations('nx-01');

// Agrupar per color base
const byBaseColor = variations.reduce((acc, m) => {
  if (!acc[m.base_color]) acc[m.base_color] = [];
  acc[m.base_color].push(m);
  return acc;
}, {});

// Ara pots mostrar opcions per cada color
Object.entries(byBaseColor).forEach(([color, mockups]) => {
  console.log(`${color}: ${mockups.length} opcions`);
});
```

## Millors Pràctiques

### Nomenclatura

1. **Dissenys**: kebab-case (nx-01, brain-circuit, it-is-a-truth)
2. **Colors**: minúscules anglès (black, white, navy, royal-blue)
3. **Col·leccions**: kebab-case (first-contact, the-human-inside)

### Organització d'imatges

1. Utilitza formats web optimitzats (WebP, SVG quan sigui possible)
2. Mida recomanada: 800x800px mínim
3. Comprimeix imatges abans de pujar-les
4. Utilitza noms descriptius i consistents

### Estructura de dades

1. **Subcategories**: només per col·leccions amb molts dissenys (com Austen)
2. **Variant ID**: assigna només quan hi ha correspondència directa 1:1
3. **Display order**: deixa espai entre números (0, 10, 20...) per facilitar reordenació

### Rendiment

1. Activa només mockups que s'utilitzen
2. Elimina mockups obsolets regularment
3. Utilitza el filtre is_active per consultes públiques
4. Implementa lazy loading en galeries grans

## Troubleshooting

### Les imatges no es mostren

1. Verifica que el file_path és correcte
2. Comprova que la imatge existeix a public/
3. Revisa la consola per errors 404

### L'import falla

1. Verifica el format del CSV
2. Comprova que totes les columnes requerides estan presents
3. Utilitza --dry-run per detectar errors

### Mockups duplicats

```javascript
// Cerca duplicats
const mockups = await mockupsAPI.getAll();
const duplicates = mockups.filter((m, i, arr) =>
  arr.findIndex(x =>
    x.collection === m.collection &&
    x.design_name === m.design_name &&
    x.base_color === m.base_color &&
    x.drawing_color === m.drawing_color
  ) !== i
);

// Elimina duplicats mantenint només el primer
for (const dup of duplicates) {
  await mockupsAPI.delete(dup.id);
}
```

## Roadmap

- [ ] Pujada d'imatges directament des de l'admin
- [ ] Generació automàtica de mockups amb IA
- [ ] Integració amb Gelato per mockups automàtics
- [ ] Sistema de tags per categorització avançada
- [ ] Previsualització 360° de productes
- [ ] Exportació de mockups per xarxes socials
