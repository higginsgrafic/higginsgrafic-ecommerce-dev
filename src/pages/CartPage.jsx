import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Checkout from '@/components/Checkout';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice } from '@/utils/formatters';
import Breadcrumbs from '@/components/Breadcrumbs';

const CartPage = ({ cartItems, onUpdateQuantity, onRemove }) => {
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.95;
  const total = subtotal + shipping;

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[129px] lg:pt-[145px] pb-8 md:pb-12">
      <Helmet>
        <title>Cistell | GRAFC</title>
        <meta name="description" content="Revisa els productes del teu cistell." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6 sm:mb-8">
          <Breadcrumbs items={[
            { label: 'Cistell' }
          ]} />
        </div>

        {/* Capçalera */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-oswald uppercase text-foreground">
            El teu Cistell
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Revisa els teus productes abans de continuar
          </p>
        </div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-lg shadow-sm"
          >
            <div className="mb-6">
              <span
                aria-hidden="true"
                className="h-24 w-24 mx-auto opacity-20"
                style={{
                  display: 'block',
                  backgroundColor: 'hsl(var(--foreground))',
                  WebkitMaskImage: "url(/custom_logos/icons/basket-empty.svg)",
                  maskImage: "url(/custom_logos/icons/basket-empty.svg)",
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain'
                }}
              />
            </div>
            <h2 className="text-2xl font-medium mb-4 text-foreground">El cistell està buit</h2>
            <p className="text-muted-foreground mb-8">Sembla que encara no has afegit res al teu cistell.</p>
            <Link to="/">
              <Button className="rounded-sm" style={{ backgroundColor: 'hsl(var(--foreground))', color: '#FFFFFF' }}>
                Tornar a la Botiga
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Columna Esquerra: Productes del Cistell */}
            <div className="lg:col-span-2 mb-6 lg:mb-0">
              <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-bold font-oswald uppercase mb-3 sm:mb-4 text-foreground">
                  El teu Cistell ({cartItems.length})
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-100 last:border-0">
                      {/* Imatge */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Detalls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                          <div className="flex-1 pr-2 min-w-0">
                            <h3 className="font-oswald uppercase text-xs sm:text-sm font-bold line-clamp-2 sm:line-clamp-1 text-foreground">
                              {item.name}
                            </h3>
                            <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-muted-foreground">
                              Talla: {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemove(item.id, item.size)}
                            className="hover:text-red-500 transition-colors flex-shrink-0"
                            style={{ color: 'hsl(var(--foreground))', opacity: 0.4 }}
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>

                        {/* Preu i controls */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="font-oswald text-base sm:text-lg font-normal text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </div>

                          {/* Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md h-7 sm:h-8">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.size, Math.max(0, item.quantity - 1))}
                              className="px-2 sm:px-3 hover:bg-gray-100 h-full"
                              style={{ color: 'hsl(var(--foreground))' }}
                              aria-label="Reduir quantitat"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.size, item.quantity + 1)}
                              className="px-2 sm:px-3 hover:bg-gray-100 h-full"
                              style={{ color: 'hsl(var(--foreground))' }}
                              aria-label="Augmentar quantitat"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resum mòbil (només visible en mòbil) */}
              <div className="lg:hidden bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Enviament</span>
                    <span className="text-foreground">{shipping === 0 ? 'Gratuït' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-oswald text-lg sm:text-xl font-normal text-foreground">Total</span>
                    <span className="font-oswald text-lg sm:text-xl font-normal text-foreground">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Dreta: Resum de la Comanda */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg font-bold font-oswald uppercase mb-6 text-foreground">
                    Resum de la Comanda
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Enviament</span>
                      <span className="text-foreground">{shipping === 0 ? 'Gratuït' : formatPrice(shipping)}</span>
                    </div>
                    {shipping === 0 ? null : (
                      <p className="text-xs text-muted-foreground" style={{ opacity: 0.85 }}>
                        Afegeix {formatPrice(50 - subtotal)} més per enviament gratuït
                      </p>
                    )}
                    <div className="flex justify-between pt-3 border-t">
                      <span className="font-oswald text-xl font-normal text-foreground">Total</span>
                      <span className="font-oswald text-xl font-normal text-foreground">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full h-12 text-sm font-oswald uppercase tracking-wider rounded-sm"
                    style={{ backgroundColor: 'hsl(var(--foreground))', color: '#FFFFFF' }}
                  >
                    Continuar al Checkout
                  </Button>

                  <Link to="/">
                    <Button
                      variant="ghost"
                      className="w-full mt-3 h-10 text-sm font-oswald uppercase tracking-wider rounded-sm"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      Continua comprant
                    </Button>
                  </Link>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShoppingBag className="h-4 w-4" />
                      <span>{cartItems.length} {cartItems.length === 1 ? 'producte' : 'productes'} al cistell</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
