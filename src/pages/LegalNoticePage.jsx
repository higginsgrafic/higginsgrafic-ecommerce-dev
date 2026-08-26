import React, { useEffect } from 'react';
import SEO from '@/components/SEO';

function LegalNoticePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Titular del Lloc Web',
      contact: [
        'Higgins GRÀFIC',
        'NIF: (a determinar)',
        'Carrer Convent, 11, Cardedeu 08440, Barcelona',
        'higginsgrafic@gmail.com',
        'higginsgrafic.com',
      ],
      paragraph: 'Higgins GRÀFIC és una marca de roba amb missatge que comercialitza samarretes i productes tèxtils amb dissenys originals, fabricats sota demanda mitjançant tecnologia d\'impressió digital.',
    },
    {
      bullet: '2. Condicions d\'Ús',
      paragraph: 'L\'accés i ús del lloc web higginsgrafic.com atribueix a l\'usuari la condició d\'usuària i implica l\'acceptació plena i sense reserves de totes les disposicions incloses en aquest avís legal.',
      items: [
        'L\'usuari es compromet a utilitzar el lloc web de conformitat amb la llei, aquest avís legal, les condicions generals de compra, la política de privacitat i la política de cookies.',
      ],
    },
    {
      bullet: '2.2 Obligacions de l\'Usuari',
      paragraph: 'L\'usuari es compromet a:',
      items: [
        'Facilitar informació verídica i correcta en els formularis de registre i compra',
        'No utilitzar el lloc web per a activitats il·lícites o contràries a la bona fe',
        'No danyar, alterar o sobrecarregar el lloc web ni impedir-ne l\'ús normal per part d\'altres usuaris',
        'Respectar els drets de propietat intel·lectual i industrial de GRÀFIC i de tercers',
      ],
    },
    {
      bullet: '3. Propietat Intel·lectual i Industrial',
      paragraph: 'Tots els continguts del lloc web (dissenys, logotips, textos, imatges, fotografies, codi font, elements gràfics i audiovisuals) són propietat exclusiva de GRÀFIC o dels seus llicenciadors i estan protegits pels drets de propietat intel·lectual i industrial vigents.',
      items: [
        'Els dissenys originals de GRÀFIC estan protegits sota llicència Creative Commons Reconeixement NoComercial-SenseObraDerivada 4.0 Internacional (BY-NC-ND 4.0).',
        'Podeu consultar els termes complets d\'aquesta llicència a la nostra pàgina de Creative Commons.',
        'Queda expressament prohibit reproduir, distribuir, comunicar públicament, transformar o utilitzar amb qualsevol finalitat, directa o indirecta, els continguts del lloc web sense autorització prèvia i per escrit de GRÀFIC.',
      ],
    },
    {
      bullet: '4. Responsabilitat',
      paragraph: 'Higgins GRÀFIC no es responsabilitza dels possibles errors de seguretat que es puguin produir per la utilització de navegadors de versions no actualitzades, o de les conseqüències derivades del mal funcionament del navegador, ja sigui per mala configuració, presència de virus informàtics o qualsevol altra causa aliena a Higgins GRÀFIC.',
      items: [
        'Higgins GRÀFIC no serà responsable dels danys directes o indirectes que puguin derivar-se de la utilització del lloc web, incloent-hi pèrdua de dades, interrupció del negoci o qualsevol altre dany.',
        'El lloc web pot contenir enllaços a llocs web de tercers. GRÀFIC no es responsabilitza del contingut ni del funcionament d\'aquests llocs externs.',
      ],
    },
    {
      bullet: '5. Modificacions',
      paragraph: 'Higgins GRÀFIC es reserva el dret de realitzar en qualsevol moment i sense necessitat de preavís, modificacions del present avís legal, com de les condicions generals i les polítiques del lloc web.',
      items: [
        'L\'usuari és responsable de revisar periòdicament aquesta pàgina per conèixer els canvis que s\'hagin pogut produir.',
      ],
    },
    {
      bullet: '6. Llei Aplicable i Jurisdicció',
      paragraph: 'Aquest avís legal es regeix per la legislació espanyola vigent.',
      items: [
        'Per a la resolució de qualsevol controvèrsia o conflicte derivat de l\'ús del lloc web, les parts se sotmeten als jutjats i tribunals que corresponguin segons la legislació de protecció dels consumidors.',
        'Com a consumidor, pots accedir a la plataforma europea de resolució de litigis en línia: https://ec.europa.eu/consumers/odr',
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Avís Legal | Higgins GRÀFIC"
        description="Avís legal de Higgins GRÀFIC. Informació sobre condicions d'ús, propietat intel·lectual, responsabilitat i jurisdicció del lloc web higginsgrafic.com."
        keywords="avís legal gràfic, condicions d'ús, propietat intel·lectual, responsabilitat"
        type="website"
        url="/legal"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Avís Legal
          </h1>
          <p className="font-roboto text-[10pt] font-normal text-gray-500 mb-24 text-center">
            Darrera actualització, juliol 2026
          </p>
        </div>

        {/* Background wrapper — only around the two columns with margin */}
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

        {/* Document — single column */}
        <div className="mx-auto relative" style={{ zIndex: 1, maxWidth: '500px' }}>
          <div className="w-full">
            {/* Intro */}
            <div className="mb-10 self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
              <p className="font-roboto text-[8pt] font-bold text-gray-800 leading-[1.25] text-justify" style={{ hyphens: 'auto', WebkitHyphens: 'auto' }}>
                L'accés al lloc web higginsgrafic.com implica l'acceptació d'aquest avís legal. Si no esteu d'acord amb tot o part d'aquestes condicions, si us plau, no utilitzeu el lloc web.
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

            {/* Footer */}
            <div className="mt-10 self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
              <p className="font-roboto text-[8pt] font-bold text-gray-700 leading-[1.25]">
                Aquest avís legal constitueix un acord legal vinculant entre vós i Higgins GRÀFIC. Si teniu qualsevol dubte sobre aquestes condicions, si us plau, contacteu amb nosaltres abans de fer anar el lloc web.
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

export default LegalNoticePage;
