import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatPrice } from '@/utils/formatters';
import { fetchMockOrder, MOCK_CLIENT } from '@/lib/mockOrderStore';
import { STATUS_TO_STAGE as STATUS_TO_STAGE_MAP, avisDEstatAnormal } from '@/lib/orderStatus';

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('order');
  // Token de seguiment que arriba als enllaços dels correus transaccionals
  // (buildTrackingLink). Permet consultar la comanda sense número ni email.
  const trackingTokenFromUrl = searchParams.get('trackingToken');

  const [orderId, setOrderId] = useState(orderIdFromUrl || '');
  const [email, setEmail] = useState(import.meta.env.DEV && orderIdFromUrl ? MOCK_CLIENT.email : '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estats de la comanda (a la base de dades) → etapes que veu el client.
  // Viu a src/lib/orderStatus.js, amb proves automàtiques pròpies, perquè
  // aquesta informació ha de dir la veritat i ja va estar malament.
  const STATUS_TO_STAGE = STATUS_TO_STAGE_MAP;

  // Buscar comanda
  const handleTrackOrder = async (e) => {
    e?.preventDefault();

    // Amb un token de seguiment (enllaç del correu) no cal número ni email.
    if (!trackingTokenFromUrl && (!orderId.trim() || !email.trim())) {
      setError('Si us plau, introdueix el número de comanda i l\'email');
      return;
    }

    setLoading(true);
    setError('');

    if (import.meta.env.DEV) {
      const mockOrder = fetchMockOrder(orderId.trim(), email.trim());
      if (mockOrder) {
        const items = Array.isArray(mockOrder.items) ? mockOrder.items : [];
        setOrder({
          id: mockOrder.order_number || mockOrder.id,
          createdAt: mockOrder.created_at,
          // El status de la comanda de prova es respecta (abans sempre es
          // posava 'created' i no es podia veure cap altre estat en local).
          status: STATUS_TO_STAGE[mockOrder.status] || 'created',
          rawStatus: mockOrder.status || null,
          totalPrice: parseFloat(mockOrder.total) || 0,
          email: mockOrder.email,
          items: items.map((item, idx) => ({
            id: item.id || idx,
            name: item.name || 'Producte',
            size: item.size || '-',
            quantity: item.quantity || 1,
            price: item.price || 0,
            image: item.image || null,
          })),
          shippingAddress: {
            firstName: mockOrder.first_name || '',
            lastName: mockOrder.last_name || '',
            street: mockOrder.address || '',
            city: mockOrder.city || '',
            postalCode: mockOrder.postal_code || '',
            country: mockOrder.country || '',
          },
          tracking: mockOrder.tracking_number ? {
            carrier: mockOrder.tracking_carrier || null,
            trackingNumber: mockOrder.tracking_number,
            trackingUrl: mockOrder.tracking_url || null,
          } : null,
          estimatedDelivery: mockOrder.estimated_delivery || null,
        });
        setLoading(false);
        return;
      }
    }

    try {
      const url = trackingTokenFromUrl
        ? `/api/orders?trackingToken=${encodeURIComponent(trackingTokenFromUrl)}`
        : `/api/orders?orderNumber=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Comanda no trobada. Verifica el número i l\'email.');
      }

      const data = await res.json();
      if (!data.order) {
        throw new Error('Comanda no trobada.');
      }

      const o = data.order;
      const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : []);

      setOrder({
        id: o.order_number || o.id,
        createdAt: o.created_at,
        status: STATUS_TO_STAGE[o.status] || 'created',
        // Estat original, per poder avisar de comandes cancel·lades o aturades
        // en comptes de dibuixar-les com si anessin bé.
        rawStatus: o.status || null,
        totalPrice: parseFloat(o.total) || 0,
        email: o.email,
        items: items.map((item, idx) => ({
          id: item.id || idx,
          name: item.name || 'Producte',
          size: item.size || '-',
          quantity: item.quantity || 1,
          price: item.price || 0,
          image: item.image || null,
        })),
        shippingAddress: {
          firstName: o.first_name || '',
          lastName: o.last_name || '',
          street: o.address || '',
          city: o.city || '',
          postalCode: o.postal_code || '',
          country: o.country || '',
        },
        tracking: o.tracking_number ? {
          carrier: o.tracking_carrier || null,
          trackingNumber: o.tracking_number,
          trackingUrl: o.tracking_url || null,
        } : null,
        estimatedDelivery: o.estimated_delivery || null,
      });
    } catch (err) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Buscar automàticament si ve de l'URL
  useEffect(() => {
    if (trackingTokenFromUrl || (orderIdFromUrl && email)) {
      handleTrackOrder();
    }
  }, []);

  // Estats de la comanda amb icones i colors
  const orderStages = [
    {
      key: 'created',
      label: 'Rebuda',
      icon: '✓',
      description: 'Comanda rebuda i confirmada'
    },
    {
      key: 'processing',
      label: 'Processant',
      icon: '⚙',
      description: 'Preparant els fitxers per producció'
    },
    {
      key: 'in_production',
      label: 'En Producció',
      icon: '🏭',
      description: 'S\'està imprimint el teu producte'
    },
    {
      key: 'shipped',
      label: 'Enviada',
      icon: '📦',
      description: 'El paquet està de camí'
    },
    {
      key: 'delivered',
      label: 'Entregada',
      icon: '✓',
      description: 'Comanda entregada correctament'
    }
  ];

  const getCurrentStageIndex = (status) => {
    const index = orderStages.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  // Comandes que no segueixen el recorregut normal. No es poden dibuixar com un
  // punt de la barra de progrés sense enganyar el client, així que es mostren
  // amb un avís propi i sense barra.
  const estatAnormal = avisDEstatAnormal(order?.rawStatus);

  return (
    <>
      <SEO
        title="Seguiment de Comanda | GRÀFIC"
        description="Segueix l'estat de la teva comanda en temps real"
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'Seguiment de Comanda' }]} />
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-oswald text-4xl md:text-5xl font-bold uppercase mb-3">
              Seguiment de Comanda
            </h1>
            <p className="font-roboto text-lg text-gray-600">
              Introdueix el teu número de comanda per veure l'estat
            </p>
          </div>

          {/* Formulari de cerca */}
          {!order && (
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Número de Comanda
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="ex: ORD-1234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-roboto">
                    Email de la Comanda
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-roboto">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-roboto font-medium"
                >
                  {loading ? 'Buscant...' : 'Seguir Comanda'}
                </button>
              </form>
            </div>
          )}

          {/* Detalls de la comanda */}
          {order && (
            <div className="space-y-6">
              {/* Botó per buscar altra comanda */}
              <button
                onClick={() => {
                  setOrder(null);
                  setOrderId('');
                  setEmail('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-roboto flex items-center gap-2"
              >
                ← Buscar altra comanda
              </button>

              {/* Info de la comanda */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-oswald text-2xl font-bold uppercase">
                      Comanda {order.id}
                    </h2>
                    <p className="text-sm text-gray-600 font-roboto mt-1">
                      Data: {new Date(order.createdAt || Date.now()).toLocaleDateString('ca-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 font-roboto">Total</div>
                    <div className="font-oswald text-2xl font-bold">
                      {formatPrice(order.totalPrice ?? 0)}
                    </div>
                  </div>
                </div>

                {/* Avís de comanda cancel·lada o aturada. En aquests casos NO
                    es dibuixa la barra de progrés: una comanda cancel·lada no
                    està "en camí" ni "processant-se". */}
                {estatAnormal && (
                  <div className={`mb-8 p-5 border rounded-lg ${estatAnormal.classes}`}>
                    <div className="font-oswald text-xl font-bold uppercase mb-2">
                      {estatAnormal.titol}
                    </div>
                    <p className="text-sm font-roboto leading-relaxed">{estatAnormal.text}</p>
                  </div>
                )}

                {/* Progress bar */}
                {!estatAnormal && (
                <div className="mb-8">
                  <div className="relative">
                    {/* Línia de fons */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
                    {/* Línia de progrés */}
                    <div
                      className="absolute top-5 left-0 h-1 bg-green-600 transition-all duration-500"
                      style={{
                        width: `${(getCurrentStageIndex(order.status) / (orderStages.length - 1)) * 100}%`
                      }}
                    ></div>

                    {/* Etapes */}
                    <div className="relative flex justify-between">
                      {orderStages.map((stage, index) => {
                        const currentIndex = getCurrentStageIndex(order.status);
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                          <div key={stage.key} className="flex flex-col items-center">
                            {/* Icona */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                isCompleted
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                            >
                              {stage.icon}
                            </div>
                            {/* Label */}
                            <div className="mt-2 text-center">
                              <div
                                className={`text-xs font-medium font-roboto ${
                                  isCompleted ? 'text-gray-900' : 'text-gray-500'
                                }`}
                              >
                                {stage.label}
                              </div>
                              {isCurrent && (
                                <div className="text-xs text-green-600 mt-1 font-roboto">
                                  {stage.description}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                )}

                {/* Tracking info */}
                {order.tracking && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📍</span>
                      <div className="flex-1">
                        <h3 className="font-roboto font-semibold text-gray-900 mb-2">
                          Informació de Seguiment
                        </h3>
                        <div className="space-y-2 text-sm">
                          {order.tracking.carrier && (
                            <div className="flex gap-2">
                              <span className="text-gray-600">Transportista:</span>
                              <span className="font-medium">{order.tracking.carrier}</span>
                            </div>
                          )}
                          {order.tracking.trackingNumber && (
                            <div className="flex gap-2">
                              <span className="text-gray-600">Número de seguiment:</span>
                              <span className="font-mono font-medium">{order.tracking.trackingNumber}</span>
                            </div>
                          )}
                          {order.tracking.trackingUrl && (
                            <a
                              href={order.tracking.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Seguir paquet en temps real
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                          {order.estimatedDelivery && (
                            <div className="flex gap-2 pt-2 border-t border-blue-200">
                              <span className="text-gray-600">Entrega estimada:</span>
                              <span className="font-medium">
                                {new Date(order.estimatedDelivery).toLocaleDateString('ca-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Productes */}
                <div className="mt-6">
                  <h3 className="font-roboto font-semibold text-gray-900 mb-3">
                    Productes ({order.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-roboto font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600 font-roboto">
                            Talla: {item.size} • Quantitat: {item.quantity}
                          </div>
                        </div>
                        <div className="font-roboto font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adreça d'enviament */}
                {order.shippingAddress && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-roboto font-semibold text-gray-900 mb-3">
                      Adreça d'Enviament
                    </h3>
                    <div className="text-sm text-gray-700 font-roboto">
                      <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                      <div>{order.shippingAddress.street}</div>
                      <div>{order.shippingAddress.postalCode} {order.shippingAddress.city}</div>
                      <div>{order.shippingAddress.country}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ajuda */}
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="font-roboto font-semibold text-gray-900 mb-2">
                  Necessites ajuda?
                </h3>
                <p className="text-sm text-gray-700 font-roboto mb-3">
                  Si tens alguna pregunta sobre la teva comanda, contacta amb nosaltres.
                </p>
                <a
                  href="/contact"
                  className="inline-block px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm font-roboto font-medium"
                >
                  Contactar amb Suport
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderTrackingPage;
