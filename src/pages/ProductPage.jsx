import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, X, Heart, Share2, ShoppingCart, Loader2, Plus, Minus } from 'lucide-react';
import { productsService } from '@/api/supabase-products';
import { supabase } from '@/api/supabase-products';
import { useToast } from '@/contexts/ToastContext';
import { useProductContext } from '@/contexts/ProductContext';
import { formatPrice } from '@/utils/formatters';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { addToCart, isInWishlist, toggleWishlist } = useProductContext();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [mockups, setMockups] = useState([]);
  const [error, setError] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  useEffect(() => {
    loadProduct();
    loadMockups();
  }, [id]);

  useEffect(() => {
    if (!product?.variants?.length) return;

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
        navigate('/404');
        return;
      }

      setProduct(productData);
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err?.message || 'Error carregant el producte');
      showError('Error carregant el producte');
    } finally {
      setLoading(false);
    }
  };

  const loadMockups = async () => {
    try {
      const { data, error } = await supabase
        .from('product_mockups')
        .select('*')
        .eq('product_id', id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setMockups(data);
      }
    } catch (err) {
      console.error('Error loading mockups:', err);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      showError('Selecciona una talla i color');
      return;
    }

    addToCart(product, selectedSize, quantity);
    success('Producte afegit al cistell');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    const wasInWishlist = isInWishlist(product.id);
    if (!wasInWishlist) {
      success('Afegit a favorits');
    } else {
      success('Eliminat de favorits');
    }
  };

  const openGallery = (index) => {
    setSelectedImageIndex(index);
    setShowGalleryModal(true);
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
  };

  const nextImage = () => {
    const totalImages = mockups.length > 0 ? mockups.length : product.images.length;
    setSelectedImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    const totalImages = mockups.length > 0 ? mockups.length : product.images.length;
    setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const availableSizes = product?.variants
    ? [...new Set(product.variants.filter(v => v.isAvailable).map(v => v.size))]
    : [];

  const availableColors = product?.variants
    ? [...new Set(product.variants.filter(v => v.isAvailable && v.size === selectedSize).map(v => v.color))]
    : [];

  const displayImages = mockups.length > 0
    ? mockups.map(m => m.image_url)
    : product?.images || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || 'Producte no trobat'}</p>
          <Link to="/" className="text-black underline">
            Tornar a l'inici
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | GRÀFIC</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm uppercase">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Inici
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <Link to={`/${product.collection}`} className="text-gray-500 hover:text-gray-900 transition-colors">
                  {product.collection}
                </Link>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 cursor-pointer" onClick={() => openGallery(selectedImageIndex)}>
                <img
                  src={displayImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                        idx === selectedImageIndex ? 'ring-2 ring-black' : ''
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="font-oswald text-4xl font-bold uppercase mb-4">{product.name}</h1>

              <p className="font-oswald text-3xl mb-6">
                {formatPrice(product.price)}
              </p>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {availableSizes.length > 0 && (
                <div className="mb-6">
                  <label className="block font-medium mb-3">Talla</label>
                  <div className="flex gap-2">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-2 border rounded-lg font-medium transition-colors ${
                          selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="mb-6">
                  <label className="block font-medium mb-3">Color</label>
                  <div className="flex gap-3">
                    {availableColors.map(color => {
                      const variant = product.variants.find(v => v.color === color && v.size === selectedSize);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-black scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: variant?.colorHex || '#ccc' }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block font-medium mb-3">Quantitat</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:border-black transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:border-black transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className="flex-1 bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Afegir al cistell
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`w-14 h-14 flex items-center justify-center border rounded-lg transition-colors ${
                    isInWishlist(product.id)
                      ? 'bg-red-50 border-red-500 text-red-500'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {selectedVariant && (
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-3">Detalls del producte</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>SKU: {selectedVariant.sku}</li>
                    {selectedVariant.stock && <li>Stock: {selectedVariant.stock} unitats</li>}
                    <li>Col·lecció: {product.collection}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {showGalleryModal && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </button>

            <div className="max-w-7xl max-h-[90vh] mx-auto px-4">
              <img
                src={displayImages[selectedImageIndex]}
                alt={`${product.name} - Vista ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
              <div className="text-white text-center mt-4 font-oswald">
                {selectedImageIndex + 1} / {displayImages.length}
              </div>
            </div>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
