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
                      {section.contact.map((line, j) => (
                        <p key={j} className={`font-roboto text-[10pt] leading-[1.5] text-gray-700 ${j === 0 || j === section.contact.length - 1 ? 'font-normal' : 'font-light'}`}>
                          {line}
                        </p>
                      ))}
                    </div>
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
