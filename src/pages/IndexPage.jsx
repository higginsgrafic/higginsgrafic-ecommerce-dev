import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Save, RotateCcw, FileText, Folder, File } from 'lucide-react';
import SEO from '@/components/SEO';
import { ca } from '@/i18n/ca';
import * as Tabs from '@radix-ui/react-tabs';

export default function IndexPage() {
  const [texts, setTexts] = useState(ca);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('siteTexts');
    if (saved) {
      try {
        setTexts(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved texts:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('siteTexts', JSON.stringify(texts));
    setHasChanges(false);
    window.location.reload();
  };

  const handleReset = () => {
    if (window.confirm('Segur que vols restaurar els textos originals?')) {
      localStorage.removeItem('siteTexts');
      setTexts(ca);
      setHasChanges(false);
    }
  };

  const updateText = (path, value) => {
    const keys = path.split('.');
    const newTexts = JSON.parse(JSON.stringify(texts));
    let current = newTexts;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setTexts(newTexts);
    setHasChanges(true);
  };

  const pageTree = {
    publiques: {
      label: 'Pàgines Públiques',
      items: [
        { label: 'Home', path: '/', status: '✓ Activa' },
        {
          label: 'Col·leccions',
          isFolder: true,
          items: [
            { label: 'First Contact', path: '/first-contact', status: '✓ Activa' },
            { label: 'The Human Inside', path: '/the-human-inside', status: '⚠ Arxiu existeix, ruta NO definida' },
            { label: 'Austen', path: '/austen', status: '⚠ Arxiu existeix, ruta NO definida' },
            { label: 'Cube', path: '/cube', status: '⚠ Arxiu existeix, ruta NO definida' },
            { label: 'Outcasted', path: '/outcasted', status: '⚠ Arxiu existeix, ruta NO definida' }
          ]
        },
        { label: 'Grafic / Higgins Grafic', path: '/higginsgrafic', status: '⚠ Arxiu existeix (GraficPage), ruta NO definida' },
        { label: 'Detall de producte', path: '/product/:id', status: '✓ Activa' },
        { label: 'Detall de producte (Enhanced)', path: '/fulfillment/:id', status: '✓ Activa (ProductDetailPageEnhanced)' },
        { label: 'Detall producte Gelato', path: '/gelato-product/:id', status: '⚠ Comentada a App.jsx' },
        { label: 'Cerca', path: '/search', status: '✓ Activa' },
        { label: 'Cistell', path: '/cart', status: '✓ Activa' },
        { label: 'Llista de desitjos', path: '/wishlist', status: '✓ Activa' },
        { label: 'Perfil', path: '/profile', status: '✓ Activa' },
        { label: 'Checkout', path: '/checkout', status: '✓ Activa' },
        { label: 'Confirmació de comanda', path: '/order-confirmation/:orderId', status: '✓ Activa' }
      ]
    },
    informacio: {
      label: 'Informació i Serveis',
      items: [
        { label: 'Sobre nosaltres', path: '/about', status: '✓ Activa' },
        { label: 'Contacte', path: '/contact', status: '✓ Activa' },
        { label: 'FAQ', path: '/faq', status: '✓ Activa' },
        { label: 'Enviaments', path: '/shipping', status: '✓ Activa' },
        { label: 'Guia de talles', path: '/sizing', status: '✓ Activa' },
        { label: 'Privacitat', path: '/privacy', status: '✓ Activa' },
        { label: 'Termes', path: '/terms', status: '✓ Activa' },
        { label: 'Creative Commons', path: '/cc', status: '✓ Activa' },
        { label: 'Ofertes', path: '/offers', status: '✓ Activa' },
        { label: 'Novetats', path: '/new', status: '✓ Activa' },
        { label: 'Estat de comanda', path: '/status', status: '✓ Activa' },
        { label: 'Seguiment', path: '/track', status: '✓ Activa' }
      ]
    },
    admin: {
      label: "Pàgines d'Administració",
      items: [
        { label: 'Admin Login', path: '/admin-login', status: '✓ Activa' },
        { label: 'Admin Dashboard', path: '/admin', status: '✓ Activa' },
        { label: 'Índex de Textos', path: '/index', status: '✓ Activa' },
        { label: 'Configuració Hero', path: '/hero-settings', status: '✓ Activa' },
        { label: 'Configuració Col·leccions', path: '/colleccio-settings', status: '✓ Activa' },
        { label: 'Gestor de Promocions', path: '/promotions', status: '✓ Activa' },
        { label: 'Configuració EC', path: '/ec-config', status: '✓ Activa' },
        { label: 'Missatges del Sistema', path: '/system-messages', status: '✓ Activa' },
        { label: 'Gestor de Mitjans', path: '/admin/media', status: '✓ Activa' },
        { label: 'Fulfillment (llista)', path: '/fulfillment', status: '✓ Activa' },
        { label: 'Fulfillment (detall)', path: '/fulfillment/:id', status: '✓ Activa' },
        { label: "Selector d'Icones", path: '/user-icon-picker', status: '✓ Activa' }
      ]
    },
    especials: {
      label: 'Pàgines Especials',
      items: [
        { label: 'Previsualització EC', path: '/ec-preview-lite', status: '✓ Activa' },
        { label: 'Pàgina no trobada (404)', path: '*', status: '✓ Activa' }
      ]
    },
    deshabilitades: {
      label: 'Pàgines Deshabilitades / No Usades',
      items: [
        { label: 'Diagnostic', path: '/diagnostic', status: '⚠ Comentada a App.jsx' },
        { label: 'Component Showcase', path: '/components', status: '⚠ Comentada a App.jsx' },
        { label: 'Apps Page', path: '—', status: '✗ Arxiu existeix, NO té ruta' },
        { label: 'Documentation Page', path: '—', status: '✗ Arxiu existeix, NO té ruta' },
        { label: 'Generic Page', path: '—', status: '✗ Arxiu existeix, NO té ruta' },
        { label: 'Fulfillment Page Simple', path: '—', status: '✗ Arxiu existeix, NO s\'usa com a ruta' },
        { label: 'Product Fulfillment Detail Page', path: '—', status: '✗ Arxiu existeix, NO s\'usa (deprecated per ProductDetailPageEnhanced)' }
      ]
    }
  };

  const TextInput = ({ label, path, value }) => (
    <div className="flex items-start gap-2 py-1.5">
      <label className="text-xs text-gray-600 w-32 flex-shrink-0 pt-1.5">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => updateText(path, e.target.value)}
        className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );

  const SectionTitle = ({ children }) => (
    <h3 className="text-sm font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">{children}</h3>
  );

  const Column = ({ children, className = '' }) => (
    <div className={`space-y-3 ${className}`}>{children}</div>
  );

  const MainSectionTitle = ({ children }) => (
    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-300">{children}</h2>
  );

  const sections = {
    paginas: {
      title: 'Pàgines',
      render: () => (
        <div className="space-y-4">
          {Object.entries(pageTree).map(([key, category]) => (
            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{category.label}</span>
                  <span className="text-xs text-gray-500">({category.items.length})</span>
                </div>
              </div>
              <div className="p-3 bg-white space-y-1">
                {category.items.map((item, index) => (
                  item.isFolder ? (
                    <div key={index} className="ml-6 space-y-1">
                      <div className="flex items-center gap-2 py-1.5 text-sm font-medium text-gray-700">
                        <Folder className="w-4 h-4 text-amber-600" />
                        <span>{item.label}</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.items.map((subItem, subIndex) => (
                          <div key={subIndex} className="flex items-center gap-2 py-1 text-sm text-gray-600 hover:text-gray-900">
                            <File className="w-4 h-4 text-gray-400" />
                            <span className="flex-1">{subItem.label}</span>
                            {subItem.status && (
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                subItem.status.startsWith('✓') ? 'bg-green-50 text-green-700' :
                                subItem.status.startsWith('⚠') ? 'bg-yellow-50 text-yellow-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {subItem.status}
                              </span>
                            )}
                            {subItem.path && subItem.path !== '—' && (
                              <Link
                                to={subItem.path}
                                className="text-xs bg-gray-100 px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors font-mono"
                              >
                                {subItem.path}
                              </Link>
                            )}
                            {subItem.path === '—' && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">
                                —
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="flex items-center gap-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 ml-6">
                      <File className="w-4 h-4 text-gray-400" />
                      <span className="flex-1">{item.label}</span>
                      {item.status && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          item.status.startsWith('✓') ? 'bg-green-50 text-green-700' :
                          item.status.startsWith('⚠') ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      )}
                      {item.path && item.path !== '—' && (
                        <Link
                          to={item.path}
                          className="text-xs bg-gray-100 px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors font-mono"
                        >
                          {item.path}
                        </Link>
                      )}
                      {item.path === '—' && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">
                          —
                        </span>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
    offers: {
      title: 'Ofertes Header',
      render: () => (
        <div className="grid grid-cols-2 gap-6">
          <Column>
            <SectionTitle>Textos</SectionTitle>
            <TextInput label="Enviament gratuït" path="offersHeader.freeShipping" value={texts.offersHeader.freeShipping} />
            <TextInput label="Tema WP llest" path="offersHeader.wpThemeReady" value={texts.offersHeader.wpThemeReady} />
          </Column>
          <Column>
            <SectionTitle>Botons</SectionTitle>
            <TextInput label="Descarregar tema" path="offersHeader.downloadTheme" value={texts.offersHeader.downloadTheme} />
            <TextInput label="Més info" path="offersHeader.moreInfo" value={texts.offersHeader.moreInfo} />
          </Column>
        </div>
      )
    },
    header: {
      title: 'Capçalera',
      render: () => (
        <div className="grid grid-cols-2 gap-6">
          <Column>
            <SectionTitle>Navegació</SectionTitle>
            <TextInput label="First Contact" path="header.navigation.firstContact" value={texts.header.navigation.firstContact} />
            <TextInput label="The Human Inside" path="header.navigation.theHumanInside" value={texts.header.navigation.theHumanInside} />
            <TextInput label="Austen" path="header.navigation.austen" value={texts.header.navigation.austen} />
          </Column>
          <Column>
            <SectionTitle>Cistell</SectionTitle>
            <TextInput label="Alt (ple)" path="header.cart.altFull" value={texts.header.cart.altFull} />
            <TextInput label="Alt (buit)" path="header.cart.altEmpty" value={texts.header.cart.altEmpty} />
            <TextInput label="SR only" path="header.cart.srOnly" value={texts.header.cart.srOnly} />
          </Column>
        </div>
      )
    },
    hero: {
      title: 'Hero',
      render: () => (
        <div className="grid grid-cols-2 gap-6">
          <Column>
            <SectionTitle>First Contact</SectionTitle>
            <TextInput label="Títol" path="hero.slides.firstContact.title" value={texts.hero.slides.firstContact.title} />
            <TextInput label="Subtítol" path="hero.slides.firstContact.subtitle" value={texts.hero.slides.firstContact.subtitle} />

            <SectionTitle>The Human Inside</SectionTitle>
            <TextInput label="Títol" path="hero.slides.theHumanInside.title" value={texts.hero.slides.theHumanInside.title} />
            <TextInput label="Subtítol" path="hero.slides.theHumanInside.subtitle" value={texts.hero.slides.theHumanInside.subtitle} />

            <SectionTitle>Austen</SectionTitle>
            <TextInput label="Títol" path="hero.slides.austen.title" value={texts.hero.slides.austen.title} />
            <TextInput label="Subtítol" path="hero.slides.austen.subtitle" value={texts.hero.slides.austen.subtitle} />
          </Column>
          <Column>
            <SectionTitle>Cube</SectionTitle>
            <TextInput label="Títol" path="hero.slides.cube.title" value={texts.hero.slides.cube.title} />
            <TextInput label="Subtítol" path="hero.slides.cube.subtitle" value={texts.hero.slides.cube.subtitle} />

            <SectionTitle>Outcasted</SectionTitle>
            <TextInput label="Títol" path="hero.slides.outcasted.title" value={texts.hero.slides.outcasted.title} />
            <TextInput label="Subtítol" path="hero.slides.outcasted.subtitle" value={texts.hero.slides.outcasted.subtitle} />
          </Column>
        </div>
      )
    },
    home: {
      title: 'Inici',
      render: () => (
        <div className="grid grid-cols-2 gap-6">
          <Column>
            <SectionTitle>SEO</SectionTitle>
            <TextInput label="Títol" path="home.seo.title" value={texts.home.seo.title} />
            <TextInput label="Descripció" path="home.seo.description" value={texts.home.seo.description} />
          </Column>
          <Column>
            <SectionTitle>Seccions</SectionTitle>
            <TextInput label="First Contact" path="home.sections.firstContactDesc" value={texts.home.sections.firstContactDesc} />
            <TextInput label="The Human Inside" path="home.sections.theHumanInsideDesc" value={texts.home.sections.theHumanInsideDesc} />
            <TextInput label="Austen" path="home.sections.austenDesc" value={texts.home.sections.austenDesc} />
            <TextInput label="Cube" path="home.sections.cubeDesc" value={texts.home.sections.cubeDesc} />
            <TextInput label="Outcasted" path="home.sections.outcastedDesc" value={texts.home.sections.outcastedDesc} />
          </Column>
        </div>
      )
    },
    collections: {
      title: 'Col·leccions',
      render: () => (
        <div className="grid grid-cols-2 gap-6">
          <Column>
            <SectionTitle>First Contact</SectionTitle>
            <TextInput label="SEO Títol" path="collections.firstContact.seo.title" value={texts.collections.firstContact.seo.title} />
            <TextInput label="SEO Desc" path="collections.firstContact.seo.description" value={texts.collections.firstContact.seo.description} />
            <TextInput label="Títol" path="collections.firstContact.title" value={texts.collections.firstContact.title} />
            <TextInput label="Descripció" path="collections.firstContact.description" value={texts.collections.firstContact.description} />

            <SectionTitle>The Human Inside</SectionTitle>
            <TextInput label="SEO Títol" path="collections.theHumanInside.seo.title" value={texts.collections.theHumanInside.seo.title} />
            <TextInput label="SEO Desc" path="collections.theHumanInside.seo.description" value={texts.collections.theHumanInside.seo.description} />
            <TextInput label="Títol" path="collections.theHumanInside.title" value={texts.collections.theHumanInside.title} />
            <TextInput label="Descripció" path="collections.theHumanInside.description" value={texts.collections.theHumanInside.description} />

            <SectionTitle>Austen</SectionTitle>
            <TextInput label="SEO Títol" path="collections.austen.seo.title" value={texts.collections.austen.seo.title} />
            <TextInput label="SEO Desc" path="collections.austen.seo.description" value={texts.collections.austen.seo.description} />
            <TextInput label="Títol" path="collections.austen.title" value={texts.collections.austen.title} />
            <TextInput label="Descripció" path="collections.austen.description" value={texts.collections.austen.description} />
          </Column>
          <Column>
            <SectionTitle>Cube</SectionTitle>
            <TextInput label="SEO Títol" path="collections.cube.seo.title" value={texts.collections.cube.seo.title} />
            <TextInput label="SEO Desc" path="collections.cube.seo.description" value={texts.collections.cube.seo.description} />
            <TextInput label="Títol" path="collections.cube.title" value={texts.collections.cube.title} />
            <TextInput label="Descripció" path="collections.cube.description" value={texts.collections.cube.description} />

            <SectionTitle>Outcasted</SectionTitle>
            <TextInput label="SEO Títol" path="collections.outcasted.seo.title" value={texts.collections.outcasted.seo.title} />
            <TextInput label="SEO Desc" path="collections.outcasted.seo.description" value={texts.collections.outcasted.seo.description} />
            <TextInput label="Títol" path="collections.outcasted.title" value={texts.collections.outcasted.title} />
            <TextInput label="Descripció" path="collections.outcasted.description" value={texts.collections.outcasted.description} />
          </Column>
        </div>
      )
    },
    pagesContent: {
      title: 'Contingut de Pàgines',
      render: () => (
        <div className="space-y-8">
          <div className="border-l-4 border-blue-500 pl-6">
            <MainSectionTitle>Sobre Nosaltres</MainSectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Títol" path="pages.about.title" value={texts.pages.about.title} />
              <TextInput label="Contingut" path="pages.about.content" value={texts.pages.about.content} multiline />
              <TextInput label="Secció 1" path="pages.about.section1" value={texts.pages.about.section1} multiline />
              <TextInput label="Secció 2" path="pages.about.section2" value={texts.pages.about.section2} multiline />
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <MainSectionTitle>Contacte</MainSectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Títol" path="pages.contact.title" value={texts.pages.contact.title} />
              <TextInput label="Contingut" path="pages.contact.content" value={texts.pages.contact.content} multiline />
              <TextInput label="Email" path="pages.contact.email" value={texts.pages.contact.email} />
              <TextInput label="Telèfon" path="pages.contact.phone" value={texts.pages.contact.phone} />
              <TextInput label="Horari" path="pages.contact.hours" value={texts.pages.contact.hours} />
              <TextInput label="Resposta" path="pages.contact.response" value={texts.pages.contact.response} />
            </div>
          </div>

          <div className="border-l-4 border-yellow-500 pl-6">
            <MainSectionTitle>FAQ</MainSectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Títol" path="pages.faq.title" value={texts.pages.faq.title} />
              <TextInput label="Contingut" path="pages.faq.content" value={texts.pages.faq.content} multiline />

              <SectionTitle>Pregunta 1</SectionTitle>
              <TextInput label="Pregunta" path="pages.faq.q1.question" value={texts.pages.faq.q1.question} />
              <TextInput label="Resposta" path="pages.faq.q1.answer" value={texts.pages.faq.q1.answer} multiline />

              <SectionTitle>Pregunta 2</SectionTitle>
              <TextInput label="Pregunta" path="pages.faq.q2.question" value={texts.pages.faq.q2.question} />
              <TextInput label="Resposta" path="pages.faq.q2.answer" value={texts.pages.faq.q2.answer} multiline />

              <SectionTitle>Pregunta 3</SectionTitle>
              <TextInput label="Pregunta" path="pages.faq.q3.question" value={texts.pages.faq.q3.question} />
              <TextInput label="Resposta" path="pages.faq.q3.answer" value={texts.pages.faq.q3.answer} multiline />

              <SectionTitle>Pregunta 4</SectionTitle>
              <TextInput label="Pregunta" path="pages.faq.q4.question" value={texts.pages.faq.q4.question} />
              <TextInput label="Resposta" path="pages.faq.q4.answer" value={texts.pages.faq.q4.answer} multiline />
            </div>
          </div>

          <div className="border-l-4 border-red-500 pl-6">
            <MainSectionTitle>Termes i Condicions</MainSectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Títol" path="pages.terms.title" value={texts.pages.terms.title} />
              <TextInput label="Contingut" path="pages.terms.content" value={texts.pages.terms.content} multiline />
              <TextInput label="Acceptació" path="pages.terms.acceptance" value={texts.pages.terms.acceptance} multiline />
              <TextInput label="Modificacions" path="pages.terms.modifications" value={texts.pages.terms.modifications} multiline />
              <TextInput label="Comandes" path="pages.terms.orders" value={texts.pages.terms.orders} multiline />
              <TextInput label="Preus" path="pages.terms.prices" value={texts.pages.terms.prices} multiline />
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-6">
            <MainSectionTitle>Política de Privacitat</MainSectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Títol" path="pages.privacy.title" value={texts.pages.privacy.title} />
              <TextInput label="Contingut" path="pages.privacy.content" value={texts.pages.privacy.content} multiline />
              <TextInput label="Recollida" path="pages.privacy.collection" value={texts.pages.privacy.collection} multiline />
              <TextInput label="Ús" path="pages.privacy.usage" value={texts.pages.privacy.usage} multiline />
              <TextInput label="Protecció" path="pages.privacy.protection" value={texts.pages.privacy.protection} multiline />
              <TextInput label="Drets" path="pages.privacy.rights" value={texts.pages.privacy.rights} multiline />
            </div>
          </div>

          <div className="border-l-4 border-pink-500 pl-6">
            <MainSectionTitle>Enviaments i Devolucions</MainSectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Títol" path="pages.shipping.title" value={texts.pages.shipping.title} />
              <TextInput label="Contingut" path="pages.shipping.content" value={texts.pages.shipping.content} multiline />
              <TextInput label="Enviament gratuït" path="pages.shipping.freeShipping" value={texts.pages.shipping.freeShipping} multiline />
              <TextInput label="Processament" path="pages.shipping.processing" value={texts.pages.shipping.processing} />
              <TextInput label="Lliurament" path="pages.shipping.delivery" value={texts.pages.shipping.delivery} />
              <TextInput label="Devolucions" path="pages.shipping.returns" value={texts.pages.shipping.returns} multiline />
              <TextInput label="Condició" path="pages.shipping.condition" value={texts.pages.shipping.condition} multiline />
            </div>
          </div>

          <div className="border-l-4 border-cyan-500 pl-6">
            <MainSectionTitle>Guia de Talles</MainSectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Títol" path="pages.sizing.title" value={texts.pages.sizing.title} />
              <TextInput label="Contingut" path="pages.sizing.content" value={texts.pages.sizing.content} multiline />
              <TextInput label="Ajust" path="pages.sizing.fit" value={texts.pages.sizing.fit} multiline />
              <TextInput label="Qualitat" path="pages.sizing.quality" value={texts.pages.sizing.quality} multiline />
              <TextInput label="Mides" path="pages.sizing.measurements" value={texts.pages.sizing.measurements} multiline />
              <TextInput label="Consell" path="pages.sizing.tip" value={texts.pages.sizing.tip} multiline />
            </div>
          </div>

          <div className="border-l-4 border-teal-500 pl-6">
            <MainSectionTitle>Creative Commons</MainSectionTitle>
            <div className="grid grid-cols-1 gap-4">
              <TextInput label="Títol" path="pages.cc.title" value={texts.pages.cc.title} />
              <TextInput label="Contingut" path="pages.cc.content" value={texts.pages.cc.content} multiline />
              <TextInput label="Llicència" path="pages.cc.license" value={texts.pages.cc.license} />
              <TextInput label="Descripció" path="pages.cc.description" value={texts.pages.cc.description} multiline />
              <TextInput label="Significat" path="pages.cc.meaning" value={texts.pages.cc.meaning} />
              <TextInput label="Atribució" path="pages.cc.attribution" value={texts.pages.cc.attribution} multiline />
              <TextInput label="No Comercial" path="pages.cc.nonCommercial" value={texts.pages.cc.nonCommercial} multiline />
              <TextInput label="Sense Derivades" path="pages.cc.noDerivatives" value={texts.pages.cc.noDerivatives} multiline />
              <TextInput label="Més info" path="pages.cc.moreInfo" value={texts.pages.cc.moreInfo} />
              <TextInput label="Enllaç" path="pages.cc.link" value={texts.pages.cc.link} />
              <TextInput label="Copyright" path="pages.cc.copyright" value={texts.pages.cc.copyright} multiline />
            </div>
          </div>
        </div>
      )
    },
    footer: {
      title: 'Peu de pàgina',
      render: () => (
        <div className="grid grid-cols-2 gap-6">
          <Column>
            <SectionTitle>Botiga</SectionTitle>
            <TextInput label="Títol" path="footer.services.shop.title" value={texts.footer.services.shop.title} />
            <TextInput label="Col·leccions" path="footer.services.shop.collections" value={texts.footer.services.shop.collections} />
            <TextInput label="Novetats" path="footer.services.shop.new" value={texts.footer.services.shop.new} />
            <TextInput label="Ofertes" path="footer.services.shop.offers" value={texts.footer.services.shop.offers} />

            <SectionTitle>Client</SectionTitle>
            <TextInput label="Títol" path="footer.services.customer.title" value={texts.footer.services.customer.title} />
            <TextInput label="Enviaments" path="footer.services.customer.shipping" value={texts.footer.services.customer.shipping} />
            <TextInput label="Estat comanda" path="footer.services.customer.orderStatus" value={texts.footer.services.customer.orderStatus} />
            <TextInput label="Guia talles" path="footer.services.customer.sizing" value={texts.footer.services.customer.sizing} />

            <SectionTitle>Idioma</SectionTitle>
            <TextInput label="Títol" path="footer.services.language.title" value={texts.footer.services.language.title} />
          </Column>
          <Column>
            <SectionTitle>Informació</SectionTitle>
            <TextInput label="Títol" path="footer.services.info.title" value={texts.footer.services.info.title} />
            <TextInput label="FAQ" path="footer.services.info.faq" value={texts.footer.services.info.faq} />
            <TextInput label="Nosaltres" path="footer.services.info.about" value={texts.footer.services.info.about} />
            <TextInput label="Contacte" path="footer.services.info.contact" value={texts.footer.services.info.contact} />

            <SectionTitle>Legal</SectionTitle>
            <TextInput label="Títol" path="footer.services.legal.title" value={texts.footer.services.legal.title} />
            <TextInput label="Privacitat" path="footer.services.legal.privacy" value={texts.footer.services.legal.privacy} />
            <TextInput label="Termes" path="footer.services.legal.terms" value={texts.footer.services.legal.terms} />

            <SectionTitle>Copyright</SectionTitle>
            <TextInput label="Text" path="footer.copyright" value={texts.footer.copyright} />

            <SectionTitle>Col·leccions Footer</SectionTitle>
            <TextInput label="First Contact" path="footer.collections.firstContact" value={texts.footer.collections.firstContact} />
            <TextInput label="The Human Inside" path="footer.collections.theHumanInside" value={texts.footer.collections.theHumanInside} />
            <TextInput label="Austen" path="footer.collections.austen" value={texts.footer.collections.austen} />
            <TextInput label="Cube" path="footer.collections.cube" value={texts.footer.collections.cube} />
            <TextInput label="Outcasted" path="footer.collections.outcasted" value={texts.footer.collections.outcasted} />
          </Column>
        </div>
      )
    }
  };

  return (
    <>
      <SEO title="Índex de Textos" description="Edita tots els textos del web" />

      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-700" />
                <h1 className="text-xl font-bold text-gray-900">Índex de Textos</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs.Root defaultValue="paginas" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Tabs.List className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
              {Object.entries(sections).map(([key, section]) => (
                <Tabs.Trigger
                  key={key}
                  value={key}
                  className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-white whitespace-nowrap"
                >
                  {section.title}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {Object.entries(sections).map(([key, section]) => (
              <Tabs.Content key={key} value={key} className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                {section.render()}
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </div>
      </div>
    </>
  );
}
