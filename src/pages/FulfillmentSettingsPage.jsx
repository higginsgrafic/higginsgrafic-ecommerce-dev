import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Settings,
  Search,
  ChevronRight,
  Package,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Tag,
  Ruler,
  Palette,
  DollarSign,
  Box,
  ArrowLeft,
  Info,
  Database,
  Store
} from 'lucide-react';
import { gelatoClient } from '../api/gelato';
import { supabase } from '../api/supabase-products';

export default function FulfillmentSettingsPage() {
  const [activeTab, setActiveTab] = useState('store');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Tornar a Admin
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Constructor de Plantilles - Gelato
              </h1>
              <p className="text-gray-600">
                Explora les dades de productes per crear plantilles específiques per tipus
              </p>
            </div>
          </div>
        </div>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex gap-2 border-b border-gray-200 mb-8">
            <Tabs.Trigger
              value="store"
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <Store className="w-4 h-4" />
              Productes de la Botiga
            </Tabs.Trigger>
            <Tabs.Trigger
              value="blank"
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-600 hover:text-gray-900"
            >
              <Database className="w-4 h-4" />
              Productes en Blanc (Referència)
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="store">
            <StoreProductsTab />
          </Tabs.Content>

          <Tabs.Content value="blank">
            <BlankProductsTab />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

function StoreProductsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('gildan 5000');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadGelatoProducts();
  }, []);

  const loadGelatoProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!gelatoClient) {
        throw new Error('Gelato API no està configurada');
      }

      const listFn = typeof gelatoClient.listAllStoreProducts === 'function'
        ? gelatoClient.listAllStoreProducts.bind(gelatoClient)
        : gelatoClient.listStoreProducts.bind(gelatoClient);

      const response = await listFn();
      console.log('📦 Productes de la botiga:', response);

      if (Array.isArray(response)) {
        setProducts(response);

        const gildan5000 = response.find(p =>
          p.title?.includes('Gildan® 5000') ||
          p.productUid?.includes('gildan_5000')
        );

        if (gildan5000) {
          console.log('🎯 Gildan 5000 trobat, carregant automàticament...');
          loadProductDetails(gildan5000.id, gildan5000.productUid);
        }
      } else if (response && response.data) {
        setProducts(response.data);

        // Auto-seleccionar Gildan 5000 si existeix
        const gildan5000 = response.data.find(p =>
          p.title?.includes('Gildan® 5000') ||
          p.productUid?.includes('gildan_5000')
        );

        if (gildan5000) {
          console.log('🎯 Gildan 5000 trobat, carregant automàticament...');
          loadProductDetails(gildan5000.id, gildan5000.productUid);
        }
      }
    } catch (err) {
      console.error('Error carregant productes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProductDetails = async (productId, productUid) => {
    try {
      setLoadingDetails(true);
      setSelectedProduct(productId);

      console.log('📦 Carregant detalls del producte:', productUid);

      const details = await gelatoClient.getProduct(productUid);
      console.log('✅ Detalls del producte:', details);

      // Intentar obtenir preus
      try {
        const prices = await gelatoClient.getProductPrices(productUid);
        details.priceDetails = prices;
        console.log('💰 Preus obtinguts:', prices);
      } catch (priceErr) {
        console.warn('⚠️ No s\'han pogut obtenir preus:', priceErr);
      }

      setProductDetails(details);
    } catch (err) {
      console.error('Error carregant detalls:', err);
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id?.toString().includes(searchTerm) ||
    product.productUid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregant productes de Gelato...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Error carregant productes
            </h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadGelatoProducts}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Tornar a intentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Panel esquerre: Llista de productes */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca productes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              Productes trobats ({filteredProducts.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No s'han trobat productes</p>
                <p className="text-sm mt-2">
                  Total productes disponibles: {products.length}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => loadProductDetails(product.id, product.productUid)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedProduct === product.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-mono truncate">
                        ID: {product.id}
                      </p>
                      {product.productUid && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          UID: {product.productUid}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel dret: Detalls del producte */}
      <div className="lg:col-span-2">
        {loadingDetails ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregant detalls del producte...</p>
            </div>
          </div>
        ) : productDetails ? (
          <ProductDetailsPanel product={productDetails} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Selecciona un producte
              </p>
              <p className="text-sm">
                Fes clic a un producte de l'esquerra per veure totes les seves dades
              </p>
              <p className="text-xs mt-4 text-gray-500">
                Cerca "Gildan 5000" per veure el producte de referència
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BlankProductsTab() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadBlankProducts();
  }, []);

  async function loadBlankProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gelato_blank_products')
        .select('*')
        .order('fetched_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);

      if (data && data.length > 0) {
        setSelectedProduct(data[0]);
      }
    } catch (error) {
      console.error('Error loading blank products:', error);
    } finally {
      setLoading(false);
    }
  }

  function extractProductInfo(fullData) {
    if (!fullData) return {};

    return {
      title: fullData.title || 'N/A',
      description: fullData.description || 'N/A',
      status: fullData.status || 'N/A',
      productType: fullData.productType || 'N/A',
      storeId: fullData.storeId || 'N/A',
      hasImages: fullData.productImages?.length || 0,
      variantCount: fullData.variants?.length || 0,
      variantOptions: fullData.productVariantOptions || [],
      variantAttributes: fullData.productVariantAttributes || []
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregant productes en blanc...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-400">
          <Database className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">
            No hi ha productes en blanc guardats
          </p>
          <p className="text-sm">
            Executa: <code className="bg-gray-100 px-2 py-1 rounded">npm run fetch-blank "store-product-id"</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Panel esquerre: Llista de productes */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              Productes en Blanc ({products.length})
            </h2>
            <p className="text-xs text-gray-500 mt-1">Productes de referència de Gelato</p>
          </div>

          <div className="divide-y divide-gray-200 max-h-[calc(100vh-400px)] overflow-y-auto">
            {products.map((product) => {
              const info = extractProductInfo(product.full_data);
              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedProduct?.id === product.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {info.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {info.variantCount} variants
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(product.fetched_at).toLocaleDateString('ca-ES')}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel dret: Detalls del producte */}
      <div className="lg:col-span-2">
        {selectedProduct ? (
          <BlankProductDetailsPanel product={selectedProduct} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Selecciona un producte
              </p>
              <p className="text-sm">
                Fes clic a un producte de l'esquerra per veure les seves dades
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BlankProductDetailsPanel({ product }) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    variants: true,
    images: true,
    sizes: false,
    care: false,
    raw: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fullData = product.full_data || {};
  const variants = fullData.variants || [];
  const productImages = fullData.productImages || [];
  const variantOptions = fullData.productVariantOptions || [];

  // Parse HTML description to extract size guide and care instructions
  const parseDescription = (htmlString) => {
    if (!htmlString) return { sizeGuide: null, careInstructions: null, features: null };

    const sizeGuideMatch = htmlString.match(/<p><strong>Size guide<\/strong><\/p>([\s\S]*?)<p><strong>Care Instructions<\/strong><\/p>/);
    const careMatch = htmlString.match(/<p><strong>Care Instructions<\/strong><\/p>([\s\S]*?)$/);
    const featuresMatch = htmlString.match(/<ul>([\s\S]*?)<\/ul>/);

    return {
      sizeGuide: sizeGuideMatch ? sizeGuideMatch[1] : null,
      careInstructions: careMatch ? careMatch[1] : null,
      features: featuresMatch ? featuresMatch[1] : null
    };
  };

  const parsedDescription = parseDescription(fullData.description);

  return (
    <div className="space-y-6">
      {/* Informació Bàsica */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Informació Bàsica</h3>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.basic ? 'rotate-90' : ''}`} />
        </button>

        {expandedSections.basic && (
          <div className="p-6 pt-0 space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Títol del Producte
              </dt>
              <dd className="text-sm text-gray-900">
                {fullData.title}
              </dd>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Product UID
              </dt>
              <dd className="text-sm text-gray-900 font-mono break-all">
                {product.gelato_product_uid}
              </dd>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Status
              </dt>
              <dd className="text-sm">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  {fullData.status}
                </span>
              </dd>
            </div>

            {parsedDescription.features && (
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Característiques
                </dt>
                <dd className="text-sm text-gray-900">
                  <div dangerouslySetInnerHTML={{ __html: parsedDescription.features }} className="prose prose-sm max-w-none" />
                </dd>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Variants i Opcions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('variants')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <Palette className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-lg">
                Variants ({variants.length})
              </h3>
              <p className="text-xs text-gray-500">Combinacions de talles, colors i opcions</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.variants ? 'rotate-90' : ''}`} />
        </button>

        {expandedSections.variants && (
          <div className="p-6 pt-0 space-y-4">
            {/* Opcions de Variants */}
            {variantOptions.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Opcions Disponibles</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {variantOptions.map((option, idx) => (
                    <div key={idx} className="bg-white rounded p-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">{option.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {option.values.map((value, vIdx) => (
                          <span
                            key={vIdx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Llista de Variants */}
            <div className="text-sm text-gray-600 mb-2">
              Total de combinacions: {variants.length}
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {variants.slice(0, 10).map((variant, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-medium text-gray-900">{variant.title}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {variant.id}</p>
                </div>
              ))}
              {variants.length > 10 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  ... i {variants.length - 10} variants més
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Imatges */}
      {productImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('images')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Imatges ({productImages.length})
                </h3>
                <p className="text-xs text-gray-500">Mockups generats per Gelato</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.images ? 'rotate-90' : ''}`} />
          </button>

          {expandedSections.images && (
            <div className="p-6 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productImages.map((img, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <img
                      src={img.fileUrl}
                      alt={`Product image ${idx + 1}`}
                      className="w-full aspect-square object-contain bg-gray-50 rounded mb-2"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.svg';
                      }}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${img.isPrimary ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                        {img.isPrimary ? 'Principal' : 'Variant'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guia de Talles */}
      {parsedDescription.sizeGuide && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('sizes')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Ruler className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Guia de Talles</h3>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.sizes ? 'rotate-90' : ''}`} />
          </button>

          {expandedSections.sizes && (
            <div className="p-6 pt-0">
              <div dangerouslySetInnerHTML={{ __html: parsedDescription.sizeGuide }} className="prose prose-sm max-w-none overflow-x-auto" />
            </div>
          )}
        </div>
      )}

      {/* Instruccions de Cura */}
      {parsedDescription.careInstructions && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('care')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-50">
                <Info className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Instruccions de Cura</h3>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.care ? 'rotate-90' : ''}`} />
          </button>

          {expandedSections.care && (
            <div className="p-6 pt-0">
              <div dangerouslySetInnerHTML={{ __html: parsedDescription.careInstructions }} className="prose prose-sm max-w-none" />
            </div>
          )}
        </div>
      )}

      {/* JSON Complet */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('raw')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50">
              <Info className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-lg">JSON Complet (RAW)</h3>
              <p className="text-xs text-gray-500">Totes les dades sense processar</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.raw ? 'rotate-90' : ''}`} />
        </button>

        {expandedSections.raw && (
          <div className="p-6 pt-0">
            <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto font-mono max-h-[600px] overflow-y-auto">
              {JSON.stringify(product, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetailsPanel({ product }) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    variants: true,
    images: true,
    prices: false,
    raw: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Extreure dades estructurades
  const basicInfo = {
    'Product UID': product.productUid,
    'Product Name UID': product.productNameUid,
    'Product Type UID': product.productTypeUid,
    'Title': product.title,
    'Category': product.category,
    'Subcategory': product.subcategory,
    'Type': product.type,
    'Description': product.description
  };

  // Extreure variants amb tots els seus atributs
  const variants = product.variants || [];
  const variantsInfo = variants.map((variant, idx) => ({
    index: idx + 1,
    variantUid: variant.variantUid,
    sku: variant.sku,
    attributes: variant.attributes || [],
    price: variant.price,
    available: variant.available,
    placeholders: variant.placeholders || []
  }));

  // Extreure imatges
  const images = [];
  if (product.previewUrl) images.push({ type: 'Preview URL', url: product.previewUrl });
  if (product.imageUrl) images.push({ type: 'Image URL', url: product.imageUrl });
  if (product.thumbnailUrl) images.push({ type: 'Thumbnail URL', url: product.thumbnailUrl });
  if (product.mockups && Array.isArray(product.mockups)) {
    product.mockups.forEach((mockup, idx) => {
      if (mockup.url) images.push({ type: `Mockup ${idx + 1}`, url: mockup.url });
    });
  }

  // Extreure dimensions
  const dimensions = product.dimensions || [];

  return (
    <div className="space-y-6">
      {/* Informació Bàsica */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('basic')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Informació Bàsica</h3>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.basic ? 'rotate-90' : ''}`} />
        </button>

        {expandedSections.basic && (
          <div className="p-6 pt-0 space-y-3">
            {Object.entries(basicInfo).filter(([_, value]) => value).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  {key}
                </dt>
                <dd className="text-sm text-gray-900 font-mono break-words">
                  {value}
                </dd>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants i Atributs */}
      {variantsInfo.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('variants')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Ruler className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Variants ({variantsInfo.length})
                </h3>
                <p className="text-xs text-gray-500">Talles, colors i atributs per variant</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.variants ? 'rotate-90' : ''}`} />
          </button>

          {expandedSections.variants && (
            <div className="p-6 pt-0 space-y-4">
              {variantsInfo.map((variant) => (
                <div key={variant.index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Variant #{variant.index}
                    </h4>
                    {variant.available !== undefined && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        variant.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {variant.available ? 'Disponible' : 'No disponible'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Variant UID</p>
                        <p className="text-sm font-mono text-gray-900">{variant.variantUid}</p>
                      </div>
                      {variant.sku && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">SKU</p>
                          <p className="text-sm font-mono text-gray-900">{variant.sku}</p>
                        </div>
                      )}
                    </div>

                    {variant.price && (
                      <div className="bg-white rounded p-3">
                        <p className="text-xs text-gray-500 mb-1">Preu</p>
                        <p className="text-lg font-bold text-gray-900">
                          {variant.price.amount} {variant.price.currency}
                        </p>
                      </div>
                    )}

                    {variant.attributes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Atributs</p>
                        <div className="space-y-2">
                          {variant.attributes.map((attr, attrIdx) => (
                            <div key={attrIdx} className="bg-white rounded p-3">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-medium text-gray-700">
                                  {attr.name || attr.placeholder}
                                </p>
                                {attr.required && (
                                  <span className="text-xs text-red-600">*Obligatori</span>
                                )}
                              </div>
                              {attr.values && attr.values.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {attr.values.map((val, valIdx) => (
                                    <span
                                      key={valIdx}
                                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                    >
                                      {val}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {variant.placeholders && variant.placeholders.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Placeholders (zones d'impressió)</p>
                        <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                          {JSON.stringify(variant.placeholders, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dimensions */}
      {dimensions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-50">
              <Box className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Dimensions</h3>
          </div>
          <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto font-mono">
            {JSON.stringify(dimensions, null, 2)}
          </pre>
        </div>
      )}

      {/* Imatges */}
      {images.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('images')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Imatges i Mockups ({images.length})
                </h3>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.images ? 'rotate-90' : ''}`} />
          </button>

          {expandedSections.images && (
            <div className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">{img.type}</p>
                    <img
                      src={img.url}
                      alt={img.type}
                      className="w-full aspect-square object-contain bg-gray-50 rounded mb-2"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.svg';
                      }}
                    />
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {img.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preus */}
      {product.priceDetails && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('prices')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-50">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Detalls de Preus</h3>
                <p className="text-xs text-gray-500">Preus per països i variants</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.prices ? 'rotate-90' : ''}`} />
          </button>

          {expandedSections.prices && (
            <div className="p-6 pt-0">
              <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto font-mono max-h-96">
                {JSON.stringify(product.priceDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* JSON Complet */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('raw')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50">
              <Info className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-lg">JSON Complet (RAW)</h3>
              <p className="text-xs text-gray-500">Totes les dades sense processar</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.raw ? 'rotate-90' : ''}`} />
        </button>

        {expandedSections.raw && (
          <div className="p-6 pt-0">
            <pre className="text-xs bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto font-mono max-h-[600px] overflow-y-auto">
              {JSON.stringify(product, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
