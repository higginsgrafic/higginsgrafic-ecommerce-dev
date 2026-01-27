import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase-products';

export default function GelatoBlankProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gelato_blank_products')
        .select('*')
        .order('fetched_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('ca-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function extractBrandFromUid(uid) {
    if (uid.includes('gildan')) return 'Gildan';
    if (uid.includes('bella-canvas')) return 'Bella+Canvas';
    if (uid.includes('next-level')) return 'Next Level';
    return 'Unknown';
  }

  function extractProductInfo(fullData) {
    if (!fullData || !fullData.attributes) return {};

    const attrs = fullData.attributes;
    return {
      category: attrs.GarmentCategory || 'N/A',
      subcategory: attrs.GarmentSubcategory || 'N/A',
      size: attrs.GarmentSize || 'N/A',
      color: attrs.GarmentColor || 'N/A',
      quality: attrs.GarmentQuality || 'N/A',
      cut: attrs.GarmentCut || 'N/A',
      manufacturer: attrs.ApparelManufacturer || 'N/A',
      sku: attrs.ApparelManufacturerSKU || 'N/A'
    };
  }

  function extractDimensions(fullData) {
    if (!fullData || !fullData.dimensions) return {};

    const dims = fullData.dimensions;
    return {
      width: dims.Width ? `${dims.Width.value} ${dims.Width.measureUnit}` : 'N/A',
      height: dims.Height ? `${dims.Height.value} ${dims.Height.measureUnit}` : 'N/A',
      weight: fullData.weight ? `${fullData.weight.value} ${fullData.weight.measureUnit}` : 'N/A',
      fabric: dims['Fabric Composition']?.value || 'N/A',
      gsm: dims.GSM ? `${dims.GSM.value} ${dims.GSM.measureUnit}` : 'N/A',
      colorHex: dims['Color HEX Code']?.value || '#000000'
    };
  }

  function extractPricing(pricingData) {
    if (!pricingData || pricingData.length === 0) return null;
    const firstPrice = pricingData[0];
    if (!firstPrice) return null;
    return {
      price: (typeof firstPrice.price === 'number') ? firstPrice.price.toFixed(2) : 'N/A',
      currency: firstPrice.currency || 'USD',
      country: firstPrice.country || 'US',
      quantity: firstPrice.quantity || 1
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant productes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Productes en Blanc de Gelato
          </h1>
          <p className="text-gray-600">
            Dades de referència dels productes base de Gelato per a comparació
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">No hi ha productes guardats</p>
            <p className="text-sm text-gray-400">
              Executa: <code className="bg-gray-100 px-2 py-1 rounded">npm run fetch-blank "t-shirt"</code>
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {products.map((product) => {
              const info = extractProductInfo(product.full_data);
              const dims = extractDimensions(product.full_data);
              const pricing = extractPricing(product.pricing_data);
              const brand = extractBrandFromUid(product.gelato_product_uid);

              return (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-gray-900">
                            {info.category} - {info.quality}
                          </h2>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {brand}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-mono break-all">
                          {product.gelato_product_uid}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {selectedProduct?.id === product.id ? 'Amagar' : 'Veure detalls'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Categoria</p>
                        <p className="font-medium">{info.subcategory}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Talla</p>
                        <p className="font-medium">{info.size}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Color</p>
                          <p className="font-medium">{info.color}</p>
                        </div>
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-200 mt-4"
                          style={{ backgroundColor: dims.colorHex }}
                          title={dims.colorHex}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tall</p>
                        <p className="font-medium">{info.cut}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pes</p>
                        <p className="font-medium">{dims.weight}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">GSM</p>
                        <p className="font-medium">{dims.gsm}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tela</p>
                        <p className="font-medium text-sm">{dims.fabric}</p>
                      </div>
                      {pricing && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Preu</p>
                            <p className="font-medium">{pricing.price} {pricing.currency}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">País</p>
                            <p className="font-medium">{pricing.country}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Images Section */}
                    {product.stored_images && product.stored_images.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                          Imatges guardades ({product.stored_images.length})
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {product.stored_images.map((img, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={img.stored_url}
                                alt={img.type}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                {img.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Obtingut: {formatDate(product.fetched_at)}
                        {product.stored_images && product.stored_images.length > 0 && (
                          <span className="ml-2 text-green-600">
                            • {product.stored_images.length} imatge{product.stored_images.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {info.manufacturer !== 'N/A' && info.manufacturer !== 'none' && (
                        <div className="text-sm">
                          <span className="text-gray-500">Fabricant:</span>
                          <span className="font-medium ml-2">{info.manufacturer}</span>
                          {info.sku !== 'N/A' && info.sku !== 'none' && (
                            <span className="text-gray-500 ml-2">SKU: {info.sku}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedProduct?.id === product.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Dades completes JSON</h3>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Full Data:</h4>
                          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-96">
                            {JSON.stringify(product.full_data, null, 2)}
                          </pre>
                        </div>

                        {product.pricing_data && product.pricing_data.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing Data:</h4>
                            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs max-h-48">
                              {JSON.stringify(product.pricing_data, null, 2)}
                            </pre>
                          </div>
                        )}

                        {product.notes && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Notes:</h4>
                            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                              {product.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
