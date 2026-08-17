import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

function ContactPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goToMessages = () => {
    const now = Date.now();
    const ttl = 30 * 60 * 1000;
    sessionStorage.setItem('HG_MEGA_PAGE', JSON.stringify({ value: 4, expiresAt: now + ttl }));
    sessionStorage.setItem('HG_ACORDIO_EXPANDED_PAGE4', JSON.stringify({ value: true, expiresAt: now + ttl }));
    sessionStorage.setItem('HG_USER_ACTIVE_TAB', JSON.stringify({ value: 'MISSATGES', expiresAt: now + ttl }));
    window.dispatchEvent(new CustomEvent('hg:open-user-tab', { detail: { tab: 'MISSATGES' } }));
    navigate('/?active=first_contact');
  };

  const WHATSAPP_NUMBER = '34000000000';
  const WHATSAPP_MSG = encodeURIComponent('Hola Higgins GRÀFIC, tinc una qüestió sobre una comanda.');
  const TELEGRAM_USER = 'higginsgrafic';

  const sections = [
    {
      intro: (
        <>
          Si us podem ajudar a resoldre cap qüestió no dubteu a posar-vos en contacte amb nosaltres per correu electrònic, Telegram, WhatsApp o per correu postal. També pots contactar amb nosaltres a través del <span onClick={goToMessages} style={{ cursor: 'pointer', color: '#141414', textDecoration: 'underline' }}>formulari que tens dins del teu usuari</span> de la botiga.
        </>
      ),
      contact: [
        'Higgins GRÀFIC',
        '52161740 V',
        'Carrer Convent, 11',
        'Cardedeu 08440, Barcelona',
        '+34 000 000 000',
        'higginsgrafic@gmail.com',
      ],
      socialButtons: true,
      note: 'Ens comprometem a respondre dins del terme màxim de 48 hores laborables.',
      noteBold: true,
    },
  ];

  return (
    <>
      <SEO
        title="Contacte | Higgins GRÀFIC"
        description="Contacta amb Higgins GRÀFIC. Email, temps de resposta i informació de contacte. Diga'm Higgins."
        keywords="contacte higgins gràfic, email, atenció client, suport"
        type="website"
        url="/contact"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Contacte
          </h1>
          <p className="font-roboto text-[10pt] font-normal text-gray-500 mb-24 text-center">
            Diga'm Higgins
          </p>
        </div>

        {/* Background wrapper */}
        <div
          className="relative"
          style={{
            backgroundImage: 'url(/_TMP/SERVEIS/serveis-fons-1-columna.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: '102% 100%',
            backgroundAttachment: 'scroll',
            paddingTop: '50px',
            paddingBottom: '100px',
          }}
        >

        {/* Brightness overlay — 10% lighter */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 0 }} />

        {/* Document — single column */}
        <div className="mx-auto relative" style={{ zIndex: 1, maxWidth: '500px' }}>
          <div className="w-full">
            {/* Sections */}
            {sections.map((section, i) => (
              <div key={i} className="mb-7">
                {section.intro && (
                  <div className="mb-10 self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
                    <p className="font-roboto text-[8pt] font-bold text-gray-800 leading-[1.25] text-justify" style={{ hyphens: 'auto', WebkitHyphens: 'auto' }}>
                      {section.intro}
                    </p>
                  </div>
                )}
                {section.bullet && (
                  <h2 className="font-roboto text-[10pt] font-normal text-[#141414] mb-0 flex items-start gap-2">
                    <span className="text-[#141414]">•</span>
                    <span>{section.bullet}</span>
                  </h2>
                )}
                {section.paragraph && (
                  <p className="font-roboto text-[10pt] font-light text-gray-700 leading-[1.5] mb-2 pl-5">
                    {section.paragraph}
                  </p>
                )}
                {section.items && (
                  <ul className="pl-5 mb-0">
                    {section.items.map((item, j) => {
                      const dashIdx = item.indexOf(' — ');
                      const boldPart = dashIdx >= 0 ? item.substring(0, dashIdx) : item;
                      const restPart = dashIdx >= 0 ? item.substring(dashIdx) : '';
                      return (
                        <li key={j} className="font-roboto text-[10pt] font-light text-gray-700 leading-[1.5] flex items-start gap-2">
                          <span className="text-gray-700 mt-[-1px]">-</span>
                          <span><span className="font-normal">{boldPart}</span>{restPart}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {section.contact && (
                  <div className="mt-[66px] mb-[66px] self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px] text-center">
                    <div className="inline-block text-left">
                      {section.contact.map((line, j) => {
                        const isPhone = line.startsWith('+34');
                        const isEmail = line.includes('@');
                        if (isPhone) {
                          return (
                            <p key={j} className="font-roboto text-[10pt] leading-[1.5] text-gray-700 font-light">
                              <a href={`tel:${line.replace(/\s/g, '')}`} className="text-gray-700 hover:text-[#141414]" style={{ textDecoration: 'none' }}>{line}</a>
                            </p>
                          );
                        }
                        if (isEmail) {
                          return (
                            <p key={j} className="font-roboto text-[10pt] leading-[1.5] text-gray-700 font-normal">
                              <a href={`mailto:${line}`} className="text-gray-700 hover:text-[#141414]" style={{ textDecoration: 'none' }}>{line}</a>
                            </p>
                          );
                        }
                        return (
                          <p key={j} className={`font-roboto text-[10pt] leading-[1.5] text-gray-700 ${j === 0 ? 'font-normal' : 'font-light'}`}>
                            {line}
                          </p>
                        );
                      })}
                    </div>
                    {section.socialButtons && (
                      <div className="flex items-center justify-center gap-3 mt-5 pt-5 border-t border-[#E6E8EC]">
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-[9pt] font-roboto font-normal transition-opacity hover:opacity-90"
                          style={{ backgroundColor: '#25D366' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </a>
                        <a
                          href={`https://t.me/${TELEGRAM_USER}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-[9pt] font-roboto font-normal transition-opacity hover:opacity-90"
                          style={{ backgroundColor: '#0088CC' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.531 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                          Telegram
                        </a>
                      </div>
                    )}
                  </div>
                )}
                {section.note && section.noteBold && (
                  <div className="mt-[66px] mb-[66px] self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px] text-center">
                    <p className="font-roboto text-[8pt] font-medium leading-[1.25] text-gray-700">
                      {section.note}
                    </p>
                  </div>
                )}
                {section.note && !section.noteBold && (
                  <p className="font-roboto pl-5 text-[10pt] font-light leading-[1.5] text-gray-700">
                    {section.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Spacer between background and footer */}
        <div className="h-[300px]" />

      </div>
    </>
  );
}

export default ContactPage;
