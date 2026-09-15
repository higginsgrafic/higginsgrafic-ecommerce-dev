import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, FilePlus2, Mail, Pencil, RotateCcw } from 'lucide-react';
import { authHeaders } from '@/api/authHeaders';

/**
 * Factures, per a l'administració.
 *
 * Les dades les serveix `/api/admin-invoices`, que comprova al servidor que qui
 * ho demana sigui administrador. Aquí només es pinta el resultat i es dona la
 * manera de filtrar-lo.
 *
 * Els totals per trimestre són els que fan falta per a les declaracions d'IVA.
 */

const eur = (n) =>
  new Intl.NumberFormat('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round((Number(n) || 0) * 100) / 100) + ' €';

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

function Camp({ etiqueta, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-oswald text-[10px] tracking-[0.16em] uppercase text-gray-400">{etiqueta}</span>
      {children}
    </label>
  );
}

const inputClass =
  'border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-gray-900 transition-colors';

function tipusFactura(factura) {
  if (factura.document_kind === 'rectification') return 'Rectificativa';
  return factura.invoice_type === 'full' ? 'Ordinària' : 'Simplificada';
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function AdminInvoicesPage() {
  const [estat, setEstat] = useState('carregant');
  const [dades, setDades] = useState({ invoices: [], totals: { perAny: [], perTrimestre: [] }, truncated: false });
  const [drafts, setDrafts] = useState([]);
  const [vista, setVista] = useState('issued');
  const [anyFiltre, setAnyFiltre] = useState('');
  const [tipusFiltre, setTipusFiltre] = useState('');
  const [cerca, setCerca] = useState('');
  const [cercaAplicada, setCercaAplicada] = useState('');
  const [missatge, setMissatge] = useState('');

  // La consulta es fa aquí i es repeteix sola quan canvia qualsevol filtre: el
  // formulari només actualitza l'estat i aquest effect se n'encarrega.
  useEffect(() => {
    let viu = true;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (anyFiltre) params.set('year', anyFiltre);
        if (tipusFiltre) params.set('type', tipusFiltre);
        if (cercaAplicada) params.set('q', cercaAplicada);
        const headers = await authHeaders();
        const [invoiceResponse, draftResponse] = await Promise.all([
          fetch(`/api/admin-invoices?${params.toString()}`, { headers }),
          fetch('/api/admin-invoice-drafts', { headers }),
        ]);
        if (!viu) return;
        if (!invoiceResponse.ok || !draftResponse.ok) { setEstat('error'); return; }
        const [invoiceData, draftData] = await Promise.all([invoiceResponse.json(), draftResponse.json()]);
        if (!viu) return;
        setDades({
          invoices: invoiceData.invoices || [],
          totals: invoiceData.totals || { perAny: [], perTrimestre: [] },
          truncated: Boolean(invoiceData.truncated),
        });
        setDrafts(draftData.drafts || []);
        setEstat('ok');
      } catch {
        if (viu) setEstat('error');
      }
    })();
    return () => { viu = false; };
  }, [anyFiltre, tipusFiltre, cercaAplicada]);

  // Els anys que apareixen a les factures, per al desplegable.
  const anys = useMemo(() => dades.totals.perAny.map((a) => a.year), [dades]);
  const totalGeneral = useMemo(
    () => dades.totals.perAny.reduce(
      (acc, a) => ({ count: acc.count + a.count, base: acc.base + a.base, total: acc.total + a.total, iva: acc.iva + a.iva }),
      { count: 0, base: 0, total: 0, iva: 0 }
    ),
    [dades]
  );

  const resend = async (invoice) => {
    if (!invoice.customer_email || !window.confirm(`Vols reenviar ${invoice.number} a ${invoice.customer_email}?`)) return;
    setMissatge('Enviant la factura…');
    const headers = await authHeaders({ 'Content-Type': 'application/json' });
    const response = await fetch('/api/admin-invoice-actions', {
      method: 'POST', headers, body: JSON.stringify({ action: 'resend', id: invoice.id }),
    });
    const result = await response.json();
    setMissatge(response.ok ? 'Factura enviada.' : result.error || 'No s’ha pogut enviar la factura.');
  };

  const exportCsv = () => {
    const rows = [
      ['Número', 'Data', 'Tipus', 'Client', 'Empresa', 'NIF', 'Correu', 'Comanda', 'Base productes', 'Base transport', 'IVA', 'Total'],
      ...dades.invoices.map((invoice) => [
        invoice.number, fmtDate(invoice.issued_at), tipusFactura(invoice), invoice.customer_name,
        invoice.customer_company, invoice.customer_tax_id, invoice.customer_email, invoice.order_number,
        invoice.base_products, invoice.base_shipping, invoice.iva, invoice.total,
      ]),
    ];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `factures-${anyFiltre || 'totes'}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-oswald text-2xl tracking-[0.04em] uppercase mb-1">Factures</h1>
          <p className="text-sm text-gray-500">Crea, emet, consulta i rectifica les factures de la botiga.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} disabled={!dades.invoices.length} className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-xs uppercase tracking-wider hover:border-black disabled:opacity-40">
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
          <Link to="/admin/factures/nova" className="inline-flex items-center gap-2 bg-gray-900 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-black">
            <FilePlus2 className="h-4 w-4" /> Nova factura
          </Link>
        </div>
      </div>

      {missatge && <div className="mb-4 border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">{missatge}</div>}

      <div className="mb-6 flex border-b border-gray-200">
        <button type="button" onClick={() => setVista('issued')} className={`px-4 py-3 font-oswald text-xs uppercase tracking-[0.14em] ${vista === 'issued' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'}`}>Emeses ({dades.invoices.length})</button>
        <button type="button" onClick={() => setVista('drafts')} className={`px-4 py-3 font-oswald text-xs uppercase tracking-[0.14em] ${vista === 'drafts' ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400'}`}>Esborranys ({drafts.length})</button>
      </div>

      {vista === 'issued' && (
        <form onSubmit={(event) => { event.preventDefault(); setCercaAplicada(cerca.trim()); }} className="flex flex-wrap items-end gap-3 mb-6 pb-6 border-b border-gray-200">
          <Camp etiqueta="Any">
            <select value={anyFiltre} onChange={(event) => setAnyFiltre(event.target.value)} className={inputClass}>
              <option value="">Tots</option>
              {anys.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </Camp>
          <Camp etiqueta="Tipus">
            <select value={tipusFiltre} onChange={(event) => setTipusFiltre(event.target.value)} className={inputClass}>
              <option value="">Tots</option>
              <option value="full">Ordinària</option>
              <option value="simplified">Simplificada</option>
              <option value="rectification">Rectificativa</option>
            </select>
          </Camp>
          <Camp etiqueta="Cerca">
            <input type="search" value={cerca} onChange={(event) => setCerca(event.target.value)} placeholder="Número, client, NIF o comanda" className={`${inputClass} w-72`} />
          </Camp>
          <button type="submit" className="px-5 py-2 bg-gray-900 text-white font-oswald tracking-[0.12em] uppercase text-xs hover:bg-black">Cercar</button>
          {(anyFiltre || tipusFiltre || cercaAplicada) && (
            <button type="button" onClick={() => { setAnyFiltre(''); setTipusFiltre(''); setCerca(''); setCercaAplicada(''); }} className="px-3 py-2 text-xs uppercase tracking-[0.12em] text-gray-500 hover:text-gray-900">Treure filtres</button>
          )}
        </form>
      )}

      {estat === 'carregant' && <div className="text-gray-400 text-sm">Carregant…</div>}
      {estat === 'error' && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">No s’han pogut carregar les factures. Comprova que la migració de gestió estigui executada.</div>}

      {estat === 'ok' && vista === 'issued' && (
        <>
          {dades.truncated && <div className="text-sm text-amber-700 border border-amber-200 bg-amber-50 px-4 py-3 mb-5">Hi ha més factures de les que es poden mostrar. Estreta la cerca perquè els totals siguin complets.</div>}
          {/* Totals per trimestre */}
          {dades.totals.perTrimestre.length > 0 && (
            <section className="mb-8">
              <h2 className="font-oswald text-[11px] tracking-[0.18em] uppercase text-gray-400 mb-3">Totals per trimestre</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="border-b border-gray-900">
                    {['Període', 'Factures', 'Base', 'IVA', 'Total'].map((header, index) => <th key={header} className={`${index ? 'text-right' : 'text-left'} py-2 font-oswald font-normal text-[10px] uppercase tracking-[0.14em] text-gray-400`}>{header}</th>)}
                  </tr></thead>
                  <tbody>
                    {dades.totals.perTrimestre.map((period) => <tr key={period.period} className="border-b border-gray-100"><td className="py-2 font-oswald">{period.period}</td><td className="py-2 text-right">{period.count}</td><td className="py-2 text-right">{eur(period.base)}</td><td className="py-2 text-right">{eur(period.iva)}</td><td className="py-2 text-right font-oswald">{eur(period.total)}</td></tr>)}
                    <tr className="border-t-2 border-gray-900"><td className="py-2 font-oswald uppercase">Total mostrat</td><td className="py-2 text-right">{totalGeneral.count}</td><td className="py-2 text-right">{eur(totalGeneral.base)}</td><td className="py-2 text-right">{eur(totalGeneral.iva)}</td><td className="py-2 text-right font-oswald">{eur(totalGeneral.total)}</td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {/* Factures */}
          <section className="overflow-x-auto border border-gray-200 bg-white">
            <table className="w-full text-sm border-collapse">
              <thead><tr className="border-b border-gray-900">
                {['Número', 'Data', 'Client', 'NIF', 'Tipus', 'Total', 'Accions'].map((header, index) => <th key={header} className={`${index === 5 ? 'text-right' : 'text-left'} px-3 py-3 font-oswald font-normal text-[10px] uppercase tracking-[0.14em] text-gray-400`}>{header}</th>)}
              </tr></thead>
              <tbody>
                {dades.invoices.map((invoice) => (
                  <tr key={invoice.id || invoice.number} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 font-oswald">{invoice.number}</td><td className="px-3 py-3 text-gray-500">{fmtDate(invoice.issued_at)}</td>
                    <td className="px-3 py-3"><div>{invoice.customer_name || '—'}</div>{invoice.customer_company && <div className="text-[11px] text-gray-400">{invoice.customer_company}</div>}</td>
                    <td className="px-3 py-3 text-gray-500">{invoice.customer_tax_id || '—'}</td><td className="px-3 py-3 text-xs uppercase tracking-wider text-gray-500">{tipusFactura(invoice)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{eur(invoice.total)}</td>
                    <td className="px-3 py-3"><div className="flex justify-end gap-2">
                      {invoice.access_token && <Link to={`/factura/${invoice.access_token}`} className="inline-flex items-center gap-1 border border-gray-200 px-2 py-1 text-[10px] uppercase tracking-wider hover:border-black"><Eye className="h-3.5 w-3.5" /> Veure</Link>}
                      {invoice.customer_email && <button type="button" onClick={() => resend(invoice)} className="inline-flex items-center gap-1 border border-gray-200 px-2 py-1 text-[10px] uppercase tracking-wider hover:border-black"><Mail className="h-3.5 w-3.5" /> Reenviar</button>}
                      <Link to={`/admin/factures/nova?rectifies=${encodeURIComponent(invoice.id)}`} className="inline-flex items-center gap-1 border border-gray-200 px-2 py-1 text-[10px] uppercase tracking-wider hover:border-black"><RotateCcw className="h-3.5 w-3.5" /> Rectificar</Link>
                    </div></td>
                  </tr>
                ))}
                {!dades.invoices.length && <tr><td colSpan="7" className="py-10 text-center text-gray-400">No hi ha cap factura amb aquests filtres.</td></tr>}
              </tbody>
            </table>
          </section>
        </>
      )}

      {estat === 'ok' && vista === 'drafts' && (
        <section className="overflow-x-auto border border-gray-200 bg-white">
          <table className="w-full text-sm border-collapse">
            <thead><tr className="border-b border-gray-900">
              {['Actualitzat', 'Client', 'Document', 'Comanda', 'Total', ''].map((header) => <th key={header} className="px-3 py-3 text-left font-oswald font-normal text-[10px] uppercase tracking-[0.14em] text-gray-400">{header}</th>)}
            </tr></thead>
            <tbody>
              {drafts.map((draft) => <tr key={draft.id} className="border-b border-gray-100"><td className="px-3 py-3 text-gray-500">{fmtDate(draft.updated_at)}</td><td className="px-3 py-3">{draft.customer_name || 'Sense nom'}</td><td className="px-3 py-3 text-xs uppercase tracking-wider text-gray-500">{tipusFactura(draft)}</td><td className="px-3 py-3 text-gray-500">{draft.order_number || '—'}</td><td className="px-3 py-3 tabular-nums">{eur(draft.total)}</td><td className="px-3 py-3 text-right"><Link to={`/admin/factures/esborrany/${draft.id}`} className="inline-flex items-center gap-1 border border-gray-200 px-3 py-1.5 text-[10px] uppercase tracking-wider hover:border-black"><Pencil className="h-3.5 w-3.5" /> Editar</Link></td></tr>)}
              {!drafts.length && <tr><td colSpan="6" className="py-10 text-center text-gray-400">No hi ha cap esborrany pendent.</td></tr>}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
