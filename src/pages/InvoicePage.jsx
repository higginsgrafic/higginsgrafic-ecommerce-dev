import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ISSUER, issuerLine } from '@/config/issuer';
import { IVA_RATE } from '@/config/pricing';

/**
 * Factura d'una comanda, en una pàgina pròpia i imprimible.
 *
 * S'obre amb el testimoni d'accés que el client rep per correu, sense haver
 * d'entrar a cap compte. Les dades són les que es van desar el dia de
 * l'emissió: si avui canvia una adreça o un preu, la factura no es mou.
 *
 * Es pot imprimir o desar en PDF amb la impressió del navegador (Cmd+P).
 */

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const eur = (n) =>
  new Intl.NumberFormat('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(r2(n)) + ' €';

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

/**
 * Reparteix el transport entre les unitats: la primera peça paga la tarifa
 * sencera i les altres la reduïda, que és com ho calcula la botiga.
 *
 * L'última línia s'ajusta uns cèntims si cal, perquè la suma de les línies
 * ha de donar EXACTAMENT el total desat a la factura. En un document fiscal
 * els cèntims no poden ballar.
 */
export function reparteixTransport(quantitats, transportNet) {
  const total = r2(transportNet);
  const unitats = quantitats.reduce((a, b) => a + b, 0);
  if (unitats === 0 || total === 0) return quantitats.map(() => 0);

  // Cerca la parella (primera, addicionals) que quadra amb el total desat.
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
    if (unitatsRestants === 0) suma = r2(suma + restant);  // ajust de centaus
    linies.push(r2(suma));
  }
  return linies;
}

function Bloc({ etiqueta, children }) {
  return (
    <div>
      <div className="font-oswald text-[10px] tracking-[0.18em] uppercase text-gray-400 mb-1">{etiqueta}</div>
      <div className="text-[13px] leading-relaxed text-gray-900">{children}</div>
    </div>
  );
}

export default function InvoicePage() {
  const { token } = useParams();
  const [estat, setEstat] = useState('carregant');
  const [factura, setFactura] = useState(null);

  useEffect(() => {
    let viu = true;
    fetch(`/api/get-invoice?token=${encodeURIComponent(token || '')}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (viu) { setFactura(d.invoice); setEstat('ok'); } })
      .catch(() => { if (viu) setEstat('error'); });
    return () => { viu = false; };
  }, [token]);

  const linies = useMemo(() => {
    if (!factura) return [];
    const items = Array.isArray(factura.items) ? factura.items : [];
    const quantitats = items.map((i) => Math.max(1, Number(i.quantity) || 1));
    const transports = reparteixTransport(quantitats, factura.base_shipping);

    return items.map((item, idx) => {
      const qty = quantitats[idx];
      const transport = r2(transports[idx]);
      const esManual = item.product_price != null;
      const preuProducte = r2(item.product_price ?? 0);
      const preuUnitari = r2(item.price ?? item.unitPrice ?? 0);
      const preu = esManual
        ? r2(preuProducte * qty + transport * (1 + IVA_RATE))
        : r2(preuUnitari * qty);

      // El preu de la botiga ja porta l'IVA a dins; aquí es desglossa.
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
  }, [factura]);

  if (estat === 'carregant') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregant la factura…</div>;
  }
  if (estat === 'error' || !factura) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="font-oswald text-2xl tracking-wide">FACTURA NO TROBADA</div>
        <p className="text-gray-500 max-w-md">
          Aquest enllaç no correspon a cap factura. Comprova que l&apos;hagis copiat sencer.
        </p>
      </div>
    );
  }

  const esRectificativa = factura.document_kind === 'rectification';
  const esSimplificada = factura.invoice_type !== 'full';
  const totalBase = r2(r2(factura.base_products) + r2(factura.base_shipping));
  const sumaBases = r2(linies.reduce((a, l) => a + l.baseProducte, 0));

  return (
    <div className="min-h-screen bg-gray-100 py-6 print:bg-white print:py-0">
      {/* El full A4 */}
      <div className="mx-auto bg-white shadow-sm print:shadow-none" style={{ width: '210mm', minHeight: '297mm', padding: '14mm' }}>

        {/* Capçalera */}
        <div className="flex items-start justify-between gap-6 pb-4 border-b-2 border-gray-900">
          <img src="/custom_logos/brand/grup-higgins-logo.svg" alt={ISSUER.tradeName} className="h-10" />
          <div className="text-right">
            <div className="font-oswald text-[26px] leading-none tracking-[0.04em] uppercase">
              {esRectificativa ? 'Factura rectificativa' : esSimplificada ? 'Factura simplificada' : 'Factura'}
            </div>
          </div>
        </div>

        {/* Número, data, comanda i pagament */}
        <div className="grid grid-cols-4 gap-3 mt-5 mb-6 text-[12px]">
          {[
            ['Número', factura.number || '—'],
            ['Data d’emissió', fmtDate(factura.issued_at)],
            ['Comanda', factura.order_number || '—'],
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
            <div className="mt-1 font-oswald text-[14px]">{factura.rectified_invoice_number || 'Factura original'}</div>
            <div className="mt-1 text-gray-600">{factura.correction_reason}</div>
          </div>
        )}

        {/* Emissor i client */}
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
              {factura.customer_name || '—'}
            </div>
            {factura.customer_company && <div>{factura.customer_company}</div>}
            {factura.customer_address && <div>{factura.customer_address}</div>}
            {factura.customer_address2 && <div>{factura.customer_address2}</div>}
            <div>{[factura.customer_postal_code, factura.customer_city].filter(Boolean).join(' ')}</div>
            <div>{factura.customer_country}</div>
            {factura.customer_tax_id && <div>NIF: {factura.customer_tax_id}</div>}
            {factura.customer_email && <div>{factura.customer_email}</div>}
          </Bloc>
        </div>

        {/* Línies */}
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="border-b border-gray-900">
              <th className="text-left font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2">Producte</th>
              <th className="text-center font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2 w-16">Quantitat</th>
              <th className="text-right font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2 w-24">Base</th>
              <th className="text-right font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2 w-24">Transport</th>
              <th className="text-right font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2 w-20">IVA</th>
              <th className="text-right font-oswald font-normal text-[9px] tracking-[0.16em] uppercase text-gray-400 py-2 w-24">Preu</th>
            </tr>
          </thead>
          <tbody>
            {linies.map((l) => (
              <tr key={l.key} className="border-b border-gray-100 align-top">
                <td className="py-3 pr-2">
                  <div className="text-gray-900">{l.nom}</div>
                  {l.detalls && <div className="text-[11px] text-gray-400 mt-0.5">{l.detalls}</div>}
                </td>
                <td className="py-3 text-center text-gray-600">x{l.qty}</td>
                <td className="py-3 text-right tabular-nums">{eur(l.baseProducte)}</td>
                <td className="py-3 text-right tabular-nums">{eur(l.transport)}</td>
                <td className="py-3 text-right tabular-nums">{eur(l.iva)}</td>
                <td className="py-3 text-right tabular-nums font-oswald text-[13px]">{eur(l.preu)}</td>
              </tr>
            ))}
            {linies.length === 0 && (
              <tr><td colSpan="6" className="py-6 text-center text-gray-400">Aquesta factura no té línies.</td></tr>
            )}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-between items-baseline mt-4 pt-3 border-t-2 border-gray-900">
          <div className="font-oswald text-[15px] tracking-[0.06em] uppercase">Tot plegat fa</div>
          <div className="flex gap-8 tabular-nums text-[13px]">
            <span className="text-gray-400">{eur(totalBase)}</span>
            <span className="text-gray-400">{eur(factura.iva)}</span>
            <span className="font-oswald text-[18px]">{eur(factura.total)}</span>
          </div>
        </div>

        {/* Informació */}
        <div className="grid grid-cols-2 gap-10 mt-8 text-[11.5px] leading-relaxed text-gray-500">
          <div>
            <div className="font-oswald text-[10px] tracking-[0.18em] uppercase text-gray-400 mb-1">Informació</div>
            Producte fabricat sota demanda amb impressió <strong className="text-gray-700">DTF</strong> (Direct-to-Film).
            El termini de producció és de 2 a 4 dies feiners i el de lliurament, de 3 a 6 dies feiners addicionals.
          </div>
          <div>
            Tots els imports d&apos;aquesta factura són en euros. El preu de la botiga ja inclou el transport i l&apos;IVA;
            aquí es desglossa per conceptes. Operació subjecta al règim general d&apos;IVA.
          </div>
        </div>

        {/* Peu legal */}
        <div className="mt-10 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
          <div>{issuerLine()}</div>
          <div className="mt-1">Factura emesa electrònicament. Conserva aquest document com a justificant de compra.</div>
        </div>
      </div>

      {/* Botó d'imprimir, que no surt al paper */}
      <div className="mx-auto mt-4 print:hidden" style={{ width: '210mm' }}>
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full py-3 bg-gray-900 text-white font-oswald tracking-[0.12em] uppercase text-sm hover:bg-black transition-colors"
        >
          Imprimir o desar en PDF
        </button>
      </div>

      {/* Els cèntims de les línies han de quadrar amb el total desat */}
      {Math.abs(sumaBases - r2(factura.base_products)) > 0.02 && (
        <div className="mx-auto mt-3 text-center text-[11px] text-amber-600 print:hidden" style={{ width: '210mm' }}>
          Les línies no quadren exactament amb la base desada ({eur(sumaBases)} vs {eur(factura.base_products)}).
        </div>
      )}
    </div>
  );
}
