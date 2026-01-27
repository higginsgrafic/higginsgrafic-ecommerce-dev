import { useState, useEffect } from 'react';
import { syncGelatoStoreProducts } from '../api/gelato';

export default function GelatoTemplatesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSyncProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Iniciant sincronització de productes...');
      const result = await syncGelatoStoreProducts();
      console.log('Productes sincronitzats:', result);
      setProducts(result);
    } catch (err) {
      console.error('Error sincronitzant productes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Productes de Gelato
          </h1>
          <p className="text-gray-600">
            Gestiona els productes connectats a la teva botiga
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Sincronitzar Productes
              </h2>
              <p className="text-sm text-gray-600">
                Obté els productes de la teva botiga de Gelato
              </p>
            </div>
            <button
              onClick={handleSyncProducts}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sincronitzant...' : 'Sincronitzar'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Productes Trobats ({products.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {products.map((product, index) => (
                <div
                  key={product.id || index}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        {product.title || product.name || `Producte ${index + 1}`}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          ID: {product.id}
                        </span>
                        {product.templateId && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Template: {product.templateId}
                          </span>
                        )}
                        {product.variants && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                            {product.variants.length} variants
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg
                        className={`w-5 h-5 transition-transform ${selectedProduct?.id === product.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {selectedProduct?.id === product.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Detalls del Producte
                      </h4>
                      <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
                        {JSON.stringify(product, null, 2)}
                      </pre>

                      {product.variants && product.variants.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Variants ({product.variants.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {product.variants.map((variant, vIndex) => (
                              <div
                                key={variant.id || vIndex}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <p className="text-xs font-medium text-gray-900 mb-1">
                                  {variant.title || variant.name || `Variant ${vIndex + 1}`}
                                </p>
                                <p className="text-xs text-gray-600">
                                  SKU: {variant.sku || 'N/A'}
                                </p>
                                {variant.previewUrl && (
                                  <img
                                    src={variant.previewUrl}
                                    alt={variant.title || `Variant ${vIndex + 1}`}
                                    className="mt-2 w-full h-32 object-cover rounded"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cap producte sincronitzat
              </h3>
              <p className="text-gray-600 mb-4">
                Clica el botó "Sincronitzar" per obtenir els productes de la teva botiga de Gelato
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
