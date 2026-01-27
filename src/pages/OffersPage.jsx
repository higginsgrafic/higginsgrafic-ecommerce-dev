import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function OffersPage() {
  return (
    <>
      <Helmet>
        <title>Enviament Gratuït | GRÀFIC</title>
        <meta name="description" content="Aprofita el nostre enviament gratuït en totes les comandes. Sense mínims, sense sorpreses." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-500 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-[129px] lg:pt-[145px] pb-16 sm:pb-20 md:pb-24">
            {/* Breadcrumbs - en blanc sobre fons gradient */}
            <div className="mb-8">
              <nav className="mb-0">
                <ol className="flex items-center space-x-2 text-sm uppercase">
                  <li>
                    <Link to="/" className="text-white/70 hover:text-white transition-colors">
                      Inici
                    </Link>
                  </li>
                  <span className="text-white/50">›</span>
                  <li className="text-white font-medium">Ofertes</li>
                </ol>
              </nav>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="font-oswald text-4xl sm:text-5xl md:text-6xl font-bold uppercase mb-4 sm:mb-6">
                Enviament Gratuït
              </h1>
              <p className="font-roboto text-lg sm:text-xl md:text-2xl font-light max-w-3xl mx-auto opacity-95">
                A GRÀFIC, creiem que l'art ha de ser accessible per a tothom. Per això, oferim enviament gratuït en totes les comandes.
              </p>
            </motion.div>
          </div>
          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-red-500"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-oswald text-2xl sm:text-3xl font-semibold mb-3 text-gray-900">Sense Mínims</h2>
              <p className="font-roboto text-base sm:text-lg text-gray-700 leading-relaxed">
                No importa si compres una samarreta o deu. L'enviament sempre és gratuït, sense excepcions ni condicions ocultes.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-orange-500"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h2 className="font-oswald text-2xl sm:text-3xl font-semibold mb-3 text-gray-900">Arreu d'Europa</h2>
              <p className="font-roboto text-base sm:text-lg text-gray-700 leading-relaxed">
                Enviem a tot Europa amb els millors serveis de missatgeria. Normalment reps la teva comanda entre 3-7 dies laborables.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-yellow-500"
            >
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="font-oswald text-2xl sm:text-3xl font-semibold mb-3 text-gray-900">Seguiment Complet</h2>
              <p className="font-roboto text-base sm:text-lg text-gray-700 leading-relaxed">
                Rebràs un número de seguiment per rastrejar el teu paquet en temps real des del moment en què surt del nostre magatzem.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-green-500"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h2 className="font-oswald text-2xl sm:text-3xl font-semibold mb-3 text-gray-900">Embalatge Sostenible</h2>
              <p className="font-roboto text-base sm:text-lg text-gray-700 leading-relaxed">
                Utilitzem materials reciclats i reciclables per embalar les teves comandes. Cuidem el planeta mentre et portem art a casa.
              </p>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 text-center text-white"
          >
            <h2 className="font-oswald text-3xl sm:text-4xl font-bold uppercase mb-4">Comença a Comprar Ara</h2>
            <p className="font-roboto text-lg sm:text-xl font-light mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90">
              Descobreix les nostres col·leccions exclusives amb enviament gratuït inclòs. Sense sorpreses, només art.
            </p>
            <Link
              to="/first-contact"
              className="inline-block bg-white text-gray-900 font-oswald text-lg sm:text-xl font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
            >
              Explorar Col·leccions
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
}

export default OffersPage;
