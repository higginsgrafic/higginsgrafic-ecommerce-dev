import React, { useEffect } from 'react';
import SEO from '@/components/SEO';
import { faqShippingZones as shippingZones } from './FAQPage';

// Banderes amb tintes planes (SVG inline, sense gradients ni textures)
export const Flag = ({ code, size = 14 }) => {
  const flags = {
    ES: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="5" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/><rect y="15" width="30" height="5" fill="#AA151B"/></svg>,
    IT: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#F1F2F1"/><rect x="20" width="10" height="20" fill="#CE2B37"/></svg>,
    FR: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="10" height="20" fill="#0055A4"/><rect x="10" width="10" height="20" fill="#F1F2F1"/><rect x="20" width="10" height="20" fill="#EF4135"/></svg>,
    DE: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#1A1A1A"/><rect y="6.67" width="30" height="6.67" fill="#DD0000"/><rect y="13.33" width="30" height="6.67" fill="#FFCE00"/></svg>,
    IE: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="10" height="20" fill="#169B62"/><rect x="10" width="10" height="20" fill="#F1F2F1"/><rect x="20" width="10" height="20" fill="#FF883E"/></svg>,
    GB: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#012169"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#F1F2F1" strokeWidth="3"/><path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="1.5"/><rect x="12" width="6" height="20" fill="#F1F2F1"/><rect y="7" width="30" height="6" fill="#F1F2F1"/><rect x="13" width="4" height="20" fill="#C8102E"/><rect y="8" width="30" height="4" fill="#C8102E"/></svg>,
    SE: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#006AA7"/><rect x="9" width="4" height="20" fill="#FECC00"/><rect y="8" width="30" height="4" fill="#FECC00"/></svg>,
    DK: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#C8102E"/><rect x="10" width="4" height="20" fill="#F1F2F1"/><rect y="8" width="30" height="4" fill="#F1F2F1"/></svg>,
    NO: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#EF2B2D"/><rect x="9" width="6" height="20" fill="#F1F2F1"/><rect y="7" width="30" height="6" fill="#F1F2F1"/><rect x="11" width="2" height="20" fill="#002868"/><rect y="9" width="30" height="2" fill="#002868"/></svg>,
    IS: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#003897"/><rect x="6" width="4" height="20" fill="#F1F2F1"/><rect y="8" width="30" height="4" fill="#F1F2F1"/><rect x="7" width="2" height="20" fill="#D72828"/><rect y="9" width="30" height="2" fill="#D72828"/></svg>,
    LI: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="10" fill="#002B7F"/><rect y="10" width="30" height="10" fill="#CE1126"/></svg>,
    CH: <svg width={size} height={size * 0.667} viewBox="0 0 20 20"><rect width="20" height="20" fill="#D52B1E"/><rect x="8" y="4" width="4" height="12" fill="#F1F2F1"/><rect x="4" y="8" width="12" height="4" fill="#F1F2F1"/></svg>,
    PT: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="12" height="20" fill="#006600"/><rect x="12" width="18" height="20" fill="#FF0000"/><circle cx="12" cy="10" r="3" fill="#FFD700"/></svg>,
    BE: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="10" height="20" fill="#1A1A1A"/><rect x="10" width="10" height="20" fill="#FDDA24"/><rect x="20" width="10" height="20" fill="#EF3340"/></svg>,
    NL: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#AE1C28"/><rect y="6.67" width="30" height="6.67" fill="#F1F2F1"/><rect y="13.33" width="30" height="6.67" fill="#21468B"/></svg>,
    AT: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#ED2939"/><rect y="6.67" width="30" height="6.67" fill="#F1F2F1"/><rect y="13.33" width="30" height="6.67" fill="#ED2939"/></svg>,
    PL: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="10" fill="#F1F2F1"/><rect y="10" width="30" height="10" fill="#DC143C"/></svg>,
    CZ: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="10" fill="#F1F2F1"/><rect y="10" width="30" height="10" fill="#D7141A"/><path d="M0,0 L15,10 L0,20 Z" fill="#11457E"/></svg>,
    HU: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#CD2A3E"/><rect y="6.67" width="30" height="6.67" fill="#F1F2F1"/><rect y="13.33" width="30" height="6.67" fill="#436F4D"/></svg>,
    HR: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#FF0000"/><rect y="6.67" width="30" height="6.67" fill="#F1F2F1"/><rect y="13.33" width="30" height="6.67" fill="#171796"/></svg>,
    SK: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#0B4EA2"/><rect y="6.67" width="30" height="6.67" fill="#F1F2F1"/><rect y="13.33" width="30" height="6.67" fill="#EE1C25"/></svg>,
    SI: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#F1F2F1"/><rect y="6.67" width="30" height="6.67" fill="#003399"/><rect y="13.33" width="30" height="6.67" fill="#CC0000"/></svg>,
    BG: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#D62612"/><rect y="6.67" width="30" height="6.67" fill="#00966E"/><rect y="13.33" width="30" height="6.67" fill="#F1F2F1"/></svg>,
    RO: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="10" height="20" fill="#002B7F"/><rect x="10" width="10" height="20" fill="#FCD116"/><rect x="20" width="10" height="20" fill="#CE1126"/></svg>,
    GR: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#0D5EAF"/><rect y="4" width="30" height="2" fill="#F1F2F1"/><rect y="8" width="30" height="2" fill="#0D5EAF"/><rect y="10" width="30" height="2" fill="#F1F2F1"/><rect y="14" width="30" height="2" fill="#0D5EAF"/><rect y="16" width="30" height="2" fill="#F1F2F1"/><rect width="12" height="12" fill="#0D5EAF"/><rect x="4" width="4" height="12" fill="#F1F2F1"/><rect y="4" width="12" height="4" fill="#F1F2F1"/></svg>,
    FI: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#F1F2F1"/><rect x="8" width="4" height="20" fill="#003580"/><rect y="8" width="30" height="4" fill="#003580"/></svg>,
    EE: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#0072CE"/><rect y="6.67" width="30" height="6.67" fill="#1A1A1A"/><rect y="13.33" width="30" height="6.67" fill="#FECC00"/></svg>,
    LV: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="10" fill="#9E3039"/><rect y="10" width="30" height="10" fill="#F1F2F1"/></svg>,
    LT: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#FDB913"/><rect y="6.67" width="30" height="6.67" fill="#006A44"/><rect y="13.33" width="30" height="6.67" fill="#C1272D"/></svg>,
    LU: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="10" height="20" fill="#00A3E0"/><rect x="10" width="10" height="20" fill="#F1F2F1"/><rect x="20" width="10" height="20" fill="#ED2939"/></svg>,
    MT: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="15" height="20" fill="#F1F2F1"/><rect x="15" width="15" height="20" fill="#CF142B"/></svg>,
    CY: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#F1F2F1"/><rect x="4" y="4" width="22" height="12" fill="#D57800"/></svg>,
    AD: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#003399"/><rect y="6.67" width="30" height="6.67" fill="#FFCC00"/><rect y="13.33" width="30" height="6.67" fill="#CC0000"/></svg>,
    US: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#B22234"/><rect y="1.54" width="30" height="1.54" fill="#F1F2F1"/><rect y="4.62" width="30" height="1.54" fill="#F1F2F1"/><rect y="7.69" width="30" height="1.54" fill="#F1F2F1"/><rect y="10.77" width="30" height="1.54" fill="#F1F2F1"/><rect y="13.85" width="30" height="1.54" fill="#F1F2F1"/><rect y="16.92" width="30" height="1.54" fill="#F1F2F1"/><rect width="12" height="10.77" fill="#3C3B6E"/></svg>,
    CA: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#FF0000"/><rect x="6" width="18" height="20" fill="#F1F2F1"/></svg>,
    AU: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#012169"/><rect width="15" height="10" fill="#012169"/></svg>,
    NZ: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#012169"/><rect x="6" width="4" height="20" fill="#F1F2F1"/><rect y="8" width="30" height="4" fill="#F1F2F1"/></svg>,
    BR: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#009C3B"/><rect x="3" y="3" width="24" height="14" fill="#FFDF00"/><circle cx="15" cy="10" r="4" fill="#002776"/></svg>,
    SG: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="10" fill="#EF3340"/><rect y="10" width="30" height="10" fill="#F1F2F1"/></svg>,
    JP: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#F1F2F1"/><circle cx="15" cy="10" r="6" fill="#BC002D"/></svg>,
    EU: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#003399"/><circle cx="15" cy="10" r="4" fill="#FFCC00"/></svg>,
    HN: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="6.67" fill="#0073CF"/><rect y="6.67" width="30" height="6.67" fill="#F1F2F1"/><rect y="13.33" width="30" height="6.67" fill="#0073CF"/><circle cx="15" cy="10" r="2.5" fill="#0073CF"/></svg>,
    DO: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="15" height="10" fill="#002D62"/><rect x="15" y="0" width="15" height="10" fill="#CE1126"/><rect y="10" width="15" height="10" fill="#CE1126"/><rect x="15" y="10" width="15" height="10" fill="#F1F2F1"/><circle cx="15" cy="10" r="2.5" fill="#F1F2F1" stroke="#002D62" strokeWidth="0.5"/></svg>,
    NI: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="10" height="20" fill="#0067B9"/><rect x="10" width="10" height="20" fill="#F1F2F1"/><rect x="20" width="10" height="20" fill="#0067B9"/></svg>,
    BD: <svg width={size} height={size * 0.667} viewBox="0 0 30 20"><rect width="30" height="20" fill="#006A4E"/><circle cx="12" cy="10" r="5" fill="#F42A41"/></svg>,
  };
  return flags[code] || null;
};

function ShippingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const zones = shippingZones;

  const sections = [
    {
      bullet: '1. Producció sota demanda',
      paragraph: "Cada peça és elaborada sota demanda per evitar el malbaratament del material i totes les conseqüències que se'n deriven. Això vol dir que cada producte només entra en producció després de fer la comanda. El temps de producció dependrà de la logística del proveïdor, però l'estimació és de 2 a 5 dies laborables.",
    },
    {
      bullet: "2. Com es calcula l'enviament",
      paragraph: "Treballem amb Gelato, que aplica tarifes planes d'enviament per àrea geogràfica. Dins de cada zona, el cost és el mateix per a tots els països. El càlcul es fa segons la fórmula:",
      formula: 'Enviament = 1a peça + (peça addicional × (quantitat − 1))',
      note: "Si el subtotal de la comanda supera el llindar de la zona, l'enviament és gratuït.",
    },
    {
      bullet: '3. Temps i costos per destinació',
      zonesTable: true,
      note: "Els temps de lliurament són estimacions en dies laborables i inclouen producció (2-5 dies) + enviament. El temps real pot variar segons la disponibilitat del centre de producció, la logística del transportista i circumstàncies excepcionals. Per a una estimació exacta, pots consultar el checkout abans de finalitzar la comanda.",
      noteBold: true,
    },
    {
      bullet: '4. Seguiment de comanda',
      paragraph: "Rebreu un correu amb el número de seguiment tan aviat com el paquet s'enviï. Podreu veure l'estat de la comanda en temps real a través de l'enllaç proporcionat.",
      note: 'El número de seguiment pot trigar 24-48h a activar-se al sistema del transportista.',
      noteBold: true,
    },
    {
      bullet: '5. Dret de desistiment',
      paragraph: "Tens 14 dies naturals des de la recepció del producte per tornar-lo sense necessitat de donar cap explicació, segons la normativa europea de protecció del consumidor.",
    },
    {
      bullet: '6. Com cal fer una devolució',
      items: [
        'Contacta amb nosaltres — Envieu un correu a higginsgrafic@gmail.com amb el número de comanda i (opcional) el motiu de la devolució.',
        "Prepara el Paquet — El producte ha d'estar en condicions originals: sense usar, amb etiquetes i en el seu embalatge original.",
        "Envia el Producte — Us enviarem les instruccions d'enviament. Els costos de devolució van a càrrec vostre (tret per defecte del producte).",
        "Reemborsament — Un cop rebem i validem la devolució, processem el reemborsament en un màxim de 14 dies pel mateix mètode de pagament.",
      ],
    },
    {
      bullet: '7. Canvis de talla',
      paragraph: "A causa del nostre sistema de producció -sota demanda- no ens és possible fer canvis directes. El procediment és el següent:",
      items: [
        'Tornar el producte seguint el procés de devolució',
        'Fer una nova comanda amb la talla correcta',
      ],
      note: 'Consell: Consulta la nostra Size Guide abans de comprar per evitar canvis de talla.',
      noteBold: true,
    },
    {
      bullet: '8. Productes defectuosos o fets malbé',
      paragraph: "Si el producte arriba amb defectes de fabricació o desperfectes de cap mena:",
      items: [
        'Contacta amb nosaltres en un màxim de 7 dies a higginsgrafic@gmail.com',
        'Envia\'ns fotos clares del defecte o desperfecte.',
        'Us enviarem un reemplaçament de franc.',
        'No cal que torneu el producte defectuós o fet malbé.',
      ],
      note: "Els costos d'enviament del reemplaçament van totalment a càrrec nostre.",
      noteBold: true,
    },
  ];

  return (
    <>
      <SEO
        title="Enviaments i Devolucions | Higgins GRÀFIC"
        description="Informació sobre enviaments, temps de lliurament, costos i política de devolucions de Higgins GRÀFIC. Producció sota demanda amb Gelato. Devolucions en 14 dies."
        keywords="enviaments gràfic, devolucions, tarifes gelato, enviament gratuït, temps lliurament, política devolucions"
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
            Darrera actualització, agost 2026
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
                {section.formula && (
                  <div className="pl-5 mb-2">
                    <code className="font-roboto text-[9pt] font-normal text-[#141414] bg-[#F5F5F7] px-2 py-1 rounded">
                      {section.formula}
                    </code>
                  </div>
                )}
                {section.zonesTable && (
                  <div className="pl-5 mb-2">
                    {zones.map((zone, zi) => (
                      <div key={zi} className="mb-4">
                        <p className="font-roboto text-[9pt] font-bold text-gray-800 mb-1">
                          {zone.title} <span className="font-light text-gray-500">({zone.time} dies)</span>
                        </p>
                        <p className="font-roboto text-[8pt] font-light text-gray-500 mb-2">
                          {zone.desc}
                        </p>
                        <table className="w-full mb-2" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                          <colgroup>
                            <col style={{ width: '44%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '22%' }} />
                            <col style={{ width: '16%' }} />
                          </colgroup>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #E6E8EC' }}>
                              <th className="font-roboto text-[7pt] font-normal text-gray-500 text-left py-1">País</th>
                              <th className="font-roboto text-[7pt] font-normal text-gray-500 text-right py-1">1a peça</th>
                              <th className="font-roboto text-[7pt] font-normal text-gray-500 text-right py-1">Addicional</th>
                              <th className="font-roboto text-[7pt] font-normal text-gray-500 text-right py-1">Gratuït</th>
                            </tr>
                          </thead>
                          <tbody>
                            {zone.countries.map((c, ci) => (
                              <tr key={ci} style={{ borderBottom: '1px solid #F0F0F0' }}>
                                <td className="font-roboto text-[8pt] font-light text-gray-700 py-1">
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', verticalAlign: 'middle' }}>
                                    <Flag code={c.code} />
                                    {c.name}
                                  </span>
                                </td>
                                <td className="font-roboto text-[8pt] font-normal text-gray-700 text-right py-1" style={{ fontVariantNumeric: 'tabular-nums' }}>{c.first}€</td>
                                <td className="font-roboto text-[8pt] font-light text-gray-700 text-right py-1" style={{ fontVariantNumeric: 'tabular-nums' }}>{c.additional}€</td>
                                <td className="font-roboto text-[8pt] font-light text-right py-1" style={{ color: c.free ? '#00a651' : '#999', fontVariantNumeric: 'tabular-nums' }}>
                                  {c.free ? `${c.free}€` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
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
                {section.note && section.noteBold && (
                  <div className="mt-[66px] mb-[66px] self-center w-[500px] bg-white border border-[#DFEBED] rounded-md p-[20px]">
                    <p className="font-roboto text-[8pt] font-medium leading-[1.3] text-gray-700">
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
