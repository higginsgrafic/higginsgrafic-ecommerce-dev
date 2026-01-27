# Sistema d'Administració

Aquest projecte inclou un sistema d'administració inline que permet editar contingut directament sobre els components reals sense duplicar codi.

## ✅ Norma (WIP per defecte)

**A partir d'avui, TOTS els nous projectes (icones, components, pàgines, etc.) s'allotjaran automàticament a la pàgina WIP.**

**Res sortirà de fase WIP (i per tant de la pàgina WIP) fins que s'indiqui expressament.**

## 🎯 Concepte

- **Mode visualització**: Clients veuen el web normal
- **Mode admin**: Admins veuen icones d'edició sobre els components
- **Edició contextual**: Cliques l'icona i vas a l'editor específic
- **Zero duplicació**: El mateix component serveix per veure i editar

## 🔑 Accés

### Login
1. Ves a `/admin-login`
2. Introdueix la clau: `admin123`
3. Quedaràs loguejat (localStorage)

### Logout
- Clica "Sortir" al banner vermell superior

## 🏗️ Arquitectura

### 1. **AdminContext** (`src/contexts/AdminContext.jsx`)

Context global que gestiona l'estat d'admin:

```jsx
import { useAdmin } from '@/contexts/AdminContext';

const { isAdmin, editMode, toggleEditMode } = useAdmin();
```

**Funcions:**
- `isAdmin` - Boolean si l'usuari és admin
- `editMode` - Boolean si el mode edició està actiu
- `enableAdmin(key)` - Activa mode admin amb clau
- `disableAdmin()` - Desactiva mode admin
- `toggleEditMode()` - Alterna mode edició

### 2. **EditWrapper** (`src/components/EditWrapper.jsx`)

Component wrapper que afegeix la icona d'edició:

```jsx
<EditWrapper editPath="/hero-settings" section="Hero">
  <HeroSection />
</EditWrapper>
```

**Props:**
- `editPath` - Ruta de l'editor (ex: `/hero-settings`)
- `section` - Nom de la secció (per tooltip)
- `className` - Classes CSS opcionals

**Comportament:**
- Si **no** ets admin → mostra només el children
- Si **ets** admin → afegeix icona d'edició en hover

### 3. **AdminBanner** (`src/components/AdminBanner.jsx`)

Banner vermell superior amb:
- Logo i navegació
- Link a `/admin`
- Botó Login/Logout segons estat

## 📝 Ús Pràctic

### Exemple: Fer el ProductGrid editable

```jsx
// src/components/ProductGrid.jsx
import EditWrapper from '@/components/EditWrapper';

export default function ProductGrid({ products }) {
  return (
    <EditWrapper editPath="/admin/products" section="Productes">
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </EditWrapper>
  );
}
```

### Exemple: Editor dedicat

```jsx
// src/pages/ProductsEditorPage.jsx
import { supabase } from '@/api/supabase-products';

export default function ProductsEditorPage() {
  const [products, setProducts] = useState([]);

  // Carregar productes
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*');
    setProducts(data);
  };

  const updateProduct = async (id, changes) => {
    await supabase
      .from('products')
      .update(changes)
      .eq('id', id);
    loadProducts();
  };

  return (
    <div>
      <h1>Editor de Productes</h1>
      {products.map(p => (
        <ProductEditor
          key={p.id}
          product={p}
          onUpdate={updateProduct}
        />
      ))}
    </div>
  );
}
```

## 🎨 Components Editables Actuals

### ✅ Hero Section
- **Wrapper**: `HeroSection.jsx`
- **Editor**: `/hero-settings`
- **Funcions**: Afegir/eliminar slides, editar text/bg

### 🔜 Per Implementar

Pots aplicar el mateix patró a:
- **ProductGrid** → Editor de productes
- **Footer** → Editor de links/textos
- **OffersHeader** → Editor de promocions (ja existeix)
- **Header** → Editor de menú
- **AboutPage** → Editor de contingut

## 🔐 Seguretat

### Clau d'admin
La clau actual és `admin123`. Per canviar-la:

```jsx
// src/contexts/AdminContext.jsx
const enableAdmin = (key) => {
  if (key === 'LA_TEVA_CLAU_NOVA') {
    localStorage.setItem('adminKey', key);
    setIsAdmin(true);
    return true;
  }
  return false;
};
```

### Producció
Per producció, hauries de:
1. Usar autenticació real (Supabase Auth)
2. Verificar permisos al backend
3. Protegir rutes d'admin
4. No exposar la clau al codi

## 📦 Flux Complet

```
┌─────────────┐
│   Client    │
│  (No admin) │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Veu component  │ ← Sense icona d'edició
│   normal        │
└─────────────────┘

┌─────────────┐
│    Admin    │
│ (Loguejat)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Veu component amb  │
│  icona d'edició     │ ← Hover mostra Edit3 icon
└──────┬──────────────┘
       │ Click icona
       ▼
┌─────────────────────┐
│  Pàgina d'editor    │
│  dedicat            │ ← Exemple: /hero-settings
└──────┬──────────────┘
       │ Edita i guarda
       ▼
┌─────────────────────┐
│  Supabase Database  │
└─────────────────────┘
```

## 🚀 Avantatges

1. **Zero duplicació** - No cal `ComponentView` + `ComponentEdit`
2. **Contextual** - Edites exactament el que veus
3. **Escalable** - Afegeix EditWrapper a qualsevol component
4. **Performance** - Només carrega editor quan cal
5. **UX fluid** - Transicions suaus, edició inline

## 🛠️ Millores Futures

- [ ] Sistema de permisos granular (admin, editor, viewer)
- [ ] Històric de canvis / Versions
- [ ] Preview abans de publicar
- [ ] Sincronització en temps real
- [ ] Undo/Redo global
- [ ] Drag & drop per reordenar
