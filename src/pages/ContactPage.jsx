import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Clock, MapPin } from 'lucide-react';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    orderNumber: '',
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
      setFormData({ name: '', orderNumber: '', email: '', subject: '', message: '' });

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

      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md pt-[129px] lg:pt-[145px]">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'Contacte' }]} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-oswald text-[28pt] font-bold mb-6 text-center" style={{ color: '#141414' }}>
              Contacte
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block font-roboto text-[12pt] font-medium text-gray-700 mb-2">
                      Nom *
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
                    <label htmlFor="orderNumber" className="block font-roboto text-[12pt] font-medium text-gray-700 mb-2">
                      Número de comanda
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto text-[13pt]"
                      placeholder="Opcional"
                    />
                  </div>
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
        </div>
      </div>
    </>
  );
}

export default ContactPage;
