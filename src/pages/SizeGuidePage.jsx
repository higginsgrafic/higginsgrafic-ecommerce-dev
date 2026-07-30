import React, { useEffect } from 'react';
import SEO from '@/components/SEO';

function SizeGuidePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Taula de Talles (cm)',
      table: {
        headers: ['Talla', 'Pit', 'Llargada', 'Màniga'],
        rows: [
          ['S', '94-97', '71', '19'],
          ['M', '99-102', '74', '20'],
          ['L', '104-107', '76', '21'],
          ['XL', '109-112', '78', '22'],
          ['2XL', '114-117', '80', '23'],
        ],
      },
      note: 'Totes les mesures són aproximades i poden variar ±2 cm.',
    },
    {
      bullet: '2. Taula de Talles (in)',
      table: {
        headers: ['Talla', 'Pit', 'Llargada', 'Màniga'],
        rows: [
          ['S', '37-38', '28', '7.5'],
          ['M', '39-40', '29', '7.9'],
          ['L', '41-42', '30', '8.3'],
          ['XL', '43-44', '31', '8.7'],
          ['2XL', '45-46', '31.5', '9.1'],
        ],
      },
      note: 'Totes les mesures són aproximades i poden variar ±2".',
    },
    {
      bullet: '3. Com es prenen les mesures',
      items: [
        'Pit — Passa la cinta mètrica al voltant de la part més ampla del pit de forma horitzontal.',
        'Llargada — Pren la mida des del punt més alt del coll fins a la cintura de la samarreta.',
        'Màniga — Pren la mida des del punt on la màniga es troba amb l\'espatlla fins a la vora de la màniga.',
      ],
      note: 'Una manera d\'assegurar-te de triar la talla correcta és la de comparar-la amb una samarreta que ja tens i que et va bé. La poses ben plana sobre una superfície llisa -el llit, per exemple- i en prens les mesures del pit, de llargada i de la màniga. Després la compares amb la taula de talles.',
    },
    {
      bullet: '4. Quin estil t\'agrada?',
      items: [
        'Ajustada — Si vols un fit més ajustat al cos, tria la teva talla habitual.',
        'Relaxada — Si prefereixes una caiguda més còmoda i ampla, tria una talla més.',
        'Oversize — Per un look oversized, tria dues talles més grans.',
      ],
    },
    {
      bullet: '5. Material i Cura',
      paragraph: 'Composició: 100% Cotó Orgànic Certificat, 180 g/m² (qualitat prèmium).',
      items: [
        'Renta-ho màxim a 30°C.',
        'Renta-ho del revés per protegir el dibuix.',
        'No és recomanable fer servir l\'assecadora.',
        'Planxa-ho del revés a temperatura mitjana.',
        'No hi facis servir lleixeu',
      ],
      note: 'El cotó orgànic es pot encongir lleugerament, fins a un 2 o un 3% després de la primera rentada, per això, les mesures de la taula, són un cop rentats. Segueix les instruccions de cura per mantenir la qualitat i mesures de la samarreta.',
      noteBold: true,
    },
    {
      bullet: '6. Contacte',
      paragraph: 'Si no estàs segur de quina talla has de triar, mirarem d\'ajudar-te:',
      contact: [
        'higginsgrafic@gmail.com',
      ],
      note: 'Ens comprometem a respondre les consultes en un màxim de 48 hores laborables.',
      noteBold: true,
    },
  ];

  return (
    <>
      <SEO
        title="Guia de Talles | Higgins GRÀFIC"
        description="Guia de talles de Higgins GRÀFIC. Taules de mesures detallades i consells per triar la talla perfecta per a les nostres samarretes. Talles S, M, L, XL, 2XL."
        keywords="guia talles gràfic, talles samarretes, mides, mesures, com triar talla"
        type="website"
        url="/sizing"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Guia de Talles
          </h1>
          <p className="font-roboto text-[10pt] font-normal text-gray-500 mb-24 text-center">
            Darrera actualització, juliol 2026
          </p>
        </div>

        {/* Background wrapper — only around the two columns with margin */}
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
              <p className="font-roboto text-[8pt] font-bold text-gray-800 leading-[1.25] text-justify" style={{ hyphens: 'auto', WebkitHyphens: 'auto' }}>
                Les nostres samarretes segueixen el tallatge europeu estàndard. Per assegurar-te que tries la talla correcta et recomanem que comparis la talla que vols amb una samarreta que ja tinguis i que et vagi bé.
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
                {section.table && (
                  <div className="pl-5 mb-2">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300">
                          {section.table.headers.map((h, k) => (
                            <th key={k} className="font-roboto text-[8pt] font-normal text-[#141414] text-left py-[4px] px-[8px]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, r) => (
                          <tr key={r} className="border-b border-gray-100">
                            {row.map((cell, c) => (
                              <td key={c} className={`font-roboto text-[8pt] py-[4px] px-[8px] ${c === 0 ? 'font-normal text-[#141414]' : 'font-light text-gray-700'}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

            {/* Footer */}
            <div className="mt-10 self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
              <p className="font-roboto text-[8pt] font-bold text-gray-700 leading-[1.25]">
                Aquesta guia de talles està, obligatòriament, subjecta a la legislació espanyola i europea. Fer servir els nostres serveis equival a l'acceptació, de facto, d'aquesta informació.
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

export default SizeGuidePage;
