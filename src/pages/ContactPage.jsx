import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Clock, MapPin } from 'lucide-react';
import SEO from '@/components/SEO';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    // Simulació d'enviament (després implementarem amb Netlify Forms o similar)
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setStatus('');
      }, 5000);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email General',
      detail: 'higginsgrafic@gmail.com',
      description: 'Per consultes generals i informació'
    },
    {
      icon: MessageSquare,
      title: 'Comandes',
      detail: 'higginsgrafic@gmail.com',
      description: 'Seguiment i preguntes sobre comandes'
    },
    {
      icon: MessageSquare,
      title: 'Devolucions',
      detail: 'higginsgrafic@gmail.com',
      description: 'Devolucions i canvis de productes'
    },
    {
      icon: Clock,
      title: 'Horari d\'Atenció',
      detail: 'Dilluns - Divendres',
      description: '9:00h - 18:00h (CET)'
    }
  ];

  return (
    <>
      <SEO
        title="Contacte | GRÀFIC"
        description="Contacta amb GRÀFIC. Estem aquí per ajudar-te amb qualsevol pregunta sobre els nostres productes, comandes o col·leccions. Resposta en 24-48h."
        keywords="contacte gràfic, atenció client, suport, preguntes, contactar marca"
        type="website"
        url="/contact"
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
                Contacte
              </h1>
              <p className="font-roboto text-[14pt] text-gray-300">
                Tens alguna pregunta? Estem aquí per ajudar-te
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-oswald text-[28pt] font-bold mb-6" style={{ color: '#141414' }}>
                Envia'ns un Missatge
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-roboto text-[12pt] font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto text-[13pt]"
                    placeholder="El teu nom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-roboto text-[12pt] font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto text-[13pt]"
                    placeholder="el-teu-email@exemple.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block font-roboto text-[12pt] font-medium text-gray-700 mb-2">
                    Assumpte *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto text-[13pt]"
                  >
                    <option value="">Selecciona un assumpte</option>
                    <option value="order">Pregunta sobre comanda</option>
                    <option value="product">Informació de producte</option>
                    <option value="shipping">Enviament i lliurament</option>
                    <option value="return">Devolució o canvi</option>
                    <option value="collaboration">Col·laboració</option>
                    <option value="other">Altres</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block font-roboto text-[12pt] font-medium text-gray-700 mb-2">
                    Missatge *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto text-[13pt] resize-none"
                    placeholder="Explica'ns com et podem ajudar..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-gray-900 text-white px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Enviant...' : 'Enviar Missatge'}
                </button>

                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <p className="font-roboto text-[13pt] text-green-800">
                      ✓ Missatge enviat correctament! Et respondrem en un màxim de 48 hores.
                    </p>
                  </motion.div>
                )}
              </form>

              <p className="font-roboto text-[11pt] text-gray-500 mt-4">
                * Camps obligatoris
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="font-oswald text-[28pt] font-bold mb-6" style={{ color: '#141414' }}>
                Altres Vies de Contacte
              </h2>

              <div className="space-y-6 mb-12">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6" style={{ color: '#141414' }} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-oswald text-[16pt] font-bold mb-1" style={{ color: '#141414' }}>
                          {method.title}
                        </h3>
                        <p className="font-roboto text-[13pt] font-medium text-gray-900 mb-1">
                          {method.detail}
                        </p>
                        <p className="font-roboto text-[12pt] text-gray-600">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Response Time */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
                <h3 className="font-oswald text-[18pt] font-bold mb-2" style={{ color: '#141414' }}>
                  Temps de Resposta
                </h3>
                <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed">
                  Ens comprometem a respondre totes les consultes en un <strong>màxim de 48 hores laborables</strong>.
                  Normalment responem molt abans! Si la teva pregunta és urgent, indica-ho a l'assumpte.
                </p>
              </div>

              {/* FAQ Link */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-oswald text-[18pt] font-bold mb-2" style={{ color: '#141414' }}>
                  Preguntes Freqüents
                </h3>
                <p className="font-roboto text-[13pt] text-gray-700 leading-relaxed mb-4">
                  Potser la teva pregunta ja té resposta! Consulta les nostres preguntes més freqüents.
                </p>
                <a
                  href="/faq"
                  className="inline-block bg-white border-2 border-gray-900 text-gray-900 px-6 py-2 rounded-lg font-roboto text-[13pt] font-medium hover:bg-gray-50 transition-colors"
                >
                  Veure FAQ
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactPage;
