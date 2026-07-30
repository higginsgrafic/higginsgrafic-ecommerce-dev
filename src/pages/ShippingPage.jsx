import React, { useEffect } from 'react';
import SEO from '@/components/SEO';

function ShippingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Enviament gratuït',
      paragraph: 'Tots els enviaments són de franc.',
    },
    {
      bullet: '2. Temps de producció',
      paragraph: 'Cada peça és elaborada sota demanda per evitar el malbaratament del material i totes les conseqüències que se\'n deriven. Això vol dir que cada producte només entra en producció després de fer la comanda. El temps de producció dependrà de la logística del proveïdor, però l\'estimació és de 2 a 5 dies laborables.',
    },
    {
      bullet: '3. Temps i costos per destinació',
      items: [
        'Espanya (Península i Balears) — 3-5 dies laborables — 4,95€',
        'Espanya (Canàries, Ceuta, Melilla) — 5-7 dies laborables — 6,95€',
        'Unió Europea — 5-10 dies laborables — 6,95€',
        'Internacional — 10-15 dies laborables — Calculat al pagament',
      ],
    },
    {
      bullet: '4. Seguiment de comanda',
      paragraph: 'Rebreu un correu amb el número de seguiment tan aviat com el paquet s\'enviï. Podreu veure l\'estat de la comanda en temps real a través de l\'enllaç proporcionat.',
      note: 'El número de seguiment pot trigar 24-48h a activar-se al sistema del transportista.',
      noteBold: true,
    },
    {
      bullet: '5. Dret de desistiment',
      paragraph: 'Tens 14 dies naturals des de la recepció del producte per tornar-lo sense necessitat de donar cap explicació, segons la normativa europea de protecció del consumidor.',
    },
    {
      bullet: '6. Com cal fer una devolució',
      items: [
        'Contacta amb nosaltres — Envieu un correu a higginsgrafic@gmail.com amb el número de comanda i (opcional) el motiu de la devolució.',
        'Prepara el Paquet — El producte ha d\'estar en condicions originals: sense usar, amb etiquetes i en el seu embalatge original.',
        'Envia el Producte — Us enviarem les instruccions d\'enviament. Els costos de devolució van a càrrec vostre (tret per defecte del producte).',
        'Reemborsament — Un cop rebem i validem la devolució, processem el reemborsament en un màxim de 14 dies pel mateix mètode de pagament.',
      ],
    },
    {
      bullet: '7. Canvis de talla',
      paragraph: 'A causa del nostre sistema de producció -sota demanda- no ens és possible fer canvis directes. El procediment és el següent:',
      items: [
        'Tornar el producte seguint el procés de devolució',
        'Fer una nova comanda amb la talla correcta',
      ],
      note: 'Consell: Consulta la nostra Size Guide abans de comprar per evitar canvis de talla.',
      noteBold: true,
    },
    {
      bullet: '8. Productes defectuosos o fets malbé',
      paragraph: 'Si el producte arriba amb defectes de fabricació o desperfectes de cap mena:',
      items: [
        'Contacta amb nosaltres en un màxim de 7 dies a higginsgrafic@gmail.com',
        'Envia\'ns fotos clares del defecte o desperfecte.',
        'Us enviarem un reemplaçament de franc.',
        'No cal que torneu el producte defectuós o fet malbé.',
      ],
      note: 'Els costos d\'enviament del reemplaçament van totalment a càrrec nostre.',
      noteBold: true,
    },
    {
      bullet: '9. Contacte',
      paragraph: 'Si tens cap dubte sobre enviaments o devolucions, pots contactar amb nosaltres:',
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
        title="Enviaments i Devolucions | Higgins GRÀFIC"
        description="Informació sobre enviaments, temps de lliurament, costos i política de devolucions de Higgins GRÀFIC. Enviament gratuït >50€. Devolucions en 14 dies."
        keywords="enviaments gràfic, devolucions, enviament gratuït, temps lliurament, política devolucions"
        type="website"
        url="/shipping"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Enviaments i Devolucions
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
                Higgins GRÀFIC ven cada peça sota demanda per evitar malbaratament de material i acumulació d'estoc. Aquesta política explica els temps de producció, enviaments, costos i el procés de devolució en compliment de la normativa europea de protecció del consumidor.
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
                Aquesta política d'enviaments i devolucions està subjecta, obligatòriament, a la legislació espanyola i europea. Fer servir els nostres serveis equival a l'acceptació, de facto, d'aquesta política.
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

export default ShippingPage;
