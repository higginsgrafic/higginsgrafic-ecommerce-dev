import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

function CookiePolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Què són les Cookies?',
      paragraph: 'Les cookies són petits fitxers de text que els llocs web col·loquen al navegador dels dispositius dels usuaris. Permeten reconèixer l\'usuari en visites posteriors i emmagatzemar informació sobre les seves preferències i comportament de navegació.',
      items: [
        'Les cookies són essencials per al funcionament d\'Internet, aportant nombroses avantatges en la prestació de serveis interactius.',
      ],
    },
    {
      bullet: '2. Tipus de Cookies que Utilitzem',
      paragraph: '2.1 Cookies essencials (tècniques) — Són necessàries per al funcionament bàsic del lloc web. Permeten la navegació, l\'accés a àrees segures i la realització de compres. No es poden desactivar.',
      items: [
        'Mantenir la sessió d\'usuari',
        'Recordar els productes de la cistella',
        'Garantir la seguretat de les transaccions',
      ],
    },
    {
      bullet: '2.2 Cookies analítiques',
      paragraph: 'Permeten quantificar el nombre d\'usuaris i analitzar l\'ús que fan del lloc web, per millorar el servei.',
      items: [
        'Google Analytics: mesura visites, pàgines vistes, temps de permanència',
        'Dades agregades i anònimes',
      ],
    },
    {
      bullet: '2.3 Cookies de màrqueting',
      paragraph: 'Gestiona i controla la publicitat mostrada a l\'usuari.',
      items: [
        'Actualment no utilitzem cookies de màrqueting de tercers',
        'Només utilitzem les nostres pròpies comunicacions si l\'usuari s\'ha subscrit',
      ],
    },
    {
      bullet: '3. Cookies de Tercers',
      paragraph: 'El lloc web utilitza serveis de tercers que poden instal·lar cookies:',
      items: [
        'Stripe — Processament de pagaments. Necessari per completar les transaccions de forma segura. No emmagatzema dades de targetes.',
        'Gelato — Soci de producció i enviament. Pot utilitzar cookies per gestionar les comandes.',
        'Google Analytics (si està activat) — Anàlisi del comportament dels usuaris de forma anònima.',
      ],
      note: 'Aquests tercers gestionen les seves pròpies polítiques de cookies segons les seves condicions.',
      noteBold: true,
    },
    {
      bullet: '4. Durada de les Cookies',
      paragraph: 'Les cookies poden ser:',
      items: [
        'De sessió — S\'esborren quan l\'usuari tanca el navegador.',
        'Persistents — Permaneixen al dispositiu durant un període determinat (des de minuts fins a anys).',
      ],
      note: 'La majoria de cookies que utilitzem són de sessió o tenen una durada curta. Les cookies analítiques, si s\'activen, tenen una durada màxima de 2 anys.',
      noteBold: true,
    },
    {
      bullet: '5. Gestió de les Cookies',
      paragraph: 'Pots gestionar les preferències de cookies de diverses maneres:',
      items: [
        'Chrome: Configuració > Privacitat i seguretat > Cookies',
        'Firefox: Preferències > Privacitat i seguretat > Cookies',
        'Safari: Preferències > Privacitat > Cookies',
        'Edge: Configuració > Cookies i permisos del lloc',
      ],
    },
    {
      bullet: '6. Actualitzacions',
      paragraph: 'Higgins GRÀFIC pot modificar aquesta política de cookies en qualsevol moment per adaptar-la a les novetats legislatives o jurisprudencials, o a les instruccions dictades per l\'Agència Espanyola de Protecció de Dades (AEPD).',
      items: [
        'Qualsevol canvi significatiu serà comunicat als usuaris a través d\'un avís visible al lloc web.',
      ],
    },
  ];

  return (
    <>
      <SEO
        title="Política de Cookies | Higgins GRÀFIC"
        description="Política de cookies de Higgins GRÀFIC. Informació sobre els tipus de cookies que utilitzem, la seva finalitat i com gestionar-les segons la normativa vigent."
        keywords="política cookies gràfic, cookies, privacitat, RGPD, configuració cookies"
        type="website"
        url="/cookies"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Política de Cookies
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
                Higgins GRÀFIC utilitza cookies per millorar l'experiència de navegació i oferir un servei de qualitat. Aquesta política explica quines cookies utilitzem, per què i com pots gestionar-les, en compliment amb la Llei 34/2002 de serveis de la societat de la informació i de comerç electrònic (LSSI) i el Reglament General de Protecció de Dades (RGPD).
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
                      {section.noteLink ? (
                        <>
                          {section.note.split('Política de Privacitat')[0]}
                          <Link to={section.noteLink} className="underline hover:text-gray-900">Política de Privacitat</Link>
                          {section.note.split('Política de Privacitat')[1]}
                        </>
                      ) : section.note}
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
                Aquesta Política de Cookies està obligatòriament subjecta a la legislació espanyola i europea. Fer servir els nostres serveis equival a l'acceptació, de facto, de la Política de Cookies.
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

export default CookiePolicyPage;
