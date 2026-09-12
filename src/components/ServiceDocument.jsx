import { useEffect } from 'react';
import MobileFooter from '@/components/MobileFooter';

export default function ServiceDocument({ title, updated, intro, sections, closing }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#141414]">
      <header className="px-4 pb-12 pt-20 text-center sm:pb-16 sm:pt-24">
        <h1 className="font-roboto text-[clamp(24px,7vw,40px)] font-normal uppercase leading-tight">{title}</h1>
        <p className="mt-2 font-roboto text-[10pt] text-gray-500">{updated}</p>
      </header>

      <main className="bg-[#f3f5f5] px-4 py-12 sm:px-6 sm:py-16">
        <article className="mx-auto w-full max-w-[500px]">
          {intro && <div className="mb-10 rounded-md border border-[#DFEBED] bg-white p-5 sm:p-[26px]">
            <p className="text-justify font-roboto text-[8pt] font-bold leading-[1.35] text-gray-800" style={{ hyphens: 'auto', WebkitHyphens: 'auto' }}>{intro}</p>
          </div>}

          {sections.map((section) => (
            <section key={section.bullet || section.intro} className="mb-8">
              {section.intro && <div className="mb-10 rounded-md border border-[#DFEBED] bg-white p-5 sm:p-[26px]"><p className="text-justify font-roboto text-[8pt] font-bold leading-[1.35] text-gray-800" style={{ hyphens: 'auto', WebkitHyphens: 'auto' }}>{section.intro}</p></div>}
              {section.bullet && (
              <h2 className="flex items-start gap-2 font-roboto text-[10pt] font-normal">
                <span>•</span>
                <span>{section.bullet}</span>
              </h2>
              )}
              {section.paragraph && <p className="mb-2 pl-5 font-roboto text-[10pt] font-light leading-[1.5] text-gray-700">{section.paragraph}</p>}
              {section.formula && <code className="ml-5 mt-2 block overflow-x-auto rounded bg-white px-3 py-2 font-roboto text-[9pt] text-gray-800">{section.formula}</code>}
              {section.table && (
                <div className="mt-2 overflow-x-auto pl-5">
                  <table className="w-full min-w-[390px] border-collapse">
                    <thead><tr className="border-b border-gray-300">{section.table.headers.map((header) => <th key={header} className="px-2 py-1 text-left font-roboto text-[8pt] font-normal">{header}</th>)}</tr></thead>
                    <tbody>{section.table.rows.map((row) => <tr key={row.join('-')} className="border-b border-gray-200">{row.map((cell, index) => <td key={`${cell}-${index}`} className={`px-2 py-1 font-roboto text-[8pt] ${index === 0 ? 'font-normal' : 'font-light text-gray-700'}`}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
              {section.zones && <div className="mt-3 pl-5">{section.zones.map((zone) => <div key={zone.title} className="mb-5"><p className="mb-1 font-roboto text-[9pt] font-bold text-gray-800">{zone.title} <span className="font-light text-gray-500">({zone.time} dies)</span></p><table className="w-full table-fixed border-collapse"><thead><tr className="border-b border-gray-300"><th className="w-[44%] py-[2px] pr-1 text-left text-[6pt] font-normal text-gray-500">País</th><th className="w-[18%] py-[2px] px-1 text-right text-[6pt] font-normal text-gray-500">1a peça</th><th className="w-[20%] py-[2px] px-1 text-right text-[6pt] font-normal text-gray-500">Addicional</th><th className="w-[18%] py-[2px] pl-1 text-right text-[6pt] font-normal text-gray-500">Gratuït</th></tr></thead><tbody>{zone.countries.map((country) => <tr key={country.name} className="border-b border-gray-200"><td className="py-[2px] pr-1 text-[7pt] font-light text-gray-700 truncate">{country.name}</td><td className="py-[2px] px-1 text-right text-[7pt] text-gray-700" style={{ fontVariantNumeric: 'tabular-nums' }}>{country.first}€</td><td className="py-[2px] px-1 text-right text-[7pt] font-light text-gray-700" style={{ fontVariantNumeric: 'tabular-nums' }}>{country.additional}€</td><td className={`py-[2px] pl-1 text-right text-[7pt] font-light ${country.free ? 'text-green-600' : 'text-gray-400'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>{country.free ? `${country.free}€` : '—'}</td></tr>)}</tbody></table></div>)}</div>}
              {section.items && <ul className="pl-5">{section.items.map((item) => <li key={item} className="flex items-start gap-2 font-roboto text-[10pt] font-light leading-[1.5] text-gray-700"><span>-</span><span>{item}</span></li>)}</ul>}
              {section.contact && <div className="my-10 rounded-md border border-[#DFEBED] bg-white p-5 text-center sm:my-[66px] sm:p-[26px]"><div className="inline-block text-left">{section.contact.map((line, index) => <p key={line} className={`font-roboto text-[10pt] leading-[1.5] text-gray-700 ${index === 0 ? 'font-normal' : 'font-light'}`}>{line}</p>)}</div>{section.socialButtons && <div className="mt-5 flex items-center justify-center gap-3 border-t border-[#E6E8EC] pt-5"><a href={section.socialButtons.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-roboto text-[9pt] font-normal text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#25D366' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>WhatsApp</a><a href={section.socialButtons.telegram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-roboto text-[9pt] font-normal text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#0088CC' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.531 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>Telegram</a></div>}</div>}
              {section.note && <div className={section.noteBold ? 'my-10 rounded-md border border-[#DFEBED] bg-white p-5 sm:my-[66px] sm:p-[26px]' : 'pl-5'}><p className={`font-roboto leading-[1.5] text-gray-700 ${section.noteBold ? 'text-[8pt] font-medium' : 'text-[10pt] font-light'}`}>{section.note}</p></div>}
            </section>
          ))}

          {closing && <div className="mt-10 rounded-md border border-[#DFEBED] bg-white p-5 sm:p-[26px]"><p className="font-roboto text-[8pt] font-bold leading-[1.35] text-gray-700">{closing}</p></div>}
        </article>
      </main>

      <div className="h-24 sm:h-40" />
      <MobileFooter />
    </div>
  );
}
