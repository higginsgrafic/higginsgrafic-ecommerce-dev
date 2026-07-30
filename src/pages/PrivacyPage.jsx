import React, { useEffect } from 'react';
import SEO from '@/components/SEO';

function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Quina informació recollim',
      items: [
        'Nom',
        'Correu electrònic',
        'Adreça',
        'Número de telèfon',
        'Informació de pagament',
        'Preferències de compra.',
      ],
    },
    {
      bullet: '2. En quins casos es fa servir',
      items: [
        'Processar i complir les comandes.',
        'Comunicació de les comandes i el nostre servei.',
        'Obtenir estadístiques de la botiga.',
        'Millorar els nostres productes i serveis.',
        'Detectar i prevenir fraus.',
        'Complir amb el nostre deure legal.',
      ],
    },
    {
      bullet: '3. Amb qui compartim la informació',
      items: [
        'Proveïdors de serveis que ens ajuden a operar el nostre negoci (pagaments, enviament, hosting, etc.).',
        'Els impressors encarregats de la fabricació i enviament dels productes.',
        'Google Analytics per a les estadístiques del nostre lloc web.',
        'Autoritats legals quan així sigui requerit per llei o per protegir-nos els drets.',
        'No venem ni lloguem informació personal a/o de tercers.',
      ],
    },
    {
      bullet: '4. Fem servir les cookies per',
      items: [
        'Recordar les preferències i configuració.',
        'Entendre com s\'utilitza el nostre lloc web.',
        'Personalitzar el contingut i els anuncis.',
        'Millorar el rendiment del lloc web.',
      ],
      note: 'Podeu gestionar les preferències de cookies a través de la configuració del navegador. Tingueu en compte que deshabilitar certes cookies pot afectar la funcionalitat correcta del lloc web.',
      noteBold: true,
    },
    {
      bullet: '5. Seguretat de les Dades',
      paragraph: 'A Higgins GRÀFIC ens prenem seriosament la seguretat de les dades i hem disposat les mesures, tècniques i organitzatives, adequades per a protegir la informació personal de l\'accés no autoritzat, l\'alteració, la divulgació o la destrucció de les dades dels nostres clients.',
      note: 'Disposem de xifrat SSL per protegir la informació confidencial durant les operacions.',
      noteBold: true,
    },
    {
      bullet: '6. Quins són els teus drets',
      items: [
        'Accés — Demanar una còpia de les dades personals.',
        'Rectificació — Corregir dades inexactes o incompletes.',
        'Supressió — Sol·licitar l\'eliminació de les dades ("dret a l\'oblit").',
        'Restricció — Limitar el tractament de les dades.',
        'Portabilitat — Rebre les dades en un format estructurat.',
        'Oposició — Oposar-vos al tractament de les dades.',
        'No ser objecte de decisions automatitzades.',
      ],
      note: 'Per exercir aquests drets contacteu amb nosaltres a higginsgrafic@gmail.com.',
      noteBold: true,
    },
    {
      bullet: '7. Retenció de Dades',
      paragraph: 'Conservem la informació personal durant el temps necessari per complir amb els fins descrits en aquesta política, tret que la llei requereixi o permeti un període de retenció més llarg.',
      items: [
        'Comandes: 10 anys (obligació fiscal).',
        'Compte: Mentre el compte estigui actiu.',
        'Màrqueting: Fins que retires el consentiment.',
        'Cookies: Segons la configuració del navegador.',
      ],
    },
    {
      bullet: '8. Transferències Internacionals',
      paragraph: 'Les dades poden ser transferides i processades fora de l\'Espai Econòmic Europeu (EEE), incloent:',
      items: [
        'Servidors de Netlify (Estats Units).',
        'Sistemes de Gelato (global).',
        'Stripe (global).',
        'Etc.',
      ],
      note: 'En aquests casos, ens assegurem que es prenguin les mesures adequades per a protegir les dades d\'acord amb el RGPD, com ara les clàusules contractuals aprovades per la Comissió Europea.',
      noteBold: true,
    },
    {
      bullet: '9. Menors d\'Edat',
      paragraph: 'Els nostres serveis no estan dirigits a menors de 16 anys. No obstant, a vegades, és impossible discriminar entre els clients. No recopilem, de forma conscient, cap mena d\'informació personal de menors de 16 anys. Si sou pare/mare o tutor i creieu que el vostre fill ens ha proporcionat informació personal, us preguem que us poseu en contacte amb nosaltres per a poder rescindir les dades.',
    },
    {
      bullet: '10. Canvis a Aquesta Política',
      paragraph: 'Us volem fer avinent que les polítiques de privacitat són susceptibles de rebre canvis o retocs puntuals per tal de reflectir la realitat social o, també, canvis que afectin la nostra operativa ja sigui, per raons legals, per qüestions reguladores, etc. Informarem de qualsevol canvi tot publicant la nova edició en aquesta pàgina i actualitzarem la data de la darrera actualització a la part superior. Recomanem revisar aquesta política, de tant en tant, per estar al dia sobre com protegim la informació.',
    },
    {
      bullet: '11. Contacte',
      paragraph: 'Si teniu preguntes o preocupacions sobre aquesta Política de Privacitat o sobre com gestionem les dades personals ens les podeu fer arribar a:',
      contact: [
        'Higgins GRÀFIC',
        'Carrer Convent, 11',
        'Cardedeu 08440, Barcelona',
        '(a determinar)',
        'higginsgrafic@gmail.com',
      ],
      note: 'També teniu dret a presentar una reclamació davant l\'Agència Espanyola de Protecció de Dades (AEPD) si considereu que el tractament de les dades personals vulnera la normativa aplicable.',
      noteBold: true,
    },
  ];

  return (
    <>
      <SEO
        title="Política de Privacitat | Higgins GRÀFIC"
        description="Política de privacitat de Higgins GRÀFIC. Informació sobre com recopilem, utilitzem i protegim les dades personals segons el RGPD i LOPDGDD."
        keywords="política privacitat higgins gràfic, rgpd, protecció dades, privacitat"
        type="website"
        url="/privacy"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1 whitespace-nowrap">
            Política de Privacitat
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
                A Higgins GRÀFIC, tenim el compromís ferm de protegir la privacitat i les dades personals dels nostres clients. Aquesta Política de Privacitat explica com recopilem, protegim, fem servir i compartim la informació quan utilitzeu el nostre lloc web i els seus serveis, en compliment amb el Reglament General de Protecció de Dades (RGPD) de la Unió Europea i la Llei Orgànica de Protecció de Dades Personals i Garantia dels Drets Digitals de la (LOPDGDD).
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

            {/* AEPD link */}
            <p className="font-roboto text-[10pt] font-light text-gray-700 text-center mt-[-5px] mb-[61px]">
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">www.aepd.es</a>
            </p>

            {/* Footer */}
            <div className="mt-10 self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
              <p className="font-roboto text-[8pt] font-bold text-gray-700 leading-[1.25]">
                Aquesta Política de Privacitat està obligatòriament subjecta a la legislació espanyola i europea. Fer servir els nostres serveis equival a l'acceptació, de facto, de la Política de Privacitat.
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

export default PrivacyPage;
