import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe, Leaf, Users, Lightbulb, Target } from 'lucide-react';
import SEO from '@/components/SEO';

function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: Heart,
      title: 'Autenticitat',
      description: 'Creem dissenys amb missatge que reflecteixen qui som realment. Sense filtres, sense màscares.'
    },
    {
      icon: Globe,
      title: 'Sostenibilitat',
      description: 'Producció sota demanda per evitar residus. Cada peça es fabrica només quan es demana.'
    },
    {
      icon: Leaf,
      title: 'Qualitat',
      description: 'Materials orgànics i processos certificats. La qualitat és el nostre compromís.'
    },
    {
      icon: Users,
      title: 'Comunitat',
      description: 'Som una comunitat de persones que pensen diferent i no tenen por de mostrar-ho.'
    },
    {
      icon: Lightbulb,
      title: 'Creativitat',
      description: 'Cada col·lecció neix d\'una idea, una reflexió, una provocació. Art portable.'
    },
    {
      icon: Target,
      title: 'Transparència',
      description: 'Sabreu d\'on ve la samarreta, qui la fa i com es produeix. Total transparència.'
    }
  ];

  const collections = [
    {
      name: 'First Contact',
      tagline: 'Only you understand everything this journey entails.',
      description: 'Una reflexió sobre els viatges interiors que només coneixeu. Sobre els camins que es prenen sense que ningú més ho vegi.'
    },
    {
      name: 'The Human Inside',
      tagline: 'In the deepest, darkest corner rests your hero.',
      description: 'L\'heroi interior viu en els racons més foscos. Allà on pocs s\'atreveixen a mirar és on es troba la força.'
    },
    {
      name: 'Austen',
      tagline: 'I hate to hear you talk about women as if they were irrational simpletons.',
      description: 'Homenatge a Jane Austen i a totes les dones que han lluitat per ser escolades, no silenciades.'
    },
    {
      name: 'Cube',
      tagline: 'Deep down, we are all strangers to our own eyes.',
      description: 'Som éssers complexos, multidimensionals. El que veus a fora no és mai tota la història.'
    },
    {
      name: 'Outcasted',
      tagline: 'As they say, better alone than in bad company.',
      description: 'Per als qui prefereixen la solitud autèntica abans que la companyia falsa. Per als inadaptats orgullosos.'
    }
  ];

  return (
    <>
      <SEO
        title="Sobre Nosaltres | GRÀFIC"
        description="Descobreix la història de GRÀFIC, una marca de roba amb missatge. Creem samarretes amb dissenys que provoquen, inspiren i fan pensar. Producció sostenible sota demanda."
        keywords="sobre gràfic, marca catalana, roba amb missatge, sostenibilitat, ciència-ficció, art conceptual, producció sostenible"
        type="website"
        url="/about"
      />

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <div className="bg-gray-900 text-white py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="font-oswald text-[48pt] lg:text-[64pt] font-bold uppercase mb-6">
                GRÀFIC
              </h1>
              <p className="font-roboto text-[16pt] lg:text-[18pt] text-gray-300 max-w-2xl mx-auto">
                Roba amb missatge per a persones que pensen diferent
              </p>
            </motion.div>
          </div>
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-8" style={{ color: '#141414' }}>
              La Nostra Història
            </h2>

            <div className="space-y-6 font-roboto text-[14pt] text-gray-700 leading-relaxed">
              <p>
                GRÀFIC va néixer d'una pregunta simple: <strong>Per què la roba ha de ser només roba?</strong>
              </p>

              <p>
                En un món saturat d'imatges buides i missatges superficials, vam decidir crear alguna cosa
                diferent. Alguna cosa que fes pensar. Alguna cosa que provoqués converses. Alguna cosa que
                digués més que mil paraules.
              </p>

              <p>
                No som una marca de moda convencional. Som una plataforma d'expressió. Cada disseny que
                creem porta un missatge, una reflexió, una provocació. Perquè creiem que el que portes
                a sobre pot dir molt de qui ets a dins.
              </p>

              <p>
                Treballem amb producció sota demanda perquè <strong>no creiem en el malbaratament</strong>.
                Cada samarreta es fabrica només quan algú la demana, amb materials orgànics i processos
                certificats. Sostenibilitat no és un extra, és la base.
              </p>

              <p>
                Les nostres col·leccions exploren temes que importen: identitat, feminisme, solitud triada,
                viatges interiors, la complexitat humana. <strong>No tenim por de les converses incòmodes.</strong>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-4" style={{ color: '#141414' }}>
                Els Nostres Valors
              </h2>
              <p className="font-roboto text-[14pt] text-gray-600 max-w-2xl mx-auto">
                Sis principis que guien tot el que fem
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Icon className="w-12 h-12 mb-4" style={{ color: '#141414' }} />
                    <h3 className="font-oswald text-[20pt] font-bold mb-3" style={{ color: '#141414' }}>
                      {value.title}
                    </h3>
                    <p className="font-roboto text-[13pt] text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Collections Philosophy */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-12" style={{ color: '#141414' }}>
              Les Nostres Col·leccions
            </h2>

            <div className="space-y-10">
              {collections.map((collection, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="border-l-4 border-gray-900 pl-6"
                >
                  <h3 className="font-oswald text-[24pt] font-bold mb-2" style={{ color: '#141414' }}>
                    {collection.name}
                  </h3>
                  <p className="font-roboto text-[12pt] text-gray-500 italic mb-3">
                    "{collection.tagline}"
                  </p>
                  <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed">
                    {collection.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sustainability */}
        <div className="bg-gray-900 text-white py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <Leaf className="w-16 h-16 mx-auto mb-6" />
              <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-6">
                Compromís Sostenible
              </h2>
              <div className="space-y-4 font-roboto text-[14pt] text-gray-300 leading-relaxed max-w-2xl mx-auto">
                <p>
                  <strong className="text-white">Producció sota demanda:</strong> Zero estoc, zero residus.
                  Cada peça es fabrica només quan algú la compra.
                </p>
                <p>
                  <strong className="text-white">Materials orgànics:</strong> Cotó orgànic certificat,
                  tintes ecològiques, processos respectuosos amb el medi ambient.
                </p>
                <p>
                  <strong className="text-white">Transparència total:</strong> Sabràs exactament d'on ve
                  la teva samarreta i com s'ha fet.
                </p>
                <p>
                  <strong className="text-white">Qualitat duradora:</strong> Roba feta per durar anys,
                  no temporades. Menys consum, més valor.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Join Us */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-16 lg:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-6" style={{ color: '#141414' }}>
              Uneix-te a la Conversa
            </h2>
            <p className="font-roboto text-[14pt] text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
              GRÀFIC és més que roba. És una comunitat de persones que no tenen por de pensar diferent,
              de qüestionar, de provocar converses. Si això ressona, benvingut/da a casa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/first-contact"
                className="bg-gray-900 text-white px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-800 transition-colors"
              >
                Explora les Col·leccions
              </a>
              <a
                href="/contact"
                className="bg-white border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-50 transition-colors"
              >
                Contacta amb Nosaltres
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
