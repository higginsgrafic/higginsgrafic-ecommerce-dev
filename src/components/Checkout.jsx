import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { useGridDebug } from '@/contexts/GridDebugContext';
import { formatPrice } from '@/utils/formatters';

function Checkout({ isOpen, onClose, items, totalPrice, onComplete }) {
  const { error } = useToast();
  const { getDebugStyle, isSectionEnabled } = useGridDebug();
  const [viewportHeight, setViewportHeight] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const vv = window.visualViewport;
    const update = () => {
      const h = Math.round((vv && vv.height) ? vv.height : window.innerHeight);
      setViewportHeight(h);
    };

    update();

    try {
      vv?.addEventListener('resize', update);
      vv?.addEventListener('scroll', update);
    } catch {
      // ignore
    }
    window.addEventListener('resize', update);

    return () => {
      try {
        vv?.removeEventListener('resize', update);
        vv?.removeEventListener('scroll', update);
      } catch {
        // ignore
      }
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    if (typeof window === 'undefined') return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const clientProves = {
    email: 'clientdeproves@grafic.local',
    firstName: 'Client',
    lastName: 'de Proves i Mesproves',
    address: "C/ de ves a saber quin octubre, 1",
    city: "Can d'Aixonses",
    postalCode: '00000',
    country: 'Petit',
    cardNumber: '0000 0000 0000 0',
    expiryDate: '00/00',
    cvv: '000',
  };

  const fillMockPayment = () => {
    setFormData((prev) => ({
      ...prev,
      ...clientProves,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Fake API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsProcessing(false);
      onComplete();

    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      error("Hi ha hagut un problema en processar la teva comanda. Si us plau, torna-ho a provar.");
    }
  };

  if (typeof document === 'undefined') return null;

  const wrapperHeight = viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 0);
  const paddingPx = 0;
  const modalMaxHeight = wrapperHeight || undefined;
  const shippingOriginalPrice = 4.2;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[35000]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.85)',
            }}
            onClick={onClose}
          />

          <div
            className="fixed inset-0 z-[35001] flex items-center justify-center"
            style={wrapperHeight ? { height: `${wrapperHeight}px` } : undefined}
            data-layout-inspector-root="true"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[920px] bg-white rounded-[29px] shadow-2xl overflow-hidden flex flex-col"
              style={{
                ...(isSectionEnabled('checkout') ? getDebugStyle('checkout', 'main') : {}),
                maxHeight: modalMaxHeight ? `${modalMaxHeight}px` : '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  <h2 className="text-2xl font-bold transition-opacity" style={{ color: "#141414" }}>Caixa Segura</h2>
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                  <Button variant="secondary" size="sm" type="button" onClick={fillMockPayment}>
                    Omple dades
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose} className="rounded-md h-9 w-9 p-0 pr-0 justify-end">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 min-h-0">
                <div className="h-full min-h-0 overflow-y-auto">
                  <div className="w-full flex justify-center px-0">
                    <div className="grid grid-cols-1 md:grid-cols-[520px_360px]">
                      <div className="pt-6 pb-0 pr-6 pl-0 flex items-end" style={{ color: "#141414", minHeight: 48 }}>
                        <h3 className="font-semibold">T’enviarem la factura a</h3>
                      </div>
                      <div className="pt-6 pb-0 pl-6 pr-0 flex items-end" style={{ color: "#141414", minHeight: 48 }}>
                        <h3 className="font-semibold flex items-center gap-2">
                          <CreditCard className="h-5 w-5" /> Informació de Pagament
                        </h3>
                      </div>

                      <div className="py-6 pr-6 pl-0">
                        <input
                          type="email"
                          name="email"
                          placeholder="Correu electrònic *"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="py-6 pl-6 pr-0">
                        <input
                          type="text"
                          name="cardNumber"
                          placeholder="Número de targeta *"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          required
                          maxLength="16"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        />
                      </div>

                      <div className="py-6 pr-6 pl-0" style={{ color: "#141414" }}>
                        <h3 className="font-semibold">Dades d'enviament</h3>
                      </div>
                      <div className="pl-6 pr-0 pb-6 pt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" name="expiryDate" placeholder="MM/AA *" value={formData.expiryDate} onChange={handleChange} required maxLength="5" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                          <input type="text" name="cvv" placeholder="CVV *" value={formData.cvv} onChange={handleChange} required maxLength="3" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                        </div>
                      </div>

                      <div className="pl-0 pr-6 pb-6 pt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" name="firstName" placeholder="Nom *" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                          <input type="text" name="lastName" placeholder="Cognoms *" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                        </div>
                      </div>
                      <div className="pl-6 pr-0 pb-6 pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm"><span className="transition-opacity" style={{ color: "#141414", opacity: 0.7 }}>Subtotal</span><span className="font-medium">{formatPrice(totalPrice)}</span></div>
                          <div className="flex justify-between text-sm">
                            <span className="transition-opacity" style={{ color: "#141414", opacity: 0.7 }}>Enviament</span>
                            <span className="flex items-baseline gap-2">
                              <span
                                className="transition-opacity"
                                style={{
                                  position: 'relative',
                                  display: 'inline-block',
                                  color: '#141414',
                                  opacity: 0.5,
                                  lineHeight: 1,
                                }}
                              >
                                {Number.isFinite(shippingOriginalPrice) ? formatPrice(shippingOriginalPrice) : ''}
                                <span
                                  aria-hidden="true"
                                  style={{
                                    position: 'absolute',
                                    left: '-6%',
                                    right: '-6%',
                                    top: '50%',
                                    height: '2px',
                                    backgroundColor: 'rgba(20,20,20,0.6)',
                                    transform: 'translateY(-50%) rotate(-12deg)',
                                    transformOrigin: 'center',
                                    borderRadius: '999px',
                                    pointerEvents: 'none',
                                  }}
                                />
                              </span>
                              <span className="font-medium">Gratuït</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pl-0 pr-6 pb-6 pt-0">
                        <input type="text" name="address" placeholder="Adreça *" value={formData.address} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                      </div>
                      <div className="pl-6 pr-0 pb-6 pt-0 flex items-center">
                        <div className="flex justify-between text-lg font-bold w-full">
                          <span>Tot plegat fa</span>
                          <span>{formatPrice(totalPrice)}</span>
                        </div>
                      </div>

                      <div className="pl-0 pr-6 pb-6 pt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" name="city" placeholder="Ciutat *" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                          <input type="text" name="postalCode" placeholder="Codi postal *" value={formData.postalCode} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                        </div>
                      </div>
                      <div className="pl-6 pr-0 pb-6 pt-0">
                        <Button type="submit" disabled={isProcessing} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg">
                          {isProcessing ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Processant...
                            </span>
                          ) : (
                            'Valida el pagament'
                          )}
                        </Button>
                      </div>

                      <div className="pl-0 pr-6 pb-6 pt-0 flex items-end">
                        <input type="text" name="country" placeholder="País *" value={formData.country} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                      </div>
                      <div className="py-6 pl-6 pr-0 flex items-end">
                        <p className="text-xs relative" style={{ color: "#141414", opacity: 0.6 }}>
                          <span aria-hidden="true" style={{ position: 'absolute', left: 0, transform: 'translateX(-10px)', color: '#6b7280', fontWeight: 700 }}>*</span>
                          Els camps amb asterisc són obligatoris.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export default Checkout;
