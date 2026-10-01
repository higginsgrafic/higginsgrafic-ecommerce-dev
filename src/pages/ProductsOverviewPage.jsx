import { useEffect, useState } from 'react';
import { productsService } from '../api/supabase-products';
import { Package, Image, Database, RefreshCw } from 'lucide-react';

const COLLECTIONS = {
  'first-contact': { name: 'First Contact', expected: 12 },
  'the-human-inside': { name: 'The Human Inside', expected: 12 },
  'miscellania': { name: 'Miscel·lània', expected: 12 },
  'austen': { name: 'Austen', expected: 14 },
  'cube': { name: 'Cube', expected: 10 }
};

export default function ProductsOverviewPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsService.getAllProductsIncludingInactive();
      setProducts(data);

      const collectionStats = {};
      data.forEach(product => {
        const collection = product.collection || 'sense-col·lecció';
        if (!collectionStats[collection]) {
          collectionStats[collection] = { count: 0, active: 0, inactive: 0 };
        }
        collectionStats[collection].count++;
        if (product.isActive) {
          collectionStats[collection].active++;
        } else {
          collectionStats[collection].inactive++;
        }
      });

      setStats(collectionStats);
    } catch (error) {
      console.error('Error carregant productes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCollection = (collectionId) => {
    return products.filter(p => p.collection === collectionId);
  };

  const totalExpected = Object.values(COLLECTIONS).reduce((sum, col) => sum + col.expected, 0);
  const totalActual = products.length;
  const totalActive = products.filter(p => p.isActive).length;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-paper-soft via-paper to-paper-soft">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 px-6 py-6 border-b border-line bg-paper/80 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-ink-strong mb-2">
              Productes Mock - Supabase
            </h1>
            <p className="text-ink-2">
              Visualització de tots els productes amb imatges SVG locals
            </p>
          </div>
          <button
            onClick={loadProducts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-paper rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Recarregar
          </button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-paper rounded-lg shadow-sm border border-line p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-ink-2">Total Productes</p>
                <p className="text-2xl font-bold text-ink-strong">
                  {totalActual} <span className="text-sm text-ink-soft">/ {totalExpected}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-paper rounded-lg shadow-sm border border-line p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-ink-2">Productes Actius</p>
                <p className="text-2xl font-bold text-green-600">{totalActive}</p>
              </div>
            </div>
          </div>

          <div className="bg-paper rounded-lg shadow-sm border border-line p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-ink-2">Productes Inactius</p>
                <p className="text-2xl font-bold text-orange-600">{totalActual - totalActive}</p>
              </div>
            </div>
          </div>

          <div className="bg-paper rounded-lg shadow-sm border border-line p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-paper-soft rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-ink-2" />
              </div>
              <div>
                <p className="text-sm text-ink-2">Col·leccions</p>
                <p className="text-2xl font-bold text-ink-strong">{Object.keys(stats).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning if data mismatch */}
        {totalActual < totalExpected && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-paper text-sm font-bold">!</span>
              </div>
              <div>
                <p className="font-semibold text-amber-900 mb-1">Falten productes mock</p>
                <p className="text-sm text-amber-800">
                  S&apos;esperaven {totalExpected} productes però només n&apos;hi ha {totalActual} a la base de dades.
                  Potser cal executar un script d&apos;importació de productes mock.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Collections - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-ink-2">Carregant productes...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(COLLECTIONS).map(([collectionId, collectionInfo]) => {
                const collectionProducts = getProductsByCollection(collectionId);
                const collectionStat = stats[collectionId] || { count: 0, active: 0, inactive: 0 };

                return (
                  <div key={collectionId} className="bg-paper rounded-xl shadow-sm border border-line overflow-hidden">
                    {/* Collection Header */}
                    <div className="bg-gradient-to-r from-ink to-ink-2 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-paper mb-1">
                            {collectionInfo.name}
                          </h2>
                          <p className="text-muted-foreground text-sm">
                            {collectionStat.count} de {collectionInfo.expected} productes
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-green-300 text-sm">✓ {collectionStat.active} actius</p>
                            {collectionStat.inactive > 0 && (
                              <p className="text-orange-300 text-sm">✗ {collectionStat.inactive} inactius</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products Grid */}
                    {collectionProducts.length > 0 ? (
                      <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {collectionProducts.map(product => (
                            <div
                              key={product.id}
                              className={`group relative rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
                                product.isActive
                                  ? 'border-line hover:border-blue-400'
                                  : 'border-line opacity-60'
                              }`}
                            >
                              {/* Product Image */}
                              <div className="aspect-square bg-paper-soft relative">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-contain p-2"
                                />
                                {!product.isActive && (
                                  <div className="absolute inset-0 bg-ink-pure bg-opacity-30 flex items-center justify-center">
                                    <span className="bg-red-500 text-paper text-xs px-2 py-1 rounded">
                                      INACTIU
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="p-2 bg-paper">
                                <p className="text-xs font-mono text-ink-soft mb-0.5">
                                  {product.sku}
                                </p>
                                <p className="text-sm font-medium text-ink-strong truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-ink-2">
                                  {product.price} {product.currency}
                                </p>
                              </div>

                              {/* Hover Info */}
                              <div className="absolute inset-0 bg-gradient-to-t from-ink-pure/80 via-ink-pure/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                <p className="text-paper text-xs font-medium mb-1">{product.name}</p>
                                <p className="text-paper/80 text-xs line-clamp-2">{product.description}</p>
                                {product.variants && product.variants.length > 0 && (
                                  <p className="text-paper/60 text-xs mt-1">
                                    {product.variants.length} variants
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-ink-soft">No hi ha productes en aquesta col·lecció</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
