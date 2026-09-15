import { ISSUER, issuerLine } from '@/config/issuer';

/**
 * El full de factura, amb el disseny de l'amo.
 *
 * PER QUÈ ÉS UN COMPONENT I NO DUES PÀGINES
 *
 * Aquest disseny existia en tres llocs: `docs/model-factura.html` (el model que
 * va dissenyar l'amo), `src/pages/InvoicePage.jsx` (la factura de debò) i la
 * previsualització de l'editor. Els dos primers coincidien; el tercer no,
 * perquè tenia la seva pròpia taula amb Base, Transport i IVA en columnes
 * separades, en comptes del `Base + Transport + IVA` del model.
 *
 * Tres còpies del mateix document és una còpia que divergirà. Ara n'hi ha una
 * de sola: quan l'amo canviï el disseny, es canvia aquí i ho veuen tots dos
 * llocs alhora.
 */

export const IVA_RATE = 0.21;
export const r2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
export const eur = (value) => new Intl.NumberFormat('ca-ES', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
}).format(r2(value));

export function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('ca-ES').format(d);
}

/**
 * El transport d'una factura es reparteix per unitat: la primera peça paga la
 * tarifa sencera i les altres la reduïda. Com que la tarifa exacta no es desa a
 * cap lloc, es dedueix del total: es proven les parelles conegudes fins que la
 * suma quadra amb el que hi ha desat.
 *
 * L'última línia s'ajusta uns cèntims si cal, perquè la suma de les línies ha
 * de donar exactament la base del transport desada. En un document fiscal els
 * cèntims no poden ballar.
 */
export function reparteixTransport(quantitats, transportNet) {
  const total = r2(transportNet);
  const unitats = quantitats.reduce((a, b) => a + b, 0);
  if (unitats === 0 || total === 0) return quantitats.map(() => 0);

  const parelles = [
    [3.55, 1.15], [3.55, 1.15], [3.63, 1.15], [3.46, 1.07],
    [3.30, 1.03], [3.07, 0.92], [3.95, 1.26], [3.90, 1.11],
    [6.18, 1.81], [3.48, 0.69],
  ];
  let primera = null;
  let addicional = null;
  for (const [f, a] of parelles) {
    if (r2(f + (unitats - 1) * a) === total) { primera = f; addicional = a; break; }
  }
  if (primera == null) {
    // Cap tarifa coneguda hi quadra: es reparteix a parts iguals.
    primera = addicional = r2(total / unitats);
  }

  const linies = [];
  let restant = total;
  let unitatsRestants = unitats;
  for (const q of quantitats) {
    let suma = 0;
    for (let k = 0; k < q; k++) {
      const esPrimera = linies.length === 0 && k === 0;
      const valor = esPrimera ? primera : addicional;
      suma += valor;
      restant = r2(restant - valor);
      unitatsRestants--;
    }
    if (unitatsRestants === 0) suma = r2(suma + restant);  // ajust de cèntims
    linies.push(r2(suma));
  }
  return linies;
}

/**
 * Converteix les línies d'una factura o d'un esborrany en el que el full
 * necessita: nom, detalls, quantitat i el desglossament base + transport + IVA.
 */
export function liniesDelDocument(doc) {
  const items = Array.isArray(doc?.items) ? doc.items : [];
  const quantitats = items.map((i) => Math.max(1, Number(i.quantity) || 1));
  const transports = reparteixTransport(quantitats, doc?.base_shipping);

  return items.map((item, idx) => {
    const qty = quantitats[idx];
    const transport = r2(transports[idx]);
    // Els imports escrits a mà (l'editor) ja porten l'IVA a dins; els de la
    // botiga també. La diferència és d'on surt el preu.
    const esManual = item.product_price != null;
    const preuProducte = r2(item.product_price ?? 0);
    const preuUnitari = r2(item.price ?? item.unitPrice ?? 0);
    const preu = esManual
      ? r2(preuProducte * qty + transport * (1 + IVA_RATE))
      : r2(preuUnitari * qty);

    const baseProducte = esManual
      ? r2((preuProducte * qty) / (1 + IVA_RATE))
      : r2(preu / (1 + IVA_RATE) - transport);
    const ivaLinia = r2(preu - baseProducte - transport);

    const detalls = [item.description, item.collection, item.size ? `talla ${item.size}` : null, item.color]
      .filter(Boolean).join(' · ');

    return {
      key: `${idx}-${item.gelatoVariantId || item.name || 'item'}`,
      nom: item.productName || item.name || 'Producte',
      detalls,
      qty,
      baseProducte,
      transport,
      iva: ivaLinia,
      preu,
      preuUnitari: esManual ? preuProducte : preuUnitari,
    };
  });
}

function Bloc({ etiqueta, children }) {
  return (
    <div>
      <div className="font-oswald text-[10px] tracking-[0.18em] uppercase text-gray-400 mb-1">{etiqueta}</div>
      <div className="text-[13px] leading-relaxed text-gray-900">{children}</div>
    </div>
  );
}

/**
 * El full A4.
 *
 * `doc` pot ser una factura emesa o un esborrany: els dos tenen els mateixos
 * camps. El que canvia és el que s'hi passa a fora:
 *
 *   numero          el número, o el text que s'hi vulgui posar si encara no n'hi ha
 *   teCif           si és factura simplificada o ordinària
 *   blocClient      'sencer' (emissor i client) o 'nom' (només el nom, a l'editor)
 *   linies          el resultat de `liniesDelDocument`
 *   ajustCentims    avís si les línies no quadren amb la base desada
 */
export default function InvoiceSheet({
  doc,
  numero = '—',
  teCif,
  blocClient = 'sencer',
  linies,
  ajustCentims = null,
  isTest = false,
}) {
  const esRectificativa = doc?.document_kind === 'rectification';
  const esSimplificada = teCif != null ? !teCif : doc?.invoice_type !== 'full';
  const files = Array.isArray(linies) ? linies : [];

  return (
    <div className="mx-auto bg-white shadow-sm print:shadow-none" style={{ width: '210mm', minHeight: '297mm', padding: '14mm' }}>

      {/* Avís de prova: ha de ser impossible confondre un full de prova amb un de debò */}
      {isTest && (
        <div className="mb-5 border-2 border-amber-500 bg-amber-50 px-4 py-2 text-center font-oswald text-[13px] uppercase tracking-[0.18em] text-amber-800 print:border-amber-500">
          Document de prova · no té cap valor fiscal
        </div>
      )}

      {/* Capçalera */}
      <div className="flex items-start justify-between gap-6 pb-4 border-b-2 border-gray-900">
        <img src="/custom_logos/brand/grup-higgins-logo.svg" alt={ISSUER.tradeName} className="h-10" />
        <div className="text-right">
          {/* A la factura simplificada el títol va més petit: és més llarg i
              sinó no hi cap. Ho diu el model de l'amo (`body.simplificada`). */}
          <div className={`font-oswald leading-none uppercase ${
            esSimplificada && !esRectificativa
              ? 'text-[19px] tracking-[0.04em]'
              : 'text-[26px] tracking-[0.04em]'
          }`}>
            {esRectificativa ? 'Factura rectificativa' : esSimplificada ? 'Factura simplificada' : 'Factura'}
          </div>
        </div>
      </div>

      {/* Número, data, comanda i pagament */}
      <div className="grid grid-cols-4 gap-3 mt-5 mb-6 text-[12px]">
        {[
          ['Número', numero],
          ['Data d’emissió', fmtDate(doc?.issued_at || doc?.created_at || new Date())],
          ['Comanda', doc?.order_number || '—'],
          ['Forma de pagament', 'Targeta'],
        ].map(([k, v]) => (
          <div key={k} className="border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="font-oswald text-[9px] tracking-[0.16em] uppercase text-gray-400 mb-1">{k}</div>
            <div className="text-gray-900">{v}</div>
          </div>
        ))}
      </div>

      {esRectificativa && (
        <div className="mb-6 border border-gray-900 px-4 py-3 text-[12px]">
          <div className="font-oswald text-[9px] uppercase tracking-[0.16em] text-gray-400">Document rectificat</div>
          <div className="mt-1 font-oswald text-[14px]">{doc?.rectified_invoice_number || 'Factura original'}</div>
          <div className="mt-1 text-gray-600">{doc?.correction_reason}</div>
        </div>
      )}

      {/* Emissor i client */}
      {blocClient === 'sencer' ? (
        <div className="grid grid-cols-2 gap-10 mb-8">
          <Bloc etiqueta="Emissor">
            <div className="font-oswald text-[15px] tracking-wide uppercase mb-1">{ISSUER.name}</div>
            <div>{ISSUER.tradeName}</div>
            <div>{ISSUER.address}</div>
            <div>{ISSUER.postalCode} {ISSUER.city}, {ISSUER.province}</div>
            <div>NIF: {ISSUER.taxId}</div>
            <div>{ISSUER.email}</div>
          </Bloc>
          <Bloc etiqueta="Client">
            <div className="font-oswald text-[15px] tracking-wide uppercase mb-1">
              {doc?.customer_name || '—'}
            </div>
            {doc?.customer_company && <div>{doc.customer_company}</div>}
            {doc?.customer_address && <div>{doc.customer_address}</div>}
            {doc?.customer_address2 && <div>{doc.customer_address2}</div>}
            <div>{[doc?.customer_postal_code, doc?.customer_city].filter(Boolean).join(' ')}</div>
            <div>{doc?.customer_country}</div>
            {/* A la simplificada el NIF del client no s'hi ha de veure: és una
                factura sense CIF. Ho diu el model de l'amo (`body.simplificada
                .cifClient { display: none }`). */}
            {!esSimplificada && doc?.customer_tax_id && <div>NIF: {doc.customer_tax_id}</div>}
            {doc?.customer_email && <div>{doc.customer_email}</div>}
          </Bloc>
        </div>
      ) : (
        <div className="mb-8">
          <Bloc etiqueta="Client">
            <div className="font-oswald text-[15px] tracking-wide uppercase mb-1">
              {doc?.customer_name || '—'}
            </div>
            {doc?.customer_company && <div>{doc.customer_company}</div>}
            {doc?.customer_tax_id && <div>NIF: {doc.customer_tax_id}</div>}
            {doc?.customer_city && <div>{[doc?.customer_postal_code, doc?.customer_city].filter(Boolean).join(' ')}</div>}
          </Bloc>
        </div>
      )}

      {/* Línies: base + transport + IVA, com al model */}
      <table className="w-full text-[12px] border-collapse">
        <thead>
          <tr className="border-b border-gray-900">
            <th className="text-left font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2">Producte</th>
            <th className="text-center font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2 w-16">Quantitat</th>
            <th className="text-right font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2 w-40">Base + Transport + IVA</th>
            <th className="text-right font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2 w-24">Preu</th>
          </tr>
        </thead>
        <tbody>
          {files.map((l) => (
            <tr key={l.key} className="border-b border-gray-100 align-top">
              <td className="py-3 pr-2">
                <div className="text-gray-900">{l.nom}</div>
                {l.detalls && <div className="text-[11px] text-gray-400 mt-0.5">{l.detalls}</div>}
              </td>
              <td className="py-3 text-center text-gray-600">x{l.qty}</td>
              <td className="py-3 text-right tabular-nums text-gray-500 whitespace-nowrap">
                {eur(l.baseProducte)} <span className="text-gray-300">+</span> {eur(l.transport)} <span className="text-gray-300">+</span> {eur(l.iva)}
              </td>
              <td className="py-3 text-right tabular-nums font-oswald text-[13px]">{eur(l.preu)}</td>
            </tr>
          ))}
          {files.length === 0 && (
            <tr><td colSpan="4" className="py-6 text-center text-gray-400">Aquesta factura encara no té línies.</td></tr>
          )}
          {files.length > 0 && (
            <tr className="border-b-2 border-gray-900">
              <td colSpan="3" className="py-3 pr-2">
                <span className="font-oswald text-[13px] uppercase tracking-[0.06em]">Total factura</span>
              </td>
              <td className="py-3 text-right tabular-nums font-oswald text-[15px]">{eur(doc?.total)}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals i notes */}
      <div className="grid grid-cols-2 gap-10 mt-8 text-[11.5px] leading-relaxed text-gray-500">
        <div>
          <div className="font-oswald text-[10px] tracking-[0.18em] uppercase text-gray-400 mb-1">Informació</div>
          <p className="m-0">
            Producte fabricat sota demanda amb impressió <strong className="text-gray-700">DTF</strong> (Direct-to-Film).
            El termini de producció és de 2 a 4 dies feiners i el de lliurament, de 3 a 6 dies feiners addicionals.
          </p>
          <p className="mt-3 m-0">
            Tots els imports d&apos;aquesta factura són en euros. El preu de la botiga ja inclou el transport i l&apos;IVA;
            aquí es desglossa per conceptes. Operació subjecta al règim general d&apos;IVA.
          </p>
        </div>
        <div className="text-[12px] text-gray-900">
          <div className="flex justify-between py-1"><span className="text-gray-500">Base de les samarretes</span><span className="tabular-nums">{eur(doc?.base_products)}</span></div>
          <div className="flex justify-between py-1"><span className="text-gray-500">Transport</span><span className="tabular-nums">{eur(doc?.base_shipping)}</span></div>
          <div className="flex justify-between py-1"><span className="text-gray-500">IVA 21% (de tots dos)</span><span className="tabular-nums">{eur(doc?.iva)}</span></div>
          <div className="flex justify-between items-baseline mt-2 pt-2 border-t-2 border-gray-900 font-oswald text-[17px] uppercase">
            <span>Total factura</span><span className="tabular-nums">{eur(doc?.total)}</span>
          </div>
        </div>
      </div>

      {/* Peu legal */}
      <div className="mt-10 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
        <div>{issuerLine()}</div>
        <div className="mt-1">Factura emesa electrònicament. Conserva aquest document com a justificant de compra.</div>
      </div>

      {/* Els cèntims de les línies han de quadrar amb el total desat */}
      {ajustCentims && (
        <div className="mt-3 text-center text-[11px] text-amber-600 print:hidden">{ajustCentims}</div>
      )}
    </div>
  );
}
