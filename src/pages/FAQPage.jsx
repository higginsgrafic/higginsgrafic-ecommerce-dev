import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import SEO from '@/components/SEO';

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: 'Comandes i Pagament',
      questions: [
        {
          question: 'Quins mètodes de pagament accepteu?',
          answer: 'Acceptem targetes de crèdit i dèbit (Visa, Mastercard, American Express) a través de Stripe, una plataforma de pagament segura que compleix amb tots els estàndards de seguretat PCI DSS. No emmagatzemem les dades de la targeta als nostres servidors.'
        },
        {
          question: 'És segur comprar al vostre web?',
          answer: 'Sí, absolutament. Utilitzem certificat SSL (https) per encriptar totes les dades sensibles. Els pagaments es processen a través de Stripe, un dels processadors de pagament més segurs del món. Mai tenim accés a les dades completes de la targeta.'
        },
        {
          question: 'Puc cancel·lar la meva comanda?',
          answer: 'Podeu cancel·lar la comanda sense cost si encara no ha entrat en producció (normalment les primeres 24 hores). Contacteu-nos immediatament a higginsgrafic@gmail.com amb el número de comanda. Un cop el producte està en producció, no es pot cancel·lar, però podeu fer ús del dret de desistiment de 14 dies un cop el rebeu.'
        },
        {
          question: 'Rebré una factura?',
          answer: 'Sí, rebràs una factura electrònica per email un cop es processi el pagament. Si necessites una factura amb dades fiscals específiques (per a empreses), indica-ho al camp de notes durant el checkout.'
        }
      ]
    },
    {
      category: 'Enviaments',
      questions: [
        {
          question: 'Quant triga l\'enviament?',
          answer: 'Els temps de lliurament es componen de producció + enviament:\n\n• Producció: 2-5 dies laborables (els nostres productes es fabriquen sota demanda)\n• Enviament Espanya: 3-5 dies laborables\n• Enviament UE: 5-10 dies laborables\n• Enviament Internacional: 10-15 dies laborables\n\nRebreu un correu amb número de seguiment quan el paquet s\'enviï.'
        },
        {
          question: 'Quant costa l\'enviament?',
          answer: 'Els costos d\'enviament varien segons la destinació:\n\n• Espanya: GRATUÏT per comandes >50€, sinon 4,95€\n• Unió Europea: GRATUÏT per comandes >50€, sinon 6,95€\n• Internacional: Calculat al checkout segons destinació\n\nEl cost exacte es mostra sempre abans de finalitzar la comanda.'
        },
        {
          question: 'Envieu a tot el món?',
          answer: 'Enviem a la majoria de països del món a través de la nostra xarxa de producció global Gelato. Els costos i temps d\'enviament varien segons el país de destinació. Podeu veure el cost exacte introduint l\'adreça durant el checkout.'
        },
        {
          question: 'Puc fer seguiment de la meva comanda?',
          answer: 'Sí! Un cop el paquet s\'enviï, rebreu un correu amb un número de seguiment que permetrà veure exactament on és el paquet en tot moment. També podeu contactar-nos a higginsgrafic@gmail.com si teniu qualsevol dubte.'
        }
      ]
    },
    {
      category: 'Productes',
      questions: [
        {
          question: 'Quins materials utilitzeu?',
          answer: 'Utilitzem cotó orgànic certificat 100% en totes les nostres samarretes. Les tintes són ecològiques i lliures de substàncies tòxiques. Tots els nostres proveïdors compleixen amb certificacions de sostenibilitat i comerç just.'
        },
        {
          question: 'Com són les talles?',
          answer: 'Les nostres samarretes segueixen talles europees estàndard. Podeu consultar la guia de talles detallada amb mesures exactes a la pàgina de cada producte o a la secció Size Guide. En general, si teniu dubtes entre dues talles, recomanem la més gran per més comoditat.'
        },
        {
          question: 'Els dissenys es despinten amb els rentats?',
          answer: 'No! Utilitzem impressió DTG (Direct-to-Garment) d\'alta qualitat que penetra les fibres del cotó. Els dissenys estan fets per durar anys si segueixes les instruccions de cura (rentat a 30°C, del revés, sense assecadora). Oferim garantia de 2 anys contra defectes de fabricació.'
        },
        {
          question: 'Per què producció sota demanda?',
          answer: 'Produïm cada peça només quan algú la compra per evitar el malbaratament de la indústria de la moda tradicional. Això significa:\n\n• Zero estoc mort\n• Zero excés de producció\n• Menor petjada ecològica\n• Major frescor del producte\n\nÉs la forma més sostenible de fer roba.'
        }
      ]
    },
    {
      category: 'Devolucions i Canvis',
      questions: [
        {
          question: 'Puc tornar un producte si no m\'agrada?',
          answer: 'Sí, teniu 14 dies naturals des de la recepció per tornar qualsevol producte sense necessitat de justificació (dret de desistiment). El producte ha d\'estar en condicions originals: sense usar, amb etiquetes i en el seu embalatge original. Els costos d\'enviament de devolució van a càrrec vostre (tret que sigui per defecte del producte).'
        },
        {
          question: 'Com puc fer una devolució?',
          answer: 'Seguiu aquests passos:\n\n1. Envieu un correu a higginsgrafic@gmail.com amb el número de comanda\n2. Indiqueu quin producte voleu tornar i el motiu\n3. Us enviarem les instruccions de devolució\n4. Envieu el producte segons les instruccions\n5. Rebreu el reemborsament en 14 dies des que rebem la devolució\n\nEl reemborsament es farà pel mateix mètode de pagament utilitzat a la compra.'
        },
        {
          question: 'Puc canviar un producte per una altra talla?',
          answer: 'Per temes logístics de producció sota demanda, no fem canvis directes. El procés és:\n\n1. Tornar el producte que no encaixa (dret de desistiment)\n2. Fer una nova comanda amb la talla correcta\n\nPer agilitzar, podeu fer la nova comanda abans de tornar la primera. Contacteu-nos i us ajudarem amb el procés.'
        },
        {
          question: 'Què passa si el producte arriba defectuós?',
          answer: 'Si el producte arriba amb defectes de fabricació, danys durant el transport o error en la comanda:\n\n1. Contacta\'ns en un màxim de 7 dies a higginsgrafic@gmail.com\n2. Envia\'ns fotos clares del defecte/dany\n3. T\'enviarem un reemplaçament sense cap cost addicional\n4. NO cal que tornis el producte defectuós (tret que ho sol·licitem)\n\nEls costos d\'enviament i devolució van a càrrec nostre.'
        }
      ]
    },
    {
      category: 'Sostenibilitat',
      questions: [
        {
          question: 'Realment sou sostenibles?',
          answer: 'Sí, i ho podem demostrar:\n\n• Producció sota demanda = zero malbaratament\n• Cotó orgànic 100% certificat\n• Tintes ecològiques lliures de tòxics\n• Producció local quan és possible (menys transport)\n• Proveïdors certificats amb estàndards de sostenibilitat\n• Embalatges reciclables\n• Transparència total en tota la cadena de producció\n\nLa sostenibilitat no és màrqueting per nosaltres, és la base del negoci.'
        },
        {
          question: 'On es fabriquen els vostres productes?',
          answer: 'Treballem amb Gelato, una xarxa global de producció sota demanda. Quan fas una comanda, el producte es fabrica al centre de producció més proper a la teva adreça d\'enviament. Això redueix dràsticament les emissions de CO2 del transport i accelera els lliuraments. Tots els centres compleixen amb certificacions de qualitat i sostenibilitat.'
        }
      ]
    },
    {
      category: 'Compte i Privacitat',
      questions: [
        {
          question: 'Necessito crear un compte per comprar?',
          answer: 'No és obligatori! Podeu comprar com a convidat proporcionant només les dades necessàries per a l\'enviament i el pagament. No obstant això, crear un compte permet:\n\n• Seguir les comandes fàcilment\n• Guardar les adreces\n• Accedir a l\'historial de comandes\n• Rebre ofertes exclusives'
        },
        {
          question: 'Què feu amb les meves dades personals?',
          answer: 'Respectem totalment la privacitat. Només utilitzem les dades per:\n\n• Processar i enviar les comandes\n• Comunicar-nos sobre les compres\n• Millorar el servei\n• Enviar newsletters (si s\'ha donat consentiment)\n\nMAI venem o lloguem les dades a tercers. Podeu consultar tots els detalls a la nostra Política de Privacitat, que compleix amb el RGPD.'
        }
      ]
    }
  ];

  // Filtrar FAQs segons cerca
  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <>
      <SEO
        title="Preguntes Freqüents (FAQ) | GRÀFIC"
        description="Respostes a les preguntes més freqüents sobre comandes, enviaments, devolucions, productes i sostenibilitat de GRÀFIC. Troba respostes ràpides."
        keywords="faq gràfic, preguntes freqüents, ajuda, suport, comandes, enviaments, devolucions"
        type="website"
        url="/faq"
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
                Preguntes Freqüents
              </h1>
              <p className="font-roboto text-[14pt] text-gray-300">
                Troba respostes ràpides a les teves preguntes
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca en les preguntes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto text-[14pt]"
              />
            </div>
          </motion.div>

          {/* FAQs by Category */}
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * catIndex }}
                className="mb-12"
              >
                <h2 className="font-oswald text-[28pt] font-bold mb-6" style={{ color: '#141414' }}>
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, index) => {
                    const globalIndex = `${catIndex}-${index}`;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                      >
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                        >
                          <span className="font-roboto text-[14pt] font-medium text-gray-900 pr-4">
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed whitespace-pre-line">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="font-roboto text-[14pt] text-gray-600">
                No s'han trobat preguntes que coincideixin amb "{searchTerm}"
              </p>
            </div>
          )}

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 bg-gray-900 text-white rounded-lg p-8 lg:p-12 text-center"
          >
            <h2 className="font-oswald text-[28pt] font-bold mb-4">
              No trobes la teva resposta?
            </h2>
            <p className="font-roboto text-[14pt] text-gray-300 mb-6 max-w-2xl mx-auto">
              Si tens qualsevol pregunta que no aparegui aquí, no dubtis en contactar-nos.
              Estem aquí per ajudar-te!
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-100 transition-colors"
            >
              Contacta amb Nosaltres
            </a>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default FAQPage;
