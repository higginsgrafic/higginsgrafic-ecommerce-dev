import React, { useEffect } from 'react';
import SEO from '@/components/SEO';

function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      bullet: '1. Identificació de l\'Empresa',
      contact: [
        'Higgins GRÀFIC',
        '52161740 V',
        'Carrer Convent, 11, Cardedeu 08440, Barcelona',
        'higginsgrafic@gmail.com (provisional)',
        'higginsgrafic.com',
      ],
      paragraph: 'Higgins GRÀFIC és una marca de roba que comercialitza samarretes i productes tèxtils amb dibuixos de caràcter emocional fabricats sota demanda mitjançant tecnologia d\'impressió digital, DTG.',
    },
    {
      bullet: '2. Objecte i Acceptació',
      items: [
        'Aquestes condicions generals regulen la relació entre Higgins GRÀFIC i els usuaris que accedeixin al lloc web higginsgrafic.com amb la finalitat única de comprar un o més productes.',
        'La navegació pel lloc i la realització de qualsevol comanda implica l\'acceptació plena i sense reserves d\'aquestes condicions, de la política de privacitat i la política de cookies.',
        'Ens reservem el dret de modificar aquestes condicions en qualsevol moment.',
        'Les condicions aplicables seran les vigents en el moment de formalitzar la comanda.',
      ],
    },
    {
      bullet: '3. Productes i Preus',
      paragraph: '3.1 Descripció dels Productes',
      items: [
        'Tots els productes són mostrats amb fotografies i descripcions tan exactes com ens són possibles, tanmateix, els colors poden variar lleugerament segons la pantalla utilitzada.',
        'Els productes són fabricats sota demanda pel nostre proveïdor, Gelato, qui garanteix la qualitat i sostenibilitat dels productes.',
      ],
    },
    {
      bullet: '3.2 Preus',
      items: [
        'Tots els preus inclouen l\'IVA (21% disposat per l\'estat espanyol).',
        'Els preus poden variar sense cap avís.',
        'El preu aplicable és el vigent en el moment de la comanda.',
        'Els costos d\'enviament s\'afegiran al preu del producte.',
      ],
    },
    {
      bullet: '3.3 Disponibilitat',
      paragraph: 'Els productes estan subjectes a disponibilitat. Ens reservem el dret de limitar les quantitats venudes i de discontinuar productes sense avís previ.',
    },
    {
      bullet: '4. Procés de Comanda',
      paragraph: '4.1 Realització de la Comanda — Per fer una comanda has de:',
      items: [
        '1. Seleccionar els productes i afegir-los a la cistella',
        '2. Revisar la cistella i procedir al pagament',
        '3. Proporcionar les dades personals i d\'enviament',
        '4. Seleccionar el mètode de pagament',
        '5. Revisar i confirmar la comanda',
      ],
    },
    {
      bullet: '4.2 Confirmació',
      paragraph: 'Un cop rebut el pagament, us enviarem un correu de confirmació amb:',
      items: [
        'Número de comanda',
        'Detalls dels productes',
        'Adreça d\'enviament',
        'Import total',
        'Temps estimat d\'enviament',
      ],
    },
    {
      bullet: '4.3 Contracte',
      paragraph: 'El contracte de compravenda es considerarà formalitzat quan rebis l\'email de confirmació de la comanda.',
    },
    {
      bullet: '5. Pagament',
      paragraph: '5.1 Mètodes de Pagament — Acceptem pagaments amb:',
      items: [
        'Targetes de crèdit/dèbit (Visa, Mastercard, American Express)',
        'Altres mètodes habilitats a través de Stripe',
      ],
    },
    {
      bullet: '5.2 Seguretat',
      paragraph: 'Tots els pagaments es processen de forma segura a través de Stripe, que compleix amb els estàndards PCI DSS. No emmagatzemem les dades de la targeta als nostres servidors.',
    },
    {
      bullet: '5.3 Facturació',
      paragraph: 'Rebreu una factura electrònica per correu un cop s\'hagi processat el pagament. Si necessiteu una factura amb dades fiscals específiques, indiqueu-ho abans de finalitzar la comanda.',
    },
    {
      bullet: '6. Enviament i Lliurament',
      paragraph: '6.1 Àrea d\'Enviament — Enviem a tots els països de la Unió Europea i seleccionats internacionalment a través de Gelato.',
    },
    {
      bullet: '6.2 Costos d\'Enviament',
      items: [
        'Enviament GRATUÏT per comandes superiors a 50€ (a Espanya)',
        'Per comandes inferiors: segons destinació (calculat al pagament)',
        'Enviaments internacionals: segons país de destinació',
      ],
    },
    {
      bullet: '6.3 Temps de Lliurament',
      paragraph: 'Els temps de lliurament estimats són:',
      items: [
        'Producció: 2-5 dies laborables (print-on-demand)',
        'Enviament Espanya: 3-5 dies laborables',
        'Enviament UE: 5-10 dies laborables',
        'Enviament Internacional: 10-15 dies laborables',
      ],
    },
    {
      bullet: '6.4 Seguiment',
      paragraph: 'Rebreu un número de seguiment per correu quan la comanda s\'enviï.',
    },
    {
      bullet: '6.5 Lliuraments Fallits',
      paragraph: 'Si no es pot lliurar la comanda per:',
      items: [
        'Adreça incorrecta o incompleta',
        'Absència del destinatari en diversos intents',
        'Rebuig del paquet',
      ],
      note: 'L\'article es retornarà i això pot ocasionar costos addicionals de reenviament o cancel·lació de la comanda.',
      noteBold: true,
    },
    {
      bullet: '7. Dret de Desistiment (14 dies)',
      paragraph: '7.1 Termini — Segons la normativa europea de protecció dels consumidors, tens 14 dies naturals des de la recepció del producte per desistir de la compra sense necessitat de justificació.',
    },
    {
      bullet: '7.2 Com Exercir el Dret',
      paragraph: 'Per exercir el dret de desistiment has de:',
      items: [
        '1. Notificar-nos per email a higginsgrafic@gmail.com',
        '2. Indicar número de comanda i producte(s) a retornar',
        '3. Enviar el producte en condicions originals',
      ],
    },
    {
      bullet: '7.3 Condicions de Devolució',
      items: [
        'El producte ha d\'estar sense usar i amb les etiquetes originals',
        'Ha d\'estar en el seu embalatge original',
        'No s\'accepten devolucions de productes personalitzats (si aplica)',
      ],
    },
    {
      bullet: '7.4 Reemborsament',
      items: [
        'Reemborsament en un màxim de 14 dies des de la recepció de la devolució',
        'Reemborsament pel mateix mètode de pagament utilitzat',
        'Costos d\'enviament de devolució a càrrec del client (tret de defecte)',
        'No es reemborsaran els costos d\'enviament originals',
      ],
    },
    {
      bullet: '8. Garantia i Defectes',
      paragraph: '8.1 Garantia Legal — Tots els productes tenen una garantia legal de 2 anys contra defectes de fabricació, segons la legislació espanyola i europea.',
    },
    {
      bullet: '8.2 Productes Defectuosos',
      paragraph: 'Si el producte arriba amb defectes o danys:',
      items: [
        '1. Notifica\'ns en un màxim de 7 dies des de la recepció',
        '2. Envia fotos del defecte a higginsgrafic@gmail.com',
        '3. T\'enviarem un reemplaçament sense cost addicional',
      ],
    },
    {
      bullet: '8.3 Errors en la Comanda',
      paragraph: 'Si reps un producte incorrecte per error nostre, ens farem càrrec de:',
      items: [
        'El cost del reenviament del producte correcte',
        'El cost de devolució del producte incorrecte',
      ],
    },
    {
      bullet: '8.4 Exclusions',
      paragraph: 'La garantia no cobreix:',
      items: [
        'Danys causats per ús inadequat',
        'Desgast normal del producte',
        'Alteracions o reparacions no autoritzades',
      ],
    },
    {
      bullet: '9. Propietat Intel·lectual',
      paragraph: '9.1 Drets d\'Autor — Tots els dissenys, logotips, textos, imatges i altres elements del Lloc Web són propietat exclusiva de GRÀFIC o dels seus llicenciadors i estan protegits per les lleis de propietat intel·lectual.',
    },
    {
      bullet: '9.2 Ús Permès',
      paragraph: 'L\'ús del Lloc Web t\'atorga una llicència limitada, no exclusiva i no transferible per:',
      items: [
        'Navegar pel Lloc Web',
        'Comprar productes per a ús personal',
        'Visualitzar contingut',
      ],
    },
    {
      bullet: '9.3 Prohibicions',
      paragraph: 'Queda prohibit:',
      items: [
        'Reproduir, distribuir o modificar contingut sense autorització',
        'Utilitzar dissenys per a fins comercials sense llicència',
        'Fer enginyeria inversa del Lloc Web',
        'Extreure dades de forma automatitzada (scraping)',
      ],
    },
    {
      bullet: '10. Protecció de Dades',
      paragraph: '10.1 — El tractament de les dades personals es regeix per la nostra Política de Privacitat, que forma part integrant d\'aquestes Condicions Generals.',
    },
    {
      bullet: '10.2 Acceptació del Tractament',
      paragraph: 'En fer servir aquest Lloc Web i fer comandes, accepteu el tractament de les dades segons s\'especifica a la Política de Privacitat, en compliment del RGPD i la LOPDGDD.',
    },
    {
      bullet: '10.3 Exercici de Drets',
      paragraph: 'Per exercir els drets (accés, rectificació, supressió, etc.), contacteu amb nosaltres a higginsgrafic@gmail.com',
    },
    {
      bullet: '11. Responsabilitat',
      paragraph: '11.1 Limitació de Responsabilitat — GRÀFIC no serà responsable de:',
      items: [
        'Interrupcions o errors del Lloc Web per causes tècniques',
        'Danys derivats de virus o programari maliciós',
        'Ús inadequat dels productes',
        'Casos de força major',
      ],
    },
    {
      bullet: '11.2 Disponibilitat del Lloc Web',
      paragraph: 'Ens esforcem per mantenir el Lloc Web disponible 24/7, però no garantim que estigui lliure d\'errors o interrupcions. Ens reservem el dret de suspendre o modificar el servei per manteniment.',
    },
    {
      bullet: '11.3 Enllaços Externos',
      paragraph: 'El Lloc Web podrà contenir enllaços a llocs web de tercers. No som responsables del contingut o polítiques de privacitat d\'aquests llocs.',
    },
    {
      bullet: '12. Resolució de Conflictes',
      paragraph: '12.1 Llei Aplicable — Aquestes Condicions Generals es regeixen per la legislació de l\'estat espanyol i la Unió Europea.',
    },
    {
      bullet: '12.2 Resolució Extrajudicial',
      paragraph: 'Com a consumidor pots accedir a la plataforma europea de resolució de litigis en línia: https://ec.europa.eu/consumers/odr',
    },
    {
      bullet: '12.3 Jurisdicció',
      paragraph: 'Per qualsevol controvèrsia derivada d\'aquestes Condicions, les parts se sotmeten als jutjats i tribunals que corresponguin segons la legislació de protecció dels consumidors.',
    },
    {
      bullet: '13. Disposicions Generals',
      paragraph: '13.1 Idioma — Aquestes Condicions Generals estan redactades en català. En cas de traducció a altres idiomes, prevaldrà la versió en català.',
    },
    {
      bullet: '13.2 Nul·litat Parcial',
      paragraph: 'Si alguna clàusula d\'aquestes Condicions fos declarada nul·la o no aplicable, la resta de clàusules continuaran vigents.',
    },
    {
      bullet: '13.3 Renúncia',
      paragraph: 'La manca d\'exigència del compliment d\'alguna clàusula no constitueix una renúncia als nostres drets.',
    },
    {
      bullet: '13.4 Comunicacions',
      paragraph: 'Totes les comunicacions relacionades amb comandes s\'enviaran per email a l\'adreça proporcionada durant el procés de compra.',
    },
    {
      bullet: '14. Contacte',
      paragraph: 'Per qualsevol qüestió relacionada amb aquestes Condicions Generals o amb les comandes, podeu contactar amb nosaltres a: higginsgrafic@gmail.com',
      note: 'Ens comprometem a respondre les consultes en un màxim de 48 hores laborables.',
      noteBold: true,
    },
  ];

  return (
    <>
      <SEO
        title="Termes i Condicions | Higgins GRÀFIC"
        description="Termes i condicions de Higgins GRÀFIC. Informació sobre les condicions d'ús del nostre lloc web i serveis."
        keywords="termes condicions higgins gràfic, ús, serveis"
        type="website"
        url="/terms"
      />

      <div
        className="min-h-screen bg-white relative"
      >
        {/* Top spacer for fixed header */}
        <div className="pt-[129px] lg:pt-[145px] relative" style={{ zIndex: 1 }} />

        {/* Title + subtitle — centered, outside columns */}
        <div className="mx-auto px-6 lg:px-8 relative text-right w-fit" style={{ zIndex: 1, maxWidth: '1100px' }}>
          <h1 className="font-roboto text-[30pt] font-normal uppercase text-[#141414] mb-1">
            Termes i Condicions
          </h1>
          <p className="font-roboto text-[10pt] font-normal text-gray-500 mb-40">
            Darrera actualització, juliol 2026
          </p>
        </div>

        {/* Background wrapper — only around the two columns with margin */}
        <div
          className="relative"
          style={{
            backgroundImage: 'url(/_TMP/SERVEIS/serveis-fons.png)',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: '102% 100%',
            backgroundAttachment: 'scroll',
            paddingTop: '100px',
            paddingBottom: '0px',
          }}
        >

        {/* Document — two columns, 100px gap */}
        <div className="mx-auto px-6 lg:px-8 relative flex gap-[100px]" style={{ zIndex: 1, maxWidth: '1100px' }}>
          {/* Left column */}
          <div className="flex-1 min-w-0">
            {/* Intro */}
            <div className="mb-10 self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[26px]">
              <p className="font-roboto text-[8pt] font-bold text-gray-800 leading-[1.25] text-justify" style={{ hyphens: 'auto', WebkitHyphens: 'auto' }}>
                Us recomanem que llegiu amb atenció aquestes Condicions Generals abans de fer una comanda, ja que fer servir els nostres serveis equival a l'acceptació, de facto, de totes elles. Dites Condicions Generals estan dissenyades per protegir tant els teus drets com a consumidor com els nostres com a empresa en el compliment de la legislació vigent.
              </p>
            </div>

            {/* Sections 0-17 */}
            {sections.slice(0, 18).map((section, i) => (
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

          {/* Right column */}
          <div className="flex-1 min-w-0">
            {/* Sections 18+ */}
            {sections.slice(18).map((section, i) => (
              <div key={i + 18} className="mb-7">
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
                Aquests Termes i Condicions constitueixen un acord legal vinculant entre vós i Higgins GRÀFIC. Si teniu qualsevol dubte sobre aquestes condicions, si us plau, contacteu amb nosaltres abans de fer una comanda. La satisfacció i confiança són la nostra prioritat.
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

export default TermsPage;
