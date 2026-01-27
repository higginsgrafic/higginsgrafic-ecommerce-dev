import { useState, useEffect, useMemo } from 'react';
import { useProductContext } from '@/contexts/ProductContext';
import { generateVariantsForProduct } from '@/data/productVariants';

/**
 * Hook personalitzat per gestionar productes
 * Proporciona funcions per obtenir, cercar i filtrar productes
 */
export const useProducts = () => {
  const {
    products,
    loading,
    error,
    getProductById,
    getProductsByCollection,
    searchProducts,
    getFilteredProducts
  } = useProductContext();

  return {
    products,
    loading,
    error,
    getProductById,
    getProductsByCollection,
    searchProducts,
    getFilteredProducts
  };
};

/**
 * Hook per obtenir un producte específic amb les seves variants
 */
export const useProduct = (productId) => {
  const { getProductById } = useProductContext();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Obtenir producte
    const foundProduct = getProductById(productId);
    setProduct(foundProduct);

    // Generar variants (en futur vindran de l'API)
    if (foundProduct) {
      const productVariants = generateVariantsForProduct(foundProduct.id, foundProduct.price);
      setVariants(productVariants);
    }

    setLoading(false);
  }, [productId, getProductById]);

  return {
    product,
    variants,
    loading
  };
};

/**
 * Hook per cercar productes amb debounce
 */
export const useProductSearch = (initialQuery = '', debounceDelay = 300) => {
  const { searchProducts } = useProductContext();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);

  // Debounce de la cerca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [query, debounceDelay]);

  // Executar cerca quan canvia el query debounced
  useEffect(() => {
    if (debouncedQuery) {
      const searchResults = searchProducts(debouncedQuery);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, searchProducts]);

  return {
    query,
    setQuery,
    results,
    isSearching: query !== debouncedQuery
  };
};

/**
 * Hook per filtrar productes amb múltiples criteris
 */
export const useProductFilters = (initialFilters = {}) => {
  const { filters, setFilters, getFilteredProducts } = useProductContext();
  const [sortBy, setSortBy] = useState('relevance');

  const filteredProducts = useMemo(() => {
    let products = getFilteredProducts();

    // Aplicar ordenació
    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Rellevància (ordre original)
        break;
    }

    return products;
  }, [getFilteredProducts, sortBy]);

  const updateFilter = (filterKey, value) => {
    setFilters({
      ...filters,
      [filterKey]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      collection: [],
      priceRange: [0, 100],
      search: ''
    });
    setSortBy('relevance');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.collection.length > 0) count++;
    if (filters.search) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 100) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredProducts,
    sortBy,
    setSortBy,
    updateFilter,
    clearFilters,
    activeFiltersCount
  };
};

/**
 * Hook per gestionar productes relacionats
 */
export const useRelatedProducts = (productId, limit = 4) => {
  const { getProductById, getProductsByCollection } = useProductContext();
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (!productId) return;

    const product = getProductById(productId);
    if (!product) return;

    // Obtenir productes de la mateixa col·lecció
    const collectionProducts = getProductsByCollection(product.collection);

    // Filtrar el producte actual i limitar resultats
    const related = collectionProducts
      .filter(p => p.id !== product.id)
      .slice(0, limit);

    setRelatedProducts(related);
  }, [productId, limit, getProductById, getProductsByCollection]);

  return relatedProducts;
};

export default useProducts;
