import React, { useEffect } from 'react';
import SEO from '@/components/SEO';

function FAQPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Comandes i Pagament',
      items: [
        'Quins mètodes de pagament accepteu? — Acceptem targetes de crèdit i dèbit (Visa, Mastercard, Etc.) a través de Stripe, una plataforma de pagament segura que compleix amb tots els estàndards de seguretat PCI DSS. No emmagatzemem les dades de la targeta als nostres servidors.',
        'És segur comprar al vostre web? — Sí, absolutament. Utilitzem certificat SSL (HTTPS) per encriptar totes les dades confidencials. Els pagaments es processen a través de Stripe, un dels processadors de pagament més segurs del món. Mai tenim accés a les dades completes de la targeta.',
        'Puc cancel·lar la meva comanda? — Podeu cancel·lar la comanda sense cost si encara no ha entrat en producció (normalment les primeres 24 hores). Contacteu amb nosaltres immediatament a higginsgrafic@gmail.com amb el número de comanda. Un cop el producte està en producció, no es pot cancel·lar, però podeu fer ús del dret de desistiment de 14 dies un cop el rebeu.',
        'Rebré una factura? — Sí, rebràs una factura electrònica per email un cop es processi el pagament. Si necessites una factura amb dades fiscals específiques (per a empreses), indica-ho al camp de notes durant el pagament.',
      ],
    },
    {
      bullet: '2. Enviaments',
      items: [
        'Quant triga l\'enviament? — Els temps de lliurament es componen de producció + enviament. Producció: 2-5 dies laborables. Enviament Espanya: 3-5 dies laborables. Enviament UE: 5-10 dies laborables. Enviament Internacional: 10-15 dies laborables. Rebreu un correu amb número de seguiment quan el paquet s\'enviï.',
        'Quant costa l\'enviament? — Espanya: 4,95€. Unió Europea: 6,95€. Internacional: Calculat al pagament segons destinació. El cost exacte es mostra sempre abans de finalitzar la comanda.',
        'Envieu a tot el món? — Enviem a la majoria de països del món a través de la xarxa de producció global Gelato. Els costos i temps d\'enviament varien segons el país de destinació. Podeu veure el cost exacte introduint l\'adreça durant el pagament.',
        'Puc fer seguiment de la meva comanda? — Oh i tant que sí! Un cop el paquet s\'enviï, rebreu un correu amb un número de seguiment que permetrà veure exactament on és el paquet en tot moment. També podeu contactar amb nosaltres a higginsgrafic@gmail.com si teniu qualsevol dubte.',
      ],
    },
    {
      bullet: '3. Productes',
      items: [
        'Quins materials utilitzeu? — Fem servir cotó orgànic certificat 100% en totes les nostres samarretes. Les tintes són ecològiques i lliures de substàncies tòxiques. Tots els nostres proveïdors compleixen amb certificacions de sostenibilitat i comerç just.',
        'Com són les talles? — Les nostres samarretes segueixen talles europees estàndard. Podeu consultar la guia de talles detallada amb mesures exactes a la pàgina de cada producte o a la secció Size Guide. En general, si teniu dubtes entre dues talles, recomanem la més gran per més comoditat.',
        'Els dissenys es despinten amb els rentats? — No! Utilitzem impressió DTG (Direct-to-Garment) d\'alta qualitat que penetra les fibres del cotó. Els dissenys estan fets per durar anys si segueixes les instruccions de cura (rentat a 30°C, del revés, sense assecadora). Oferim garantia de 2 anys contra defectes de fabricació.',
        'Per què hem triat el sistema de producció sota demanda? — En el món digital que vivim, on la informació viatja a la velocitat de la llum, on ja no cal anar a la botiga per conèixer les novetats de temporada i que et permet tenir una selecció molt més àmplia de productes que abans, hem decidit sumar-nos a la iniciativa de centralitzar la producció de petites quantitats a proveïdors externs que fa que produïm cada peça només quan algú la compra per evitar el malbaratament de la indústria de la moda tradicional. Sense estocs captius, sense excessos de producció, amb menor petjada ecològica, major actualització del producte. És la forma més sostenible de fer certs formats estandarditzats de roba, com ara les samarretes.',
      ],
    },
    {
      bullet: '4. Devolucions i Canvis',
      items: [
        'Puc tornar un producte si no m\'agrada? — Sí, tens 14 dies naturals des de la recepció per tornar qualsevol producte sense necessitat de justificació (dret de desistiment). El producte ha d\'estar en condicions originals: sense usar, amb les etiquetes intactes i embalatge originals. Els costos d\'enviament de devolució van a càrrec de la part que desisteix (tret que sigui per defecte del producte).',
        'Com cal fer una devolució? — Envieu un correu a higginsgrafic@gmail.com amb el número de comanda, indiqueu quin producte voleu tornar i el motiu. Us enviarem les instruccions de devolució. Envieu el producte segons les instruccions. Rebreu el reemborsament en 14 dies des que rebem la devolució i pel mateix mètode de pagament usat a la compra.',
        'Puc canviar un producte per una altra talla? — A conseqüència de la logística de la mateixa producció - sota demanda- no ens és possible fer cap canvi fins que no es completa el procés. El procediment és el de tornar el producte (dret de desistiment) per una banda, i tot seguit, fer una nova comanda amb la talla correcta. Els costos d\'enviament de devolució van a càrrec de la part que desisteix.',
        'Què passa si el producte que arriba és defectuós? — Contacta amb nosaltres en un màxim de 7 dies a higginsgrafic@gmail.com. Envia\'ns fotos clares del defecte/desperfecte. Valorarem el cas i t\'enviarem una peça nova sense cap cost addicional, si és justificat.',
      ],
      note: 'No cal que tornis el producte defectuós. Els costos d\'enviament i devolució van a càrrec nostre.',
    },
    {
      bullet: '5. Sostenibilitat',
      items: [
        'Realment sou sostenibles? — Sí. Producció sota demanda vol dir: sense malbarataments. Cotó orgànic 100% certificat. Tintes ecològiques lliures de tòxics. Producció local quan és possible. Proveïdors certificats amb estàndards de sostenibilitat. Embalatges reciclables. Transparència total en tota la cadena de producció.',
        'On es fabriquen els vostres productes? — Treballem amb Gelato, una xarxa global de producció sota demanda. Quan fas una comanda, el producte es fabrica al centre de producció més proper a la teva adreça d\'enviament. Això redueix dràsticament les emissions de CO2 del transport i accelera els lliuraments. Tots els centres compleixen amb certificacions de qualitat i sostenibilitat.',
      ],
    },
    {
      bullet: '6. Compte i Privacitat',
      items: [
        'He de crear un compte per comprar? — No. No és obligatori. Pots comprar com a convidat proporcionant només les dades necessàries per a l\'enviament i el pagament. Tanmateix, crear un compte permet seguir les comandes fàcilment, guardar les adreces, crear perfils i accedir a l\'historial de comandes. No enviem publicitat.',
        'Què feu amb les meves dades personals? — Respectem totalment la privacitat. Només utilitzem les dades per processar i enviar les comandes, comunicar-nos sobre les compres i millorar el servei.',
      ],
      note: 'No venem o lloguem les dades de tercers o a tercers. Podeu consultar tots els detalls a la nostra Política de Privacitat, que compleix amb el RGPD.',
    },
    {
      bullet: '7. Contacte',
      paragraph: 'Si tens qualsevol pregunta que no aparegui aquí, pots contactar amb nosaltres:',
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
        title="Preguntes Freqüents (FAQ) | Higgins GRÀFIC"
        description="Respostes a les preguntes més freqüents sobre comandes, enviaments, devolucions, productes i sostenibilitat de Higgins GRÀFIC. Troba respostes ràpides."
        keywords="faq gràfic, preguntes freqüents, ajuda, suport, comandes, enviaments, devolucions"
        type="website"
        url="/faq"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Preguntes Freqüents
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
                Aquí trobaràs respostes a les preguntes més freqüents sobre comandes, enviaments, devolucions, productes i sostenibilitat a Higgins GRÀFIC.
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
                Aquesta FAQ està subjecta, obligatòriament, a la legislació espanyola i europea. Fer servir els nostres serveis equival a l'acceptació, de facto, d'aquesta informació.
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

export default FAQPage;
