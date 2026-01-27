import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Bell, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';
import ProductGrid from '@/components/ProductGrid';
import { useProductContext } from '@/contexts/ProductContext';

function NewPage() {
  const { products } = useProductContext();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtrar els productes més nous (últims 8 productes)
  const newProducts = products.slice(0, 8);

  return (
    <>
      <SEO
        title="Novetats | GRÀFIC"
        description="Descobreix els últims llançaments de GRÀFIC. Nous dissenys cada mes que exploren temes contemporanis de tecnologia, humanitat i futur."
        keywords="novetats gràfic, nous dissenys, últims llançaments, samarretes noves, col·leccions noves"
        type="website"
        url="/new"
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white pt-[129px] lg:pt-[145px] pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
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
                  <li className="text-white font-medium">Novetats</li>
                </ol>
              </nav>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-5 h-5" />
                <span className="font-roboto text-[12pt] font-medium">Acabat d'Arribar</span>
              </div>
              <h1 className="font-oswald text-[48pt] lg:text-[64pt] font-bold uppercase mb-6">
                Novetats
              </h1>
              <p className="font-roboto text-[16pt] lg:text-[18pt] text-white/90 max-w-3xl mx-auto">
                Els últims dissenys que acabem de llançar. Sigues el primer en descobrir-los.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-oswald text-[16pt] font-bold mb-1" style={{ color: '#141414' }}>
                    Llançaments Mensuals
                  </h3>
                  <p className="font-roboto text-[12pt] text-gray-600">
                    Nous dissenys cada mes
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-oswald text-[16pt] font-bold mb-1" style={{ color: '#141414' }}>
                    Edicions Limitades
                  </h3>
                  <p className="font-roboto text-[12pt] text-gray-600">
                    Alguns dissenys són exclusius
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-oswald text-[16pt] font-bold mb-1" style={{ color: '#141414' }}>
                    Notificacions
                  </h3>
                  <p className="font-roboto text-[12pt] text-gray-600">
                    Subscriu-te per rebre alertes
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-8 text-center" style={{ color: '#141414' }}>
              Últims Llançaments
            </h2>

            {newProducts.length > 0 ? (
              <ProductGrid products={newProducts} />
            ) : (
              <div className="text-center py-16">
                <p className="font-roboto text-[14pt] text-gray-600">
                  Aviat tindrem nous dissenys disponibles. Subscriu-te per ser el primer en saber-ho!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Bell className="w-16 h-16 mx-auto mb-6 text-blue-400" />
              <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-6">
                No Et Perdis Cap Novetat
              </h2>
              <p className="font-roboto text-[14pt] text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
                Subscriu-te al nostre butlletí i sigues el primer en conèixer els nous llançaments,
                ofertes exclusives i col·leccions especials.
              </p>

              <form className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="El teu email"
                    className="flex-grow px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 font-roboto text-[14pt]"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    Subscriu-te
                  </button>
                </div>
                <p className="font-roboto text-[11pt] text-gray-400 mt-4">
                  Ens comprometem a no enviar spam. Pots cancel·lar la subscripció en qualsevol moment.
                </p>
              </form>
            </motion.div>
          </div>
        </div>

        {/* CTA to Collections */}
        <div className="bg-white py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-6" style={{ color: '#141414' }}>
                Explora Totes les Col·leccions
              </h2>
              <p className="font-roboto text-[14pt] text-gray-700 leading-relaxed mb-8">
                Descobreix els cinc universos de GRÀFIC: First Contact, The Human Inside, Austen, Cube i Outcasted.
              </p>
              <Link
                to="/first-contact"
                className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-800 transition-colors"
              >
                Explorar Col·leccions
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewPage;
