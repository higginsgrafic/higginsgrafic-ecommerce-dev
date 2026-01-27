import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, RotateCcw, MapPin, Clock, Euro } from 'lucide-react';
import SEO from '@/components/SEO';

function ShippingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shippingZones = [
    {
      zone: 'Espanya (Península i Balears)',
      time: '3-5 dies laborables',
      cost: 'Gratuït >50€, sinon 4,95€',
      icon: MapPin
    },
    {
      zone: 'Espanya (Canàries, Ceuta, Melilla)',
      time: '5-7 dies laborables',
      cost: '6,95€',
      icon: MapPin
    },
    {
      zone: 'Unió Europea',
      time: '5-10 dies laborables',
      cost: 'Gratuït >50€, sinon 6,95€',
      icon: MapPin
    },
    {
      zone: 'Internacional',
      time: '10-15 dies laborables',
      cost: 'Calculat al checkout',
      icon: MapPin
    }
  ];

  return (
    <>
      <SEO
        title="Enviaments i Devolucions | GRÀFIC"
        description="Informació sobre enviaments, temps de lliurament, costos i política de devolucions de GRÀFIC. Enviament gratuït >50€. Devolucions en 14 dies."
        keywords="enviaments gràfic, devolucions, enviament gratuït, temps lliurament, política devolucions"
        type="website"
        url="/shipping"
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gray-900 text-white pt-[129px] lg:pt-[145px] pb-16 lg:pb-24">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-oswald text-[36pt] lg:text-[48pt] font-bold uppercase mb-4">
                Enviaments i Devolucions
              </h1>
              <p className="font-roboto text-[14pt] text-gray-300">
                Enviament gratuït a partir de 50€ | Devolucions en 14 dies
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {/* Shipping Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-8 h-8" style={{ color: '#141414' }} />
              <h2 className="font-oswald text-[32pt] font-bold" style={{ color: '#141414' }}>
                Enviaments
              </h2>
            </div>

            {/* Free Shipping Banner */}
            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8">
              <div className="flex items-start gap-3">
                <Euro className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-oswald text-[18pt] font-bold mb-2 text-green-900">
                    Enviament Gratuït
                  </h3>
                  <p className="font-roboto text-[13pt] text-green-800 leading-relaxed">
                    Gaudeix d'enviament gratuït en totes les comandes superiors a <strong>50€</strong> a
                    Espanya i la Unió Europea. És la nostra manera de recompensar la confiança!
                  </p>
                </div>
              </div>
            </div>

            {/* Production Time */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-oswald text-[18pt] font-bold mb-2 text-blue-900">
                    Temps de Producció
                  </h3>
                  <p className="font-roboto text-[13pt] text-blue-800 leading-relaxed">
                    Els nostres productes es fabriquen <strong>sota demanda</strong> per evitar malbaratament.
                    Això significa que cada peça es crea específicament després de fer la comanda.
                    El temps de producció és de <strong>2-5 dies laborables</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Zones */}
            <h3 className="font-oswald text-[24pt] font-bold mb-6" style={{ color: '#141414' }}>
              Temps i Costos per Destinació
            </h3>

            <div className="space-y-4 mb-8">
              {shippingZones.map((zone, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#141414' }} />
                    <div className="flex-grow">
                      <h4 className="font-oswald text-[16pt] font-bold mb-2" style={{ color: '#141414' }}>
                        {zone.zone}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3 font-roboto text-[13pt] text-gray-700">
                        <div>
                          <span className="text-gray-500">Temps de lliurament:</span><br />
                          <strong>{zone.time}</strong>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost d'enviament:</span><br />
                          <strong>{zone.cost}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tracking */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#141414' }} />
                <div>
                  <h3 className="font-oswald text-[18pt] font-bold mb-2" style={{ color: '#141414' }}>
                    Seguiment de Comanda
                  </h3>
                  <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed mb-3">
                    Rebreu un correu amb el número de seguiment tan aviat com el paquet s'enviï.
                    Podreu veure l'estat de la comanda en temps real a través de l'enllaç proporcionat.
                  </p>
                  <p className="font-roboto text-[12pt] text-gray-600 italic">
                    Nota: El número de seguiment pot trigar 24-48h en activar-se al sistema del transportista.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Returns Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw className="w-8 h-8" style={{ color: '#141414' }} />
              <h2 className="font-oswald text-[32pt] font-bold" style={{ color: '#141414' }}>
                Devolucions i Canvis
              </h2>
            </div>

            {/* 14 Days Return */}
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-8">
              <h3 className="font-oswald text-[18pt] font-bold mb-2 text-yellow-900">
                Dret de Desistiment: 14 Dies
              </h3>
              <p className="font-roboto text-[13pt] text-yellow-800 leading-relaxed">
                Tens <strong>14 dies naturals</strong> des de la recepció del producte per tornar-lo
                sense necessitat de donar cap explicació, segons la normativa europea de protecció del consumidor.
              </p>
            </div>

            {/* Return Process */}
            <h3 className="font-oswald text-[24pt] font-bold mb-6" style={{ color: '#141414' }}>
              Com Fer una Devolució
            </h3>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: 1,
                  title: 'Contacta\'ns',
                  description: 'Envieu un correu a higginsgrafic@gmail.com amb el número de comanda i el motiu de la devolució (opcional).'
                },
                {
                  step: 2,
                  title: 'Prepara el Paquet',
                  description: 'El producte ha d\'estar en condicions originals: sense usar, amb etiquetes i en el seu embalatge original.'
                },
                {
                  step: 3,
                  title: 'Envia el Producte',
                  description: 'Us enviarem les instruccions d\'enviament. Els costos de devolució van a càrrec vostre (tret de defecte del producte).'
                },
                {
                  step: 4,
                  title: 'Reemborsament',
                  description: 'Un cop rebem i validem la devolució, procesarem el reemborsament en un màxim de 14 dies pel mateix mètode de pagament.'
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-oswald font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-oswald text-[16pt] font-bold mb-1" style={{ color: '#141414' }}>
                      {item.title}
                    </h4>
                    <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Exchange Policy */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="font-oswald text-[18pt] font-bold mb-3" style={{ color: '#141414' }}>
                Canvis de Talla
              </h3>
              <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed mb-3">
                Degut a la nostra producció sota demanda, no podem fer canvis directes. El procés és:
              </p>
              <ol className="font-roboto text-[13pt] text-gray-700 leading-relaxed space-y-2 ml-6">
                <li><strong>1.</strong> Tornar el producte seguint el procés de devolució</li>
                <li><strong>2.</strong> Fer una nova comanda amb la talla correcta</li>
              </ol>
              <p className="font-roboto text-[12pt] text-gray-600 mt-3 italic">
                Consell: Consulta la nostra Size Guide abans de comprar per evitar canvis de talla.
              </p>
            </div>

            {/* Defective Products */}
            <div className="bg-red-50 border-l-4 border-red-600 p-6">
              <h3 className="font-oswald text-[18pt] font-bold mb-2 text-red-900">
                Productes Defectuosos o Danys
              </h3>
              <p className="font-roboto text-[13pt] text-red-800 leading-relaxed mb-3">
                Si el producte arriba amb defectes de fabricació o danys durant el transport:
              </p>
              <ul className="font-roboto text-[13pt] text-red-800 leading-relaxed space-y-2 ml-6 mb-3">
                <li>• Contacta'ns en un <strong>màxim de 7 dies</strong> a higginsgrafic@gmail.com</li>
                <li>• Envia'ns fotos clares del defecte o dany</li>
                <li>• Us enviarem un <strong>reemplaçament gratuït</strong></li>
                <li>• NO cal que torneu el producte defectuós</li>
              </ul>
              <p className="font-roboto text-[13pt] text-red-800 leading-relaxed">
                Els costos d'enviament del reemplaçament van totalment a càrrec nostre. La satisfacció és la nostra prioritat.
              </p>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gray-900 text-white rounded-lg p-8 lg:p-12 text-center"
          >
            <h2 className="font-oswald text-[28pt] font-bold mb-4">
              Tens Alguna Pregunta?
            </h2>
            <p className="font-roboto text-[14pt] text-gray-300 mb-6 max-w-2xl mx-auto">
              Si tens qualsevol dubte sobre enviaments o devolucions, no dubtis en contactar-nos.
              Estem aquí per ajudar-te!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-100 transition-colors"
              >
                Contacta amb Nosaltres
              </a>
              <a
                href="/faq"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-white hover:text-gray-900 transition-colors"
              >
                Vegeu les FAQ
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default ShippingPage;
