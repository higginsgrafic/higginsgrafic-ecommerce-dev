import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Info, AlertCircle } from 'lucide-react';
import SEO from '@/components/SEO';

function SizeGuidePage() {
  const [unit, setUnit] = useState('cm'); // cm o inches

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sizeChartCm = [
    { size: 'S', chest: '94-97', length: '71', sleeve: '19' },
    { size: 'M', chest: '99-102', length: '74', sleeve: '20' },
    { size: 'L', chest: '104-107', length: '76', sleeve: '21' },
    { size: 'XL', chest: '109-112', length: '78', sleeve: '22' },
    { size: '2XL', chest: '114-117', length: '80', sleeve: '23' }
  ];

  const sizeChartInches = [
    { size: 'S', chest: '37-38', length: '28', sleeve: '7.5' },
    { size: 'M', chest: '39-40', length: '29', sleeve: '7.9' },
    { size: 'L', chest: '41-42', length: '30', sleeve: '8.3' },
    { size: 'XL', chest: '43-44', length: '31', sleeve: '8.7' },
    { size: '2XL', chest: '45-46', length: '31.5', sleeve: '9.1' }
  ];

  const sizeChart = unit === 'cm' ? sizeChartCm : sizeChartInches;

  const measurementTips = [
    {
      title: 'Pit (Chest)',
      description: 'Mesura al voltant de la part més ampla del pit, mantenint la cinta mètrica horitzontal.',
      image: '👕'
    },
    {
      title: 'Llargada (Length)',
      description: 'Mesura des del punt més alt de l\'espatlla fins a la vora inferior de la samarreta.',
      image: '📏'
    },
    {
      title: 'Màniga (Sleeve)',
      description: 'Mesura des del punt on la màniga es troba amb l\'espatlla fins a la vora de la màniga.',
      image: '📐'
    }
  ];

  const fitGuide = [
    {
      fit: 'Ajustada',
      description: 'Si vols un fit més ajustat al cos, tria la teva talla habitual.',
      recommendation: 'Talla habitual'
    },
    {
      fit: 'Relaxada',
      description: 'Si prefereixes una caiguda més còmoda i ampla, tria una talla més.',
      recommendation: 'Una talla més'
    },
    {
      fit: 'Oversize',
      description: 'Per un look oversized, tria dues talles més grans.',
      recommendation: 'Dues talles més'
    }
  ];

  return (
    <>
      <SEO
        title="Guia de Talles | GRÀFIC"
        description="Guia de talles de GRÀFIC. Taules de mesures detallades i consells per triar la talla perfecta per a les nostres samarretes. Talles S, M, L, XL, 2XL."
        keywords="guia talles gràfic, talles samarretes, mides, mesures, com triar talla"
        type="website"
        url="/sizing"
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
              <div className="flex items-center gap-3 mb-4">
                <Ruler className="w-10 h-10" />
                <h1 className="font-oswald text-[36pt] lg:text-[48pt] font-bold uppercase">
                  Guia de Talles
                </h1>
              </div>
              <p className="font-roboto text-[14pt] text-gray-300">
                Troba la teva talla perfecta amb les nostres mesures detallades
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {/* Important Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12"
          >
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-oswald text-[16pt] font-bold mb-2 text-blue-900">
                  Consell Important
                </h3>
                <p className="font-roboto text-[13pt] text-blue-800 leading-relaxed">
                  Les nostres samarretes segueixen <strong>talles europees estàndard</strong>.
                  Per assegurar-te que tries la talla correcta, et recomanem que prenguis mesures
                  d'una samarreta que t'encaixi bé i les comparis amb la nostra taula de talles.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Unit Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setUnit('cm')}
                className={`px-6 py-3 font-roboto text-[13pt] font-medium transition-colors ${
                  unit === 'cm'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Centímetres (cm)
              </button>
              <button
                onClick={() => setUnit('inches')}
                className={`px-6 py-3 font-roboto text-[13pt] font-medium transition-colors ${
                  unit === 'inches'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Polzades (in)
              </button>
            </div>
          </motion.div>

          {/* Size Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="font-oswald text-[28pt] font-bold mb-6" style={{ color: '#141414' }}>
              Taula de Talles
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-6 py-4 font-oswald text-[14pt] font-bold text-left">
                      TALLA
                    </th>
                    <th className="px-6 py-4 font-oswald text-[14pt] font-bold text-left">
                      PIT ({unit})
                    </th>
                    <th className="px-6 py-4 font-oswald text-[14pt] font-bold text-left">
                      LLARGADA ({unit})
                    </th>
                    <th className="px-6 py-4 font-oswald text-[14pt] font-bold text-left">
                      MÀNIGA ({unit})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-6 py-4 font-oswald text-[16pt] font-bold" style={{ color: '#141414' }}>
                        {row.size}
                      </td>
                      <td className="px-6 py-4 font-roboto text-[14pt] text-gray-700">
                        {row.chest}
                      </td>
                      <td className="px-6 py-4 font-roboto text-[14pt] text-gray-700">
                        {row.length}
                      </td>
                      <td className="px-6 py-4 font-roboto text-[14pt] text-gray-700">
                        {row.sleeve}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="font-roboto text-[11pt] text-gray-500 mt-4 italic">
              * Totes les mesures són aproximades i poden variar ±2{unit === 'cm' ? 'cm' : '"'}
            </p>
          </motion.div>

          {/* How to Measure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="font-oswald text-[28pt] font-bold mb-6" style={{ color: '#141414' }}>
              Com Prendre Mesures
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {measurementTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="text-4xl mb-4">{tip.image}</div>
                  <h3 className="font-oswald text-[16pt] font-bold mb-2" style={{ color: '#141414' }}>
                    {tip.title}
                  </h3>
                  <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mt-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-oswald text-[16pt] font-bold mb-2 text-yellow-900">
                    Consell Professional
                  </h3>
                  <p className="font-roboto text-[13pt] text-yellow-800 leading-relaxed">
                    La millor manera de triar la talla correcta és comparar amb una samarreta que
                    ja tens i que t'encaixi perfectament. Col·loca-la plana sobre una superfície i
                    pren les mesures de pit, llargada i màniga. Després compara amb la nostra taula.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fit Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="font-oswald text-[28pt] font-bold mb-6" style={{ color: '#141414' }}>
              Tipus de Caiguda
            </h2>

            <div className="space-y-4">
              {fitGuide.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="font-oswald text-[18pt] font-bold mb-2" style={{ color: '#141414' }}>
                        {item.fit}
                      </h3>
                      <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="md:text-right flex-shrink-0">
                      <span className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg font-roboto text-[12pt] font-medium">
                        {item.recommendation}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Material Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-16"
          >
            <h2 className="font-oswald text-[28pt] font-bold mb-6" style={{ color: '#141414' }}>
              Material i Cura
            </h2>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-oswald text-[16pt] font-bold mb-2" style={{ color: '#141414' }}>
                    Composició
                  </h3>
                  <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed">
                    100% Cotó Orgànic Certificat | 180 g/m² (qualitat premium)
                  </p>
                </div>

                <div>
                  <h3 className="font-oswald text-[16pt] font-bold mb-2" style={{ color: '#141414' }}>
                    Instruccions de Rentat
                  </h3>
                  <ul className="font-roboto text-[13pt] text-gray-700 leading-relaxed space-y-2">
                    <li>• Rentar a 30°C màxim</li>
                    <li>• Rentar del revés per protegir el disseny</li>
                    <li>• No utilitzar assecadora</li>
                    <li>• Planxar del revés a temperatura mitjana</li>
                    <li>• No utilitzar lleixiu</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-oswald text-[16pt] font-bold mb-2" style={{ color: '#141414' }}>
                    Encongiment
                  </h3>
                  <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed">
                    El cotó orgànic pot encongir lleugerament (2-3%) després del primer rentat.
                    Les mesures de la taula són post-rentat. Segueix les instruccions de cura
                    per mantenir la qualitat i mesures de la samarreta.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gray-900 text-white rounded-lg p-8 lg:p-12 text-center"
          >
            <h2 className="font-oswald text-[28pt] font-bold mb-4">
              Encara tens Dubtes sobre la Talla?
            </h2>
            <p className="font-roboto text-[14pt] text-gray-300 mb-6 max-w-2xl mx-auto">
              Si no estàs segur/a de quina talla triar, contacta'ns i t'ajudarem a trobar
              la teva talla perfecta. És millor preguntar abans que haver de fer un canvi després!
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
                Veure FAQ
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default SizeGuidePage;
