import React, { useEffect } from 'react';
import SEO from '@/components/SEO';

function CreativeCommonsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Llicència Creative Commons BY-NC-ND 4.0',
      paragraph: 'Els dibuixos, imatges i textos originals de Higgins GRÀFIC estan protegits sota la llicència Creative Commons Reconeixement-NoComercial-SenseObraDerivada 4.0 Internacional.',
    },
    {
      bullet: '2. Això vol dir que:',
      items: [
        'BY (Reconeixement) — Cal reconèixer l\'autoria de manera adequada.',
        'NC (No Comercial) — No es pot utilitzar per a finalitats comercials.',
        'ND (Sense Obra Derivada) — No es pot distribuir obres derivades.',
      ],
    },
    {
      bullet: '3. Més informació',
      paragraph: 'Per a més informació sobre aquesta llicència, visita:',
      contact: [
        'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.ca',
      ],
    },
    {
      bullet: '4. Drets reservats',
      note: 'Tots els drets són reservats per a les marques, logotips i elements distintius de Higgins GRÀFIC.',
      noteBold: true,
      noteTopHalf: true,
    },
  ];

  return (
    <>
      <SEO
        title="Creative Commons | Higgins GRÀFIC"
        description="Informació sobre la llicència Creative Commons BY-NC-ND 4.0 que protegeix el contingut creatiu de Higgins GRÀFIC."
        type="website"
        url="/cc"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Creative Commons
          </h1>
          <p className="font-roboto text-[10pt] font-normal text-gray-500 mb-24 text-center">
            Darrera actualització, juliol 2026
          </p>
        </div>

        {/* Background wrapper — only around the content with margin */}
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

        {/* Document — single column */}
        <div className="mx-auto relative" style={{ zIndex: 1, maxWidth: '500px' }}>
          <div className="w-full">
            {/* Intro */}
            <div className="mb-10 self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
              <p className="font-roboto text-[8pt] font-bold text-gray-800 leading-[1.25] whitespace-nowrap">
                Tot el contingut creatiu de Higgins GRÀFIC està protegit sota llicència Creative Commons.
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
                  <div className={`${section.noteTopHalf ? 'mt-[33px]' : 'mt-[66px]'} mb-[66px] self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]`}>
                    <p className="font-roboto text-[8pt] font-medium leading-[1.25] text-gray-700 whitespace-nowrap">
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

            {/* Footer */}
            <div className="mt-10 self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
              <p className="font-roboto text-[8pt] font-bold text-gray-700 leading-[1.25]">
                Aquesta informació està, obligatòriament, subjecta a la legislació espanyola i europea. Fer servir els nostres serveis equival a l'acceptació, de facto, d'aquesta informació.
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Spacer between background and footer */}
        <div className="h-[300px]" />

      </div>
    </>
  );
}

export default CreativeCommonsPage;
