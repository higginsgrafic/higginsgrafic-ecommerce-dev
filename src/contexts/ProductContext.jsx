import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockProducts, mockProductsBlava, mockProductsNegra, mockProductsGreen, mockProductsCube } from '@/data/mockProducts.jsx';
import productsService from '@/api/supabase-products';
import { syncGelatoProductsToSupabase, syncMockProductsToSupabase } from '@/api/gelato-sync';
import { syncGelatoStoreProducts } from '@/api/gelato';

const ProductContext = createContext();

const USE_SUPABASE = import.meta.env.VITE_USE_MOCK_DATA === 'false';

console.log('🔧 ProductContext Config:', {
  VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
  USE_SUPABASE,
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL
});

console.log('⚠️ IMPORTANT: If USE_SUPABASE is false, you need to reload the browser tab completely!');
console.log('⚠️ Current value: USE_SUPABASE =', USE_SUPABASE);

const allMockProducts = [
  ...mockProducts,
  ...mockProductsBlava,
  ...mockProductsNegra,
  ...mockProductsGreen,
  ...mockProductsCube
];

const normalizeColorKey = (value) => {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase();
};

const isBlackOrWhite = (value) => {
  const key = normalizeColorKey(value);
  return (
    key === 'blanc' ||
    key === 'white' ||
    key === 'blanco' ||
    key === 'negre' ||
    key === 'black' ||
    key === 'negro'
  );
};

const isOutcastedAllowedColor = (value) => {
  // Outcasted should show all available colors/variants.
  // Any previous restrictions here caused only a subset (e.g. Militar) to be visible.
  return true;
};

const inferOutcastedColorFromImageUrl = (url) => {
  const key = normalizeColorKey(url);
  if (!key) return null;

  // Outcasted mockup filenames may include multiple color tokens (e.g. ink + garment):
  // outcasted-xxx-black-green.png
  // In that case, we want the *last* color token as the best guess for the garment color.
  const tokens = [
    'militar', 'military', 'army', 'olive', 'khaki',
    'negre', 'black', 'negro',
    'blanc', 'white', 'blanco',
    'vermell', 'red', 'rojo',
    'blau', 'blue', 'azul', 'navy',
    'verd', 'green'
  ];

  let lastHit = null;
  let lastIndex = -1;
  for (const t of tokens) {
    const idx = key.lastIndexOf(t);
    if (idx > lastIndex) {
      lastIndex = idx;
      lastHit = t;
    }
  }

  if (!lastHit) return null;

  if (['militar', 'military', 'army', 'olive', 'khaki', 'verd', 'green'].includes(lastHit)) return 'militar';
  if (['negre', 'black', 'negro'].includes(lastHit)) return 'black';
  if (['blanc', 'white', 'blanco'].includes(lastHit)) return 'white';
  if (['vermell', 'red', 'rojo'].includes(lastHit)) return 'red';
  if (['blau', 'blue', 'azul', 'navy'].includes(lastHit)) return 'blue';

  return null;
};

const sanitizeOutcastedProducts = (items) => {
  const safe = Array.isArray(items) ? items : [];

  const out = safe.map((p) => {
    if (!p || (p.collection || '').toString().toLowerCase() !== 'outcasted') return p;

    const variants = Array.isArray(p.variants) ? p.variants : [];
    const filteredVariants = variants.filter((v) => isOutcastedAllowedColor(v?.color));

    const pickImageFromList = (list) => {
      const urls = (Array.isArray(list) ? list : []).filter((u) => typeof u === 'string' && u.length > 0);
      if (urls.length === 0) return null;
      const byColor = (wanted) => urls.find((u) => inferOutcastedColorFromImageUrl(u) === wanted);
      return byColor('black') || byColor('white') || byColor('militar') || urls[0] || null;
    };

    // Prefer variant image for Black, then White. This prevents random-color mockupUrl from becoming the main card image.
    const pickVariantImage = () => {
      const getColor = (v) => normalizeColorKey(v?.color);
      const withImage = filteredVariants.filter((v) => typeof v?.image === 'string' && v.image.length > 0);
      const black = withImage.find((v) => ['negre', 'black', 'negro'].includes(getColor(v)));
      if (black?.image) return black.image;
      const white = withImage.find((v) => ['blanc', 'white', 'blanco'].includes(getColor(v)));
      if (white?.image) return white.image;
      const militar = withImage.find((v) => ['militar', 'military', 'army', 'olive', 'khaki'].includes(getColor(v)));
      if (militar?.image) return militar.image;
      return null;
    };

    const preferredVariantImage = pickVariantImage();

    // If product has no variants (common for Gelato store products in this app), do NOT guess/override images.
    // We'll only fallback if the image is missing.
    const fallbackImage =
      '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png';
    const hasAnyImage =
      (typeof p?.image === 'string' && p.image.length > 0) ||
      (Array.isArray(p?.images) && p.images.length > 0);

    const inferredColor = inferOutcastedColorFromImageUrl(p?.image || p?.images?.[0] || '');

    const preferredListImage = pickImageFromList(p?.images);
    const nextImage = preferredVariantImage || preferredListImage || (hasAnyImage ? p.image : fallbackImage);
    const nextImages = (() => {
      const baseImages = (Array.isArray(p?.images) ? p.images : []).filter(Boolean);

      // If we have a preferred image (usually from variants), use it as the main one,
      // but preserve the full image gallery when available (important for Outcasted).
      if (preferredVariantImage) {
        const deduped = [preferredVariantImage, ...baseImages.filter((u) => u !== preferredVariantImage)];
        return deduped.length > 0 ? deduped : [preferredVariantImage];
      }
      if (!hasAnyImage) return [fallbackImage];
      // Preserve all images if present; otherwise keep the chosen one.
      return (Array.isArray(p?.images) && p.images.length > 0) ? p.images : [nextImage].filter(Boolean);
    })();

    const finalColor =
      inferOutcastedColorFromImageUrl(nextImage || nextImages?.[0] || '') ||
      inferredColor ||
      null;

    const nextVariants = variants;

    return {
      ...p,
      variants: nextVariants,
      image: nextImage,
      images: nextImages,
      outcastedColor: finalColor
    };
  });

  // Do not drop products here. If Gelato returns products without variants, we still want them visible.
  return out;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const slugify = (value) => {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Cistell (persistit a localStorage)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Favorits/Wishlist (persistit a localStorage)
  const [wishlistItems, setWishlistItems] = useState(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // Filtres actius
  const [filters, setFilters] = useState({
    collection: [],
    priceRange: [0, 100],
    search: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  function inferCollectionFromTitle(title) {
    const productTitleLower = (title || '').toLowerCase();
    const collectionMap = {
      'austen': 'austen',
      'first-contact': 'first-contact',
      'first contact': 'first-contact',
      'the-human-inside': 'the-human-inside',
      'human inside': 'the-human-inside',
      'cube': 'cube',
      'outcasted': 'outcasted'
    };

    for (const [key, value] of Object.entries(collectionMap)) {
      if (productTitleLower.includes(key)) {
        return value;
      }
    }

    return 'first-contact';
  }

  function mapStoreProductToInternal(storeProduct, index = 0) {
    const id = storeProduct?.id?.toString() || `store-${index}`;
    const rawName = storeProduct?.title || storeProduct?.name || `Producte ${index + 1}`;
    const name = (rawName || '').toString().includes('_')
      ? (rawName || '').toString().replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
      : rawName;

    const normalizeComparable = (value) => {
      return (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ');
    };

    const rawDescription = (storeProduct?.description || '').toString().trim();
    const hasMeaningfulDescription =
      !!rawDescription && normalizeComparable(rawDescription) !== normalizeComparable(name);
    const description = hasMeaningfulDescription ? rawDescription : '';
    const mockupUrl = storeProduct?.mockupUrl || storeProduct?.previewUrl || storeProduct?.imageUrl;
    const candidateImages = [
      ...(Array.isArray(storeProduct?.images) ? storeProduct.images : []),
      ...(Array.isArray(storeProduct?.imageUrls) ? storeProduct.imageUrls : []),
      ...(Array.isArray(storeProduct?.mockupUrls) ? storeProduct.mockupUrls : []),
      ...(Array.isArray(storeProduct?.previewUrls) ? storeProduct.previewUrls : []),
      ...(mockupUrl ? [mockupUrl] : [])
    ]
      .filter((u) => typeof u === 'string' && u.length > 0);

    const images = Array.from(new Set(candidateImages));
    const finalImages = images.length > 0 ? images : ['/placeholder-product.svg'];

    const extractVariantOptionValue = (variant, names = []) => {
      const normalizedNames = (Array.isArray(names) ? names : []).map((n) => normalizeComparable(n));

      const candidates = [
        ...(Array.isArray(variant?.options) ? variant.options : []),
        ...(Array.isArray(variant?.attributes) ? variant.attributes : []),
        ...(Array.isArray(variant?.variantOptions) ? variant.variantOptions : [])
      ];

      for (const entry of candidates) {
        if (!entry) continue;
        const key = normalizeComparable(entry?.name || entry?.key || entry?.label || entry?.type);
        if (key && normalizedNames.some((n) => key.includes(n))) {
          const value = entry?.value ?? entry?.option ?? entry?.selection ?? entry?.title;
          if (value != null && `${value}`.trim()) return `${value}`.trim();
        }
      }

      const title = (variant?.title || '').toString();
      for (const n of normalizedNames) {
        const re = new RegExp(`\\b${n}\\b\\s*[:\\-]?\\s*([^,]+)`, 'i');
        const m = title.match(re);
        if (m && (m[1] || '').trim()) return (m[1] || '').trim();
      }

      return null;
    };

    const extractVariantSize = (variant) => {
      const direct = variant?.size ?? variant?.Size ?? variant?.sizeName;
      if (direct != null && `${direct}`.trim()) return `${direct}`.trim().toUpperCase();
      const opt = extractVariantOptionValue(variant, ['talla', 'size', 'taille']);
      if (opt != null && `${opt}`.trim()) return `${opt}`.trim().toUpperCase();

      const title = (variant?.title || '').toString().toUpperCase();
      const sizeToken = title.match(/\b(XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|XXXL)\b/);
      if (sizeToken && (sizeToken[1] || '').trim()) return (sizeToken[1] || '').trim();

      return 'UNI';
    };

    const extractVariantColor = (variant) => {
      const direct = variant?.color ?? variant?.Colour ?? variant?.Color ?? variant?.colorName;
      if (direct != null && `${direct}`.trim()) return `${direct}`.trim();
      const opt = extractVariantOptionValue(variant, ['color', 'colour', 'couleur']);
      if (opt != null && `${opt}`.trim()) return `${opt}`.trim();

      const title = (variant?.title || '').toString();
      const knownColors = [
        { re: /\b(militar|military|army|olive|khaki)\b/i, value: 'Militar' },
        { re: /\b(forest)\b/i, value: 'Forest' },
        { re: /\b(royal)\b/i, value: 'Royal' },
        { re: /\b(navy|marina)\b/i, value: 'Navy' },
        { re: /\b(vermell|red|rojo)\b/i, value: 'Vermell' },
        { re: /\b(blau|blue|azul)\b/i, value: 'Blau' },
        { re: /\b(verd|green)\b/i, value: 'Verd' },
        { re: /\b(negre|black|negro)\b/i, value: 'Negre' },
        { re: /\b(blanc|white|blanco)\b/i, value: 'Blanc' }
      ];
      for (const c of knownColors) {
        if (c.re.test(title)) return c.value;
      }

      return 'Default';
    };

    const variants = (storeProduct?.variants || []).map(v => {
      const color = extractVariantColor(v);
      const size = extractVariantSize(v);

      if (import.meta.env.DEV && size === 'UNI') {
        console.warn('⚠️ [STORE VARIANT] Could not infer size (defaulting to UNI):', {
          productId: id,
          productName: name,
          variantId: v?.id || v?.variantId,
          variantTitle: v?.title,
          variantSize: v?.size,
          variantColor: v?.color,
          options: v?.options,
          attributes: v?.attributes,
          variantOptions: v?.variantOptions
        });
      }

      return {
        id: v?.id?.toString() || v?.variantId?.toString() || `${id}-${size}-${color}`,
        sku: v?.sku || '',
        size,
        color,
        colorHex: '#FFFFFF',
        price: v?.price || storeProduct?.price || 29.99,
        stock: 999,
        isAvailable: true,
        image: v?.mockupUrl || mockupUrl || null,
        gelatoVariantId: v?.id?.toString() || v?.variantId?.toString() || null,
        design: null
      };
    });

    return {
      id,
      slug: storeProduct?.slug,
      name,
      description,
      price: storeProduct?.price || 29.99,
      currency: storeProduct?.currency || 'EUR',
      image: finalImages[0],
      images: finalImages,
      category: 'apparel',
      collection: inferCollectionFromTitle(name),
      sku: storeProduct?.sku || id,
      gelatoProductId: id,
      variants,
      isActive: true
    };
  }

  async function loadProducts() {
    console.log('📦 loadProducts called');
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 USE_SUPABASE:', USE_SUPABASE);
      if (USE_SUPABASE) {
        console.log('🌐 Fetching from Supabase...');
        const supabaseProducts = await productsService.getAllProductsIncludingInactive();
        console.log('📊 Supabase products received:', supabaseProducts?.length);

        let storeProducts = [];
        try {
          const storeResponse = await syncGelatoStoreProducts();
          storeProducts = Array.isArray(storeResponse)
            ? storeResponse
            : (storeResponse?.data || storeResponse?.products || []);
        } catch (gelatoErr) {
          console.warn('⚠️ Error carregant productes de Gelato store:', gelatoErr);
          storeProducts = [];
        }

        const supabaseByGelatoId = new Map(
          (supabaseProducts || [])
            .filter(p => p?.gelatoProductId)
            .map(p => [p.gelatoProductId?.toString(), p])
        );

        const supabaseBySlug = new Map(
          (supabaseProducts || [])
            .filter(p => p?.slug)
            .map(p => [p.slug?.toString(), p])
        );

        const mappedStoreProducts = (storeProducts || []).map((p, idx) => mapStoreProductToInternal(p, idx));
        const mergedStoreProducts = mappedStoreProducts.map(p => {
          const gelatoIdKey = p.gelatoProductId?.toString();
          const computedSlug = `${slugify(p.collection)}-${slugify(p.name)}`;

          const supabaseMatch =
            (gelatoIdKey ? supabaseByGelatoId.get(gelatoIdKey) : null) ||
            (p.slug ? supabaseBySlug.get(p.slug?.toString()) : null) ||
            supabaseBySlug.get(computedSlug);

          if (!supabaseMatch) {
            return {
              ...p,
              slug: p.slug || computedSlug
            };
          }

          return {
            ...p,
            supabaseId: supabaseMatch.id,
            slug: supabaseMatch.slug || p.slug || computedSlug,
            name: supabaseMatch.name || p.name,
            description: supabaseMatch.description || p.description,
            images: (supabaseMatch.images && supabaseMatch.images.length > 0) ? supabaseMatch.images : p.images,
            image: supabaseMatch.image || p.image,
            variants: (supabaseMatch.variants && supabaseMatch.variants.length > 0) ? supabaseMatch.variants : p.variants,
            collection: supabaseMatch.collection || p.collection,
            isActive: supabaseMatch.isActive !== undefined ? supabaseMatch.isActive : p.isActive
          };
        });

        // Include Supabase-only products (e.g. created via /admin/upload) that don't exist in Gelato store.
        const storeIds = new Set((mappedStoreProducts || []).map(p => p?.gelatoProductId?.toString()).filter(Boolean));
        const supabaseOnlyProducts = (supabaseProducts || []).filter(p => {
          const gid = p?.gelatoProductId?.toString();
          return !gid || !storeIds.has(gid);
        });

        const merged = [...mergedStoreProducts, ...supabaseOnlyProducts];

        if (!merged || merged.length === 0) {
          if (!supabaseProducts || supabaseProducts.length === 0) {
            console.log('⚠️ No hi ha productes (Gelato/Supabase), carregant mock products...');
            setProducts(sanitizeOutcastedProducts(allMockProducts));
          } else {
            console.log('⚠️ No hi ha productes de Gelato, fent fallback a Supabase');
            setProducts(sanitizeOutcastedProducts(supabaseProducts));
          }
        } else {
          setProducts(sanitizeOutcastedProducts(merged));
        }
      } else {
        console.log('📝 Using mock products');
        setProducts(sanitizeOutcastedProducts(allMockProducts));
      }
    } catch (err) {
      console.error('❌ Error carregant productes:', err);
      setError(err);
      setProducts(sanitizeOutcastedProducts(allMockProducts));
    } finally {
      console.log('✅ Loading complete, setting loading=false');
      setLoading(false);
    }
  }

  async function syncGelatoProducts() {
    setLoading(true);
    setError(null);

    try {
      const result = await syncGelatoProductsToSupabase();

      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error || 'Error sincronitzant amb Gelato');
      }
    } catch (err) {
      console.error('Error sincronitzant Gelato:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function syncMockProducts() {
    setLoading(true);
    setError(null);

    try {
      const result = await syncMockProductsToSupabase();

      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error || 'Error sincronitzant productes mock');
      }
    } catch (err) {
      console.error('Error sincronitzant mock products:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__PRODUCTS__ = products || [];
  }, [products]);

  const getProductById = (id) => {
    const numId = parseInt(id);
    return products.find(p => p.id === id || p.id === numId || p.slug === id);
  };

  const normalizeCollectionKey = (value) => {
    return slugify((value || '').toString().replace(/_/g, '-'));
  };

  const getProductsByCollection = (collection, productType = null) => {
    const wanted = normalizeCollectionKey(collection);
    return products.filter(p =>
      normalizeCollectionKey(p.collection) === wanted &&
      (p.isActive !== false) &&
      (!productType || p.product_type === productType || (!p.product_type && productType === 'mockup'))
    );
  };

  const getRandomProductsByCollection = (collection, count = 4, productType = null) => {
    const wanted = normalizeCollectionKey(collection);
    const collectionProducts = products.filter(p =>
      normalizeCollectionKey(p.collection) === wanted &&
      (p.isActive !== false) &&
      (!productType || p.product_type === productType || (!p.product_type && productType === 'mockup'))
    );
    // TEMPORALMENT DESCONNECTAT: No barrejar aleatòriament
    // const shuffled = [...collectionProducts].sort(() => Math.random() - 0.5);
    // return shuffled.slice(0, count);
    return collectionProducts.slice(0, count);
  };

  const getProductsByType = (productType) => {
    return products.filter(p => p.product_type === productType || (!p.product_type && productType === 'mockup'));
  };

  const searchProducts = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Funcions per gestionar cistell
  const addToCart = (product, size, quantity = 1) => {
    const existingItem = cartItems.find(
      item => item.id === product.id && item.size === size
    );

    if (existingItem) {
      setCartItems(
        cartItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, size, quantity }]);
    }
  };

  const updateQuantity = (itemId, size, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId, size);
      return;
    }

    setCartItems(
      cartItems.map(item =>
        item.id === itemId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId, size) => {
    setCartItems(cartItems.filter(item => !(item.id === itemId && item.size === size)));
  };

  const updateSize = (itemId, oldSize, newSize, quantity) => {
    const item = cartItems.find(i => i.id === itemId && i.size === oldSize);
    if (!item) return;

    const newCartItems = cartItems.filter(i => !(i.id === itemId && i.size === oldSize));
    const existingNewSizeItem = newCartItems.find(i => i.id === itemId && i.size === newSize);

    if (existingNewSizeItem) {
      setCartItems(
        newCartItems.map(i =>
          i.id === itemId && i.size === newSize
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      setCartItems([...newCartItems, { ...item, size: newSize, quantity }]);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Funcions per gestionar wishlist/favorits
  const addToWishlist = (product) => {
    const exists = wishlistItems.find(item => item.id === product.id);
    if (!exists) {
      setWishlistItems([...wishlistItems, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.find(item => item.id === product.id);
    if (exists) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Aplicar filtres
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filtre per col·lecció
    if (filters.collection.length > 0) {
      filtered = filtered.filter(p => filters.collection.includes(p.collection));
    }

    // Filtre per preu
    filtered = filtered.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Filtre per cerca
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const value = {
    products,
    loading,
    error,
    loadProducts,
    syncGelatoProducts,
    syncMockProducts,
    getProductById,
    getProductsByCollection,
    getRandomProductsByCollection,
    getProductsByType,
    searchProducts,
    getFilteredProducts,

    // Cistell
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateSize,
    clearCart,
    getTotalItems,
    getTotalPrice,

    // Wishlist/Favorits
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,

    // Filtres
    filters,
    setFilters
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Hook personalitzat per utilitzar el context
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext ha de ser utilitzat dins de ProductProvider');
  }
  return context;
};

export default ProductContext;
