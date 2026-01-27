import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  Package,
  AlertCircle,
  Loader2,
  Check,
  Info
} from 'lucide-react';
import { productsService } from '@/api/supabase-products';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { useProductContext } from '@/contexts/ProductContext';
import { formatPrice } from '@/utils/formatters';

export default function GelatoProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { addToCart, isInWishlist, toggleWishlist } = useProductContext();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showVariantInfo, setShowVariantInfo] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) return;

    const availableVariants = product.variants.filter(v => v.isAvailable);
    if (availableVariants.length > 0) {
      const firstVariant = availableVariants[0];
      setSelectedSize(firstVariant.size);
      setSelectedColor(firstVariant.color);
      setSelectedVariant(firstVariant);
    }
  }, [product]);

  useEffect(() => {
    if (!product || !selectedSize || !selectedColor) return;

    const variant = product.variants.find(
      v => v.size === selectedSize && v.color === selectedColor
    );

    if (variant) {
      setSelectedVariant(variant);
    }
  }, [selectedSize, selectedColor, product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const productData = await productsService.getProductById(id);

      if (!productData) {
        setError('Producte no trobat');
        return;
      }

      if (!productData.gelatoProductId || productData.gelatoProductId === `mock-${productData.id}`) {
        setError('Aquest producte no està disponible al catàleg');
        return;
      }

      setProduct(productData);
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err?.message || 'Error carregant el producte');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSizes = () => {
    if (!product || !product.variants) return [];
    const sizes = [...new Set(product.variants.map(v => v.size))];
    return sizes.filter(size =>
      product.variants.some(v => v.size === size && v.isAvailable)
    );
  };

  const getAvailableColorsForSize = (size) => {
    if (!product || !product.variants) return [];
    return product.variants.filter(v => v.size === size && v.isAvailable);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const availableColors = getAvailableColorsForSize(size);
    if (availableColors.length > 0) {
      setSelectedColor(availableColors[0].color);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      showError('Selecciona una variant abans d\'afegir al cistell');
      return;
    }

    addToCart(product, selectedSize, quantity);
    success('Producte afegit al cistell');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    const inWishlist = isInWishlist(product.id);
    success(inWishlist ? 'Eliminat de favorits' : 'Afegit a favorits');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Enllaç copiat al porta-retalls');
    }
  };

  const openGallery = (index) => {
    setSelectedImageIndex(index);
    setShowGalleryModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
    document.body.style.overflow = 'auto';
  };

  const nextGalleryImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevGalleryImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-roboto">Carregant producte...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="font-oswald text-2xl font-bold text-gray-900 mb-2">
            {error || 'Producte no trobat'}
          </h2>
          <Button
            onClick={() => navigate('/fulfillment')}
            className="mt-4"
            style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
          >
            Tornar al catàleg
          </Button>
        </div>
      </div>
    );
  }

  const availableSizes = getAvailableSizes();
  const availableColors = selectedSize ? getAvailableColorsForSize(selectedSize) : [];
  const currentPrice = selectedVariant?.price || product.price;

  return (
    <>
      <Helmet>
        <title>{product.name} | GRÀFIC</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav className="pt-[17px] lg:pt-[25px] pb-4 ml-[5px]">
            <ol className="flex items-center space-x-2 text-sm uppercase">
              <li><Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">Inici</Link></li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li><Link to="/fulfillment" className="text-gray-500 hover:text-gray-900 transition-colors">Catàleg</Link></li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li className="text-gray-900 font-medium truncate">{product.name}</li>
            </ol>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                onClick={() => openGallery(selectedImageIndex)}
              >
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex
                          ? 'border-gray-900'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Vista ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-oswald uppercase text-gray-600">
                    {product.collection}
                  </span>
                  <span className="inline-block px-3 py-1 bg-blue-100 rounded-full text-xs font-oswald uppercase text-blue-600">
                    Print on Demand
                  </span>
                </div>
                <h1 className="font-oswald text-4xl lg:text-5xl font-bold uppercase mb-4" style={{ color: '#141414' }}>
                  {product.name}
                </h1>
                <p className="font-oswald text-3xl font-normal mb-6" style={{ color: '#141414' }}>
                  {formatPrice(currentPrice)}
                </p>
                <p className="font-roboto text-base leading-relaxed" style={{ color: '#141414', opacity: 0.8 }}>
                  {product.description}
                </p>
              </div>

              {availableSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-oswald font-semibold text-lg uppercase" style={{ color: '#141414' }}>
                      Talla
                    </h3>
                    {selectedSize && (
                      <span className="text-sm font-roboto text-gray-600">
                        Seleccionada: {selectedSize}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-6 py-3 border-2 rounded-lg font-oswald font-medium transition-all ${
                          selectedSize === size
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 hover:border-gray-900 text-gray-900'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-oswald font-semibold text-lg uppercase" style={{ color: '#141414' }}>
                      Color
                    </h3>
                    {selectedColor && (
                      <span className="text-sm font-roboto text-gray-600">
                        {selectedColor}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((variant) => (
                      <button
                        key={`${variant.size}-${variant.color}`}
                        onClick={() => handleColorChange(variant.color)}
                        className={`group relative transition-all ${
                          selectedColor === variant.color ? 'scale-110' : ''
                        }`}
                        title={variant.color}
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-4 transition-all ${
                            selectedColor === variant.color
                              ? 'border-gray-900 shadow-lg'
                              : 'border-gray-300 group-hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        {selectedColor === variant.color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedVariant && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-oswald font-semibold text-sm uppercase text-blue-900">
                      Informació de la variant
                    </h4>
                    <button
                      onClick={() => setShowVariantInfo(!showVariantInfo)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1 text-sm font-roboto text-blue-900">
                    <div className="flex justify-between">
                      <span className="opacity-70">Preu:</span>
                      <span className="font-semibold">{formatPrice(selectedVariant.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Stock:</span>
                      <span className="font-semibold">
                        {selectedVariant.stock > 100 ? 'Disponible' : `${selectedVariant.stock} unitats`}
                      </span>
                    </div>
                    {showVariantInfo && (
                      <>
                        <div className="flex justify-between">
                          <span className="opacity-70">SKU:</span>
                          <span className="font-mono text-xs">{selectedVariant.sku || 'N/A'}</span>
                        </div>
                        {selectedVariant.gelatoVariantId && (
                          <div className="flex justify-between items-start pt-2 border-t border-blue-200">
                            <span className="opacity-70">Gelato ID:</span>
                            <span className="font-mono text-xs text-right max-w-[200px] break-all">
                              {selectedVariant.gelatoVariantId}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className="flex-1 h-14 text-base font-oswald uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Afegir al Cistell
                </Button>
                <Button
                  onClick={handleWishlistToggle}
                  variant="outline"
                  className="h-14 px-4 border-2"
                  style={{ borderColor: '#141414', color: '#141414' }}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="h-14 px-4 border-2"
                  style={{ borderColor: '#141414', color: '#141414' }}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-8 h-8 mx-auto mb-2" style={{ color: '#141414' }} />
                  <p className="text-xs font-roboto font-medium" style={{ color: '#141414' }}>
                    Enviament Gratuït
                  </p>
                  <p className="text-xs text-gray-600">en comandes +50€</p>
                </div>
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2" style={{ color: '#141414' }} />
                  <p className="text-xs font-roboto font-medium" style={{ color: '#141414' }}>
                    Print on Demand
                  </p>
                  <p className="text-xs text-gray-600">2-5 dies producció</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: '#141414' }} />
                  <p className="text-xs font-roboto font-medium" style={{ color: '#141414' }}>
                    Garantia Qualitat
                  </p>
                  <p className="text-xs text-gray-600">100% satisfacció</p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <h3 className="font-oswald font-semibold text-lg uppercase" style={{ color: '#141414' }}>
                  Detalls del Producte
                </h3>
                <ul className="space-y-2 text-sm font-roboto" style={{ color: '#141414', opacity: 0.8 }}>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Material d'alta qualitat amb impressió premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Disseny personalitzable amb les teves imatges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Producció sostenible i responsable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Fet a mida per a cada comanda</span>
                  </li>
                  {product.variants && product.variants.length > 0 && (
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Disponible en {product.variants.length} variants diferents</span>
                    </li>
                  )}
                </ul>
              </div>

              {product.gelatoProductId && (
                <div className="pt-6 border-t border-gray-200">
                  <details className="group">
                    <summary className="cursor-pointer font-oswald font-semibold text-sm uppercase text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2">
                      Informació tècnica
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-3 space-y-2 text-xs font-roboto text-gray-600">
                      <div className="flex justify-between">
                        <span>Product ID:</span>
                        <span className="font-mono">{product.gelatoProductId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SKU:</span>
                        <span className="font-mono">{product.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Categoria:</span>
                        <span className="capitalize">{product.category}</span>
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>

        {showGalleryModal && (
          <div className="fixed inset-0 z-[20000] bg-black/95 flex items-center justify-center">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
              aria-label="Tancar galeria"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={prevGalleryImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
              aria-label="Imatge anterior"
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </button>

            <div className="max-w-7xl max-h-[90vh] mx-auto px-4">
              <img
                src={product.images[selectedImageIndex]}
                alt={`${product.name} - Vista ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
                onError={(e) => {
                  e.target.src = '/placeholder-product.svg';
                }}
              />
              <div className="text-white text-center mt-4 font-oswald">
                {selectedImageIndex + 1} / {product.images.length}
              </div>
            </div>

            <button
              onClick={nextGalleryImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
              aria-label="Imatge següent"
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-3 rounded-lg max-w-[90vw] overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded overflow-hidden transition-all flex-shrink-0 ${
                    idx === selectedImageIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
