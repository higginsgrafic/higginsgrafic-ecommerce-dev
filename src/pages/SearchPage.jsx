import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useProductContext } from '@/contexts/ProductContext';
import { trackSearch } from '@/utils/analytics';
import Breadcrumbs from '@/components/Breadcrumbs';

const SearchPage = ({ onAddToCart, cartItems, onUpdateQuantity }) => {
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const { products } = useProductContext();

  const [searchQuery] = useState(queryFromUrl);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const collections = [
    { id: 'first-contact', name: 'First Contact' },
    { id: 'the-human-inside', name: 'The Human Inside' },
    { id: 'austen', name: 'Austen' },
    { id: 'cube', name: 'Cube' },
    { id: 'outcasted', name: 'Outcasted' }
  ];

  const toggleCollection = (collectionId) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const clearFilters = () => {
    setSelectedCollections([]);
    setPriceRange([0, 100]);
    setSortBy('relevance');
  };

  // Filtrar i ordenar productes
  const filteredProducts = useMemo(() => {
    let results = [...products];

    // Filtre per text
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Filtre per col·lecció
    if (selectedCollections.length > 0) {
      results = results.filter(p =>
        selectedCollections.includes(p.collection)
      );
    }

    // Filtre per preu
    results = results.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Ordenar
    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Rellevància (ordre original)
        break;
    }

    return results;
  }, [searchQuery, selectedCollections, priceRange, sortBy]);

  const activeFiltersCount = selectedCollections.length;

  // Track search with debounce
  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        trackSearch(searchQuery, filteredProducts.length);
      }, 1000); // Debounce 1 segon

      return () => clearTimeout(timer);
    }
  }, [searchQuery, filteredProducts.length]);

  return (
    <>
      <Helmet>
        <title>Cerca de Productes | GRÀFIC</title>
        <meta name="description" content="Troba la samarreta perfecta amb el nostre cercador avançat" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-[129px] lg:pt-[145px] pb-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6 sm:mb-8">
            <Breadcrumbs items={[
              { label: 'Cerca' }
            ]} />
          </div>

          {/* Capçalera */}
          <div className="mb-8">
            <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase mb-2" style={{ color: '#141414' }}>
              Resultats de cerca
            </h1>
            {searchQuery && (
              <p className="font-roboto text-lg text-gray-600">
                Cercant: <span className="font-medium" style={{ color: '#141414' }}>"{searchQuery}"</span>
              </p>
            )}
            <p className="font-roboto text-sm text-gray-500 mt-2">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'resultat trobat' : 'resultats trobats'}
            </p>
          </div>

          {/* Filtres i Resultats */}
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar de filtres - Desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-oswald text-lg font-bold uppercase" style={{ color: '#141414' }}>
                    Filtres
                  </h2>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Neteja ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* Col·leccions */}
                <div className="mb-6">
                  <h3 className="font-medium text-sm mb-3 uppercase tracking-wider" style={{ color: '#141414', opacity: 0.7 }}>
                    Col·leccions
                  </h3>
                  <div className="space-y-2">
                    {collections.map((collection) => (
                      <label key={collection.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(collection.id)}
                          onChange={() => toggleCollection(collection.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <span className="text-sm">{collection.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preu */}
                <div className="mb-6">
                  <h3 className="font-medium text-sm mb-3 uppercase tracking-wider" style={{ color: '#141414', opacity: 0.7 }}>
                    Preu
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span>{priceRange[0]}€</span>
                      <span>{priceRange[1]}€</span>
                    </div>
                  </div>
                </div>

                {/* Ordenar */}
                <div>
                  <h3 className="font-medium text-sm mb-3 uppercase tracking-wider" style={{ color: '#141414', opacity: 0.7 }}>
                    Ordenar per
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-gray-900 focus:outline-none"
                  >
                    <option value="relevance">Rellevància</option>
                    <option value="price-asc">Preu: menor a major</option>
                    <option value="price-desc">Preu: major a menor</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Filtres mòbils */}
            <div className="lg:hidden mb-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="w-full h-12 border-2"
              >
                <SlidersHorizontal className="mr-2 h-5 w-5" />
                Filtres
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-lg shadow-sm p-6 mt-4"
                >
                  {/* Mateix contingut que sidebar desktop */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-oswald text-lg font-bold uppercase" style={{ color: '#141414' }}>
                      Filtres
                    </h2>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Col·leccions */}
                  <div className="mb-6">
                    <h3 className="font-medium text-sm mb-3 uppercase tracking-wider" style={{ color: '#141414', opacity: 0.7 }}>
                      Col·leccions
                    </h3>
                    <div className="space-y-2">
                      {collections.map((collection) => (
                        <label key={collection.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCollections.includes(collection.id)}
                            onChange={() => toggleCollection(collection.id)}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          />
                          <span className="text-sm">{collection.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Ordenar */}
                  <div>
                    <h3 className="font-medium text-sm mb-3 uppercase tracking-wider" style={{ color: '#141414', opacity: 0.7 }}>
                      Ordenar per
                    </h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="relevance">Rellevància</option>
                      <option value="price-asc">Preu: menor a major</option>
                      <option value="price-desc">Preu: major a menor</option>
                      <option value="name">Nom A-Z</option>
                    </select>
                  </div>

                  <Button
                    onClick={() => setShowFilters(false)}
                    className="w-full mt-6"
                    style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
                  >
                    Mostra {filteredProducts.length} resultats
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Grid de productes */}
            <div className="lg:col-span-3">
              {/* Resum de resultats */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm" style={{ color: '#141414', opacity: 0.7 }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producte trobat' : 'productes trobats'}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors lg:hidden"
                  >
                    Neteja filtres ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Resultats */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-oswald text-xl font-bold mb-2" style={{ color: '#141414' }}>
                    No s'han trobat resultats
                  </h3>
                  <p className="text-sm mb-6" style={{ color: '#141414', opacity: 0.6 }}>
                    Prova a ajustar els filtres o la cerca
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-2"
                  >
                    Neteja filtres
                  </Button>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        cartItems={cartItems}
                        onUpdateQuantity={onUpdateQuantity}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
