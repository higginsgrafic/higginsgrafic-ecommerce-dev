# Estructura de Supabase al Projecte

## Configuració

### Variables d'entorn (.env)
```
VITE_USE_MOCK_DATA=true          # false per utilitzar Supabase
VITE_SUPABASE_URL=https://jnuuejlxuyqhhkfucuxg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## Client de Supabase

**Ubicació única**: `src/api/supabase-products.js`

El client de Supabase es crea **només una vegada** en aquest fitxer i s'exporta per ser reutilitzat per tots els altres mòduls.

```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(supabaseUrl, supabaseKey);
export { supabase };
```

## Estructura de la Base de Dades

### Taules principals

#### 1. **products**
- Productes principals de la botiga
- Camps: id, gelato_product_id, name, description, price, currency, category, collection, sku, is_active
- Relacions: product_images, product_variants

#### 2. **product_images**
- Imatges dels productes
- Camps: id, product_id, url, position
- Relació: products (ON DELETE CASCADE)

#### 3. **product_variants**
- Variants de productes (colors, mides, preus)
- Camps: id, product_id, gelato_variant_id, sku, size, color, color_hex, price, stock, is_available, image_url, design
- Relació: products (ON DELETE CASCADE)

#### 4. **product_mockups**
- Mockups de productes per la galeria
- Camps: id, variant_id, collection, design_name, base_color, drawing_color, product_type, mockup_url, display_order, is_active
- Gestió de variacions de disseny i color

#### 5. **promotions_config**
- Configuració del banner de promocions
- Camps: id, enabled, text, link, bg_color, text_color, font_size, font, clickable

#### 6. **media_pages**
- Configuració de pàgines multimèdia (Under Construction, etc.)
- Camps: id, page_key, enabled, title, subtitle, image_url, background_type, gradient_start, gradient_end

#### 7. **hero_config**
- Configuració de la secció hero de la home
- Camps: id, enabled, title, subtitle, image_url, cta_text, cta_link

#### 8. **collections_config**
- Configuració de col·leccions al Dock
- Camps: id, name, slug, icon_url, enabled, display_order

### Storage Buckets

#### **media**
- Bucket per emmagatzemar imatges i fitxers
- Accés públic per lectura
- Organització per carpetes

## Mòduls API

### 1. `src/api/supabase-products.js`
**Responsabilitat**: Gestió de productes
- `productsService.getProducts()`
- `productsService.getProductById(id)`
- `productsService.getProductsByCollection(collection)`
- `productsService.searchProducts(searchTerm)`
- `productsService.createProduct(product)`
- `productsService.updateProduct(id, updates)`
- `productsService.deleteProduct(id)`

### 2. `src/api/storage.js`
**Responsabilitat**: Gestió de fitxers
- `uploadFile(file, folder)`
- `deleteFile(filePath)`
- `getPublicUrl(filePath)`
- `listFiles(folder)`
- `createFolder(folderPath)`

### 3. `src/api/promotions.js`
**Responsabilitat**: Configuració de promocions
- `getPromotionsConfig()`
- `updatePromotionsConfig(config)`
- `togglePromotionsBanner(enabled)`

### 4. `src/api/mockups.js`
**Responsabilitat**: Gestió de mockups
- `mockupsAPI.getAll(filters)`
- `mockupsAPI.getById(id)`
- `mockupsAPI.getByVariant(variantId)`
- `mockupsAPI.getByCollection(collection)`
- `mockupsAPI.create(mockupData)`
- `mockupsAPI.update(id, updates)`
- `mockupsAPI.delete(id)`

### 5. `src/api/gelato-sync.js`
**Responsabilitat**: Sincronització amb Gelato
- `syncGelatoProductsToSupabase()`
- `syncMockProductsToSupabase()`

## Flux de Dades

### Mode Mock Data (VITE_USE_MOCK_DATA=true)
```
src/data/mockProducts.jsx
    ↓
src/contexts/ProductContext.jsx
    ↓
Components
```

### Mode Supabase (VITE_USE_MOCK_DATA=false)
```
Supabase Database
    ↓
src/api/supabase-products.js (productsService)
    ↓
src/config/dataSource.js
    ↓
src/contexts/ProductContext.jsx
    ↓
Components
```

## Seguretat (RLS - Row Level Security)

Totes les taules tenen RLS activat amb polítiques:

### Lectura pública
- Qualsevol pot veure productes actius (`is_active = true`)
- Qualsevol pot veure imatges i variants de productes actius

### Escriptura autenticada
- Només usuaris autenticats poden crear/actualitzar/eliminar productes
- Només usuaris autenticats poden gestionar imatges i variants

### Storage
- Lectura pública del bucket `media`
- Escriptura només per usuaris autenticats

## Llocs on s'utilitza Supabase

### Components que consulten directament
- `src/components/HeroSection.jsx` - Hero config
- `src/components/DockSection.jsx` - Collections config
- `src/components/ECEditor.jsx` - Media pages config
- `src/components/GradientEditor.jsx` - Gradient presets
- `src/components/UnderConstructionEditor.jsx` - UC config

### Pàgines que consulten directament
- `src/pages/Home.jsx` - Hero config
- `src/pages/ProductPage.jsx` - Products
- `src/pages/ProductsOverviewPage.jsx` - Products admin
- `src/pages/FulfillmentPage.jsx` - Products + Gelato
- `src/pages/GelatoProductsManagerPage.jsx` - Gelato sync
- `src/pages/HeroSettingsPage.jsx` - Hero settings
- `src/pages/ColleccioSettingsPage.jsx` - Collections settings

### Hooks que consulten directament
- `src/hooks/useGlobalRedirect.js` - Media pages redirect
- `src/hooks/useOffersConfig.js` - Promotions config

### Context que gestiona l'estat global
- `src/contexts/ProductContext.jsx` - Estat global de productes

## Migrations

Ubicació: `supabase/migrations/*.sql`

Totes les migracions segueixen el format:
- `YYYYMMDDHHMMSS_description.sql`
- Comentaris detallats al principi
- Gestió segura amb `IF EXISTS` / `IF NOT EXISTS`
- RLS activat per totes les taules noves

## Edge Functions

Ubicació: `supabase/functions/`

Funcions disponibles:
1. **gelato-proxy** - Proxy per les peticions a Gelato API
2. **download-project** - Descarrega del projecte

## Bones Pràctiques

✅ **Fer**:
- Sempre importar el client des de `src/api/supabase-products.js`
- Utilitzar `maybeSingle()` quan s'espera 0 o 1 resultat
- Gestionar errors amb try/catch
- Utilitzar transformadors per convertir snake_case a camelCase
- Activar RLS en totes les taules noves

❌ **No fer**:
- Crear múltiples instàncies del client de Supabase
- Utilitzar `single()` quan pot no haver-hi resultats
- Exposar credencials en el client
- Crear polítiques RLS amb `USING (true)` (massa permissiu)
- Modificar directament la base de dades sense migration

## Resum

El projecte està 100% integrat amb Supabase:
- ✅ Client únic i centralitzat
- ✅ Mòduls API especialitzats
- ✅ Seguretat amb RLS
- ✅ Storage per fitxers
- ✅ Migrations documentades
- ✅ Edge Functions per lògica del servidor
- ✅ No hi ha dependències de WordPress/WooCommerce
