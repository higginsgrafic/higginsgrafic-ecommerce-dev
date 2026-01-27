import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, CreditCard, Mail, MapPin, Clock, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatters';
import { useToast } from '@/contexts/ToastContext';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { info } = useToast();

  // Simulació de dades de comanda (en producció vindrien del backend)
  const orderData = {
    id: orderId || 'GRF-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    date: new Date().toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: 'long'
    }),
    email: 'client@exemple.cat',
    shippingAddress: {
      name: 'Joan Garcia',
      street: 'Carrer de la Pau, 123',
      city: 'Barcelona',
      postalCode: '08001',
      country: 'Espanya'
    },
    items: [
      {
        id: 1,
        name: 'MASCHINENMENSCH',
        size: 'M',
        quantity: 1,
        price: 29.99,
        image: '/tshirt-white.jpg'
      }
    ],
    subtotal: 29.99,
    shipping: 0,
    total: 29.99
  };

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadInvoice = () => {
    info('Funció de descàrrega de factura (per implementar amb backend)');
  };

  return (
    <>
      <Helmet>
        <title>Comanda Confirmada #{orderData.id} | GRÀFIC</title>
        <meta name="description" content="La teva comanda s'ha processat correctament" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Capçalera d'èxit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>

            <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase mb-2" style={{ color: '#141414' }}>
              Comanda confirmada!
            </h1>
            <p className="text-lg" style={{ color: '#141414', opacity: 0.7 }}>
              Sia servit i gràcies
            </p>
            <p className="text-sm mt-2" style={{ color: '#141414', opacity: 0.5 }}>
              Número de comanda: <span className="font-mono font-bold">{orderData.id}</span>
            </p>
          </motion.div>

          {/* Informació de seguiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Confirmació enviada</p>
                <p className="text-sm" style={{ color: '#141414', opacity: 0.7 }}>
                  Hem enviat un correu de confirmació a <strong>{orderData.email}</strong> amb tots els detalls de la teva comanda.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline de lliurament */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="font-oswald text-xl font-bold uppercase mb-6" style={{ color: '#141414' }}>
              Estat de la comanda
            </h2>

            <div className="space-y-6">
              {/* Pas 1: Processant */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium">Comanda rebuda</p>
                  <p className="text-sm" style={{ color: '#141414', opacity: 0.6 }}>
                    {orderData.date}
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="ml-5 h-8 w-0.5 bg-gray-200"></div>

              {/* Pas 2: Preparant */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium">Preparant l'enviament</p>
                  <p className="text-sm" style={{ color: '#141414', opacity: 0.6 }}>
                    En procés
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="ml-5 h-8 w-0.5 bg-gray-200"></div>

              {/* Pas 3: Enviat */}
              <div className="flex items-start gap-4 opacity-50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium">En trànsit</p>
                  <p className="text-sm" style={{ color: '#141414', opacity: 0.6 }}>
                    Pendent
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="ml-5 h-8 w-0.5 bg-gray-200"></div>

              {/* Pas 4: Lliurat */}
              <div className="flex items-start gap-4 opacity-50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium">Lliurat</p>
                  <p className="text-sm flex items-center gap-1" style={{ color: '#141414', opacity: 0.6 }}>
                    <Clock className="w-4 h-4" />
                    Estimat: {orderData.estimatedDelivery}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resum de la comanda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="font-oswald text-xl font-bold uppercase mb-4" style={{ color: '#141414' }}>
              Resum de la comanda
            </h2>

            {/* Productes */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-oswald font-bold uppercase">{item.name}</p>
                    <p className="text-sm" style={{ color: '#141414', opacity: 0.6 }}>
                      Talla: {item.size} · Quantitat: {item.quantity}
                    </p>
                    <p className="font-oswald text-lg mt-1">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#141414', opacity: 0.7 }}>Subtotal</span>
                <span>{formatPrice(orderData.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#141414', opacity: 0.7 }}>Enviament</span>
                <span>{orderData.shipping === 0 ? 'Gratuït' : formatPrice(orderData.shipping)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-oswald text-xl">
                <span>Tot plegat fa</span>
                <span>{formatPrice(orderData.total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Adreça d'enviament */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
          >
            <h2 className="font-oswald text-xl font-bold uppercase mb-4" style={{ color: '#141414' }}>
              Dades d'enviament
            </h2>
            <div className="text-sm space-y-1" style={{ color: '#141414', opacity: 0.8 }}>
              <p className="font-medium">{orderData.shippingAddress.name}</p>
              <p>{orderData.shippingAddress.street}</p>
              <p>{orderData.shippingAddress.postalCode} {orderData.shippingAddress.city}</p>
              <p>{orderData.shippingAddress.country}</p>
            </div>
          </motion.div>

          {/* Accions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              className="flex-1 h-12 border-2"
            >
              <Download className="mr-2 h-5 w-5" />
              Descarregar factura
            </Button>
            <Link to="/" className="flex-1">
              <Button className="w-full h-12" style={{ backgroundColor: '#141414', color: '#FFFFFF' }}>
                Continua comprant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Suport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8 text-sm"
            style={{ color: '#141414', opacity: 0.6 }}
          >
            <p>Necessites ajuda? <Link to="/contact" className="underline hover:opacity-80">Contacta'ns</Link></p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
