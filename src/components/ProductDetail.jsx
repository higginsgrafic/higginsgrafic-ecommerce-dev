import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGridDebug } from '@/contexts/GridDebugContext';
import { formatPrice } from '@/utils/formatters';

function ProductDetail({ product, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const sizes = ['S', 'M', 'L', 'XL'];
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const { getDebugStyle, isSectionEnabled } = useGridDebug();

  // Focus management - focus on close button when modal opens
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Trap focus inside modal
    const handleTab = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [onClose]);

  // Crear galeria amb imatge principal, hover i imatges genèriques
  const gallery = [
    { url: product.image, alt: `${product.name} - Vista frontal` },
    { url: product.hoverImage?.props?.src || product.image, alt: `${product.name} - Vista model` },
    { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', alt: `${product.name} - Detall` },
    { url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800', alt: `${product.name} - Detall teixit` }
  ];

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, 1, true);
    onClose();
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
          style={isSectionEnabled('productDetail') ? getDebugStyle('productDetail', 'main') : {}}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center z-10">
            <h2 className="font-oswald text-xl sm:text-2xl font-bold truncate pr-4" style={{ color: "#141414" }}>
              {product.name}
            </h2>
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full flex-shrink-0"
              style={{ color: "#141414" }}
              aria-label="Tancar detall del producte"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div
              className="grid md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-8"
              style={isSectionEnabled('productDetail') ? getDebugStyle('productDetail', 'row1') : {}}
            >
              {/* Galeria d'imatges */}
              <div className="space-y-4">
                {/* Imatge principal */}
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={gallery[selectedImageIndex].url}
                      alt={gallery[selectedImageIndex].alt}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                      onClick={() => setIsZoomed(!isZoomed)}
                    />
                  </AnimatePresence>

                  {/* Zoom indicator */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4" style={{ color: "#141414" }} />
                  </div>

                  {/* Fletxes de navegació */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        style={{ color: "#141414" }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        style={{ color: "#141414" }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Indicadors */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {gallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === selectedImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Miniatures */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {gallery.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? 'border-gray-900 shadow-md'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Detalls del producte */}
              <div className="space-y-6">
                {/* Preu i descripció */}
                <div>
                  <p className="font-oswald text-3xl sm:text-4xl font-normal mb-3" style={{ color: "#141414" }}>
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-base leading-relaxed text-justify" style={{ color: "#141414", opacity: 0.7 }}>
                    {product.description}
                  </p>
                </div>

                {/* Selector de talla */}
                <div>
                  <h3 className="font-oswald font-semibold text-lg mb-3" style={{ color: "#141414" }}>
                    Selecciona la Talla
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`font-oswald py-3 px-4 border-2 rounded-lg font-medium transition-all ${
                          selectedSize === size
                            ? 'border-gray-900 bg-gray-900 text-white scale-105'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={selectedSize !== size ? { color: "#141414" } : {}}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botó afegir al cistell */}
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-14 text-base font-oswald uppercase tracking-wider rounded-lg"
                  style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
                >
                  Afegeix al cistell - {formatPrice(product.price)}
                </Button>

                {/* Detalls del producte */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <h3 className="font-oswald font-semibold text-lg" style={{ color: "#141414" }}>
                    Detalls del Producte
                  </h3>
                  <ul className="font-roboto space-y-2 text-sm" style={{ color: "#141414", opacity: 0.7 }}>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>Gildan 5000 100% Cotó premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>Teixit pre-encongit per major durabilitat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>Coll de doble agulla sense costures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>Coll i espatlles reforçades</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>Etiqueta extraïble per màxim confort</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>Disseny d'il·lustració d'autor exclusiu</span>
                    </li>
                  </ul>
                </div>

                {/* Guia de cura */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <h3 className="font-oswald font-semibold text-lg" style={{ color: "#141414" }}>
                    Cura del Producte
                  </h3>
                  <ul className="font-roboto space-y-2 text-sm" style={{ color: "#141414", opacity: 0.7 }}>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>Rentar a màquina a 30°C màxim</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>No utilitzar lleixiu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>Planxar a baixa temperatura del revés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-900 mt-0.5">•</span>
                      <span>No rentar en sec</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProductDetail;
