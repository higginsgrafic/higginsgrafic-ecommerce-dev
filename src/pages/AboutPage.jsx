import React, { useEffect } from 'react';
import SEO from '@/components/SEO';

function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Què és Higgins GRÀFIC',
      paragraph: 'Higgins GRÀFIC és una botigueta casolana feta i pensada per a vendre petites artesanies digitals que es poden reproduir sobre diversos formats. Nosaltres fem servir el més comú i el rei de tots: la samarreta. Esperem que ben aviat puguem tenir més formats a la vostra disposició.',
    },
    {
      bullet: '2. El format',
      paragraph: 'Evidentment, el format, és important i no pot ser de qualsevol manera i és per aquest motiu que hem triat el model 64000 de la marca Gildan perquè compta amb una sèrie de qualitats que el fan ideal per a la impressió digital i la portabilitat diària de la peça. No oblidem que aquest llenç és una samarreta de debò.',
    },
    {
      bullet: '3. Producció sostenible',
      paragraph: 'No es fabrica res fins que algú no ho demana. No hi ha estoc, no es malbarata, no hi ha magatzems plens de samarretes que ningú no vol. Cada peça es produeix al centre més proper a la teva adreça per reduir emissions de transport.',
      items: [
        'Cotó orgànic certificat — 150 g/m², qualitat prèmium.',
        'Tintes ecològiques — Lliures de substàncies tòxiques.',
        'Sense estocs — Es fabrica només quan es demana.',
        'Producció local — El centre més proper a tu, quan és possible.',
      ],
    },
    {
      bullet: '4. Qui som',
      paragraph: 'Sóc una sola persona que fa els seus dibuixos i que ha trobat una manera de vendre\'ls. No tinc equip de màrqueting, no tinc inversors, no tinc pressió per créixer. L\'objectiu: fer els meus dibuixos i que arribin a la gent que els aprecia.',
      contact: [
        'higginsgrafic@gmail.com',
      ],
      note: 'Si tens cap dubte, suggeriment o simplement vols comentar-me alguna cosa, escriu-me. Llegeixo tot el que m\'arriba. Diga\'m Higgins.',
      noteBold: true,
    },
  ];

  return (
    <>
      <SEO
        title="Sobre Higgins GRÀFIC | Higgins GRÀFIC"
        description="Higgins GRÀFIC és un projecte de disseny gràfic que ven el seu treball a través de la samarreta. Producció sota demanda, cotó orgànic, dissenys originals."
        keywords="sobre higgins gràfic, disseny gràfic, samarretes, producció sota demanda, cotó orgànic"
        type="website"
        url="/about"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Higgins GRÀFIC
          </h1>
          <p className="font-roboto text-[10pt] font-normal text-gray-500 mb-24 text-center">
            Dibuixos en petit format
          </p>
        </div>

        {/* Background wrapper */}
        <div
          className="relative"
          style={{
            backgroundImage: 'url(/placeholders/tots_els_fons/fons_serveis/serveis-fons-1-columna.png)',
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
            {/* Intro */}
            <div className="mb-10">
              <p className="font-roboto text-[12pt] font-normal text-gray-800 leading-[1.25] text-center">
                La samarreta és l'últim bastió de la llibertat d'expressió.
              </p>
            </div>

            {/* Sections */}
            {sections.map((section, i) => (
              <div key={i} className="mb-7">
                <h2 className="font-roboto text-[10pt] font-normal text-[#141414] mb-0 flex items-start gap-2">
                  <span className="text-[#141414]">•</span>
                  <span>{section.bullet}</span>
                </h2>
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
                        <p key={j} className={`font-roboto text-[10pt] leading-[1.5] text-gray-700 ${j === 0 ? 'font-normal' : 'font-light'}`}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {section.note && section.noteBold && (
                  <div className="mt-[66px] mb-[66px] self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
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

export default AboutPage;
