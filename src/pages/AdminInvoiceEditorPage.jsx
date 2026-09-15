import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Eye, Plus, Save, Send, Trash2, X } from 'lucide-react';
import { authHeaders } from '@/api/authHeaders';
import { ISSUER, issuerLine } from '@/config/issuer';

const IVA_RATE = 0.21;
const ISSUE_CONFIRMATION = 'VALIDA LA FACTURA';
const COUNTRIES = [
  'Alemanya', 'Andorra', 'Austràlia', 'Àustria', 'Bèlgica', 'Brasil', 'Bulgària', 'Canadà',
  'Croàcia', 'Dinamarca', 'Eslovàquia', 'Eslovènia', 'Espanya', 'Estats Units', 'Estònia',
  'Finlàndia', 'França', 'Grècia', 'Hongria', 'Irlanda', 'Islàndia', 'Itàlia', 'Japó',
  'Letònia', 'Liechtenstein', 'Lituània', 'Luxemburg', 'Malta', 'Noruega', 'Nova Zelanda',
  'Països Baixos', 'Polònia', 'Portugal', 'Regne Unit', 'Rep. Txeca', 'Romania', 'Singapur',
  'Suècia', 'Suïssa', 'Xipre',
];
const r2 = (value) => Math.round((Number(value) || 0) * 100) / 100;
const eur = (value) => new Intl.NumberFormat('ca-ES', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
}).format(r2(value));
const inputClass = 'w-full border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none';
const emptyLine = () => ({ name: '', description: '', quantity: 1, product_price: 0 });
const addressLabels = { floor: 'Pis', door: 'Porta', staircase: 'Escala', block: 'Bloc', other: 'Altres' };

function parseAddressDetails(value) {
  const details = { floor: '', door: '', staircase: '', block: '', other: '' };
  const raw = String(value || '').trim();
  if (!raw) return details;
  let recognized = false;
  raw.split(' · ').forEach((part) => {
    const entry = Object.entries(addressLabels).find(([, label]) => part.startsWith(`${label}: `));
    if (entry) {
      details[entry[0]] = part.slice(entry[1].length + 2);
      recognized = true;
    }
  });
  if (!recognized) details.other = raw;
  return details;
}

function composeAddressDetails(details) {
  return Object.entries(addressLabels)
    .map(([key, label]) => String(details[key] || '').trim() ? `${label}: ${String(details[key]).trim()}` : '')
    .filter(Boolean)
    .join(' · ');
}

const emptyDraft = {
  invoice_type: 'simplified', document_kind: 'invoice', rectifies_invoice_id: null,
  correction_reason: '', order_number: '', customer_name: '', customer_email: '',
  customer_tax_id: '', customer_company: '', customer_address: '', customer_address2: '',
  customer_city: '', customer_postal_code: '', customer_country: 'Espanya',
  shipping_total: 0, items: [emptyLine()],
};

function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-oswald text-[10px] uppercase tracking-[0.15em] text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function InvoicePreview({ draft, totals, onClose }) {
  const title = draft.document_kind === 'rectification'
    ? 'Factura rectificativa'
    : draft.invoice_type === 'full' ? 'Factura ordinària' : 'Factura simplificada';
  const series = draft.document_kind === 'rectification' ? 'FR' : draft.invoice_type === 'full' ? 'FO' : 'FS';
  const date = new Intl.DateTimeFormat('ca-ES').format(new Date());

  return (
    <div className="fixed inset-0 z-[40000] overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Previsualització de la factura">
      <div className="mx-auto mb-4 flex max-w-[210mm] justify-end">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 bg-white px-4 py-2 text-xs uppercase tracking-wider text-gray-700 shadow hover:text-black">
          <X className="h-4 w-4" /> Tancar
        </button>
      </div>
      <article className="mx-auto min-h-[297mm] w-[210mm] max-w-full bg-white p-[14mm] text-gray-900 shadow-2xl">
        <header className="flex items-start justify-between gap-6 border-b-2 border-gray-900 pb-4">
          <img src="/custom_logos/brand/grup-higgins-logo.svg" alt={ISSUER.tradeName} className="h-10" />
          <div className="text-right">
            <div className="font-oswald text-[26px] uppercase leading-none tracking-[0.04em]">{title}</div>
            <div className="mt-2 text-[11px] uppercase tracking-wider text-gray-400">Previsualització · {series}-AAAA-000000</div>
          </div>
        </header>

        <div className="my-6 grid grid-cols-4 gap-3 text-[12px]">
          {[['Número', 'Sense emetre'], ['Data', date], ['Referència', draft.order_number || '—'], ['Forma de pagament', '—']].map(([label, value]) => (
            <div key={label} className="border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="font-oswald text-[9px] uppercase tracking-[0.16em] text-gray-400">{label}</div>
              <div className="mt-1">{value}</div>
            </div>
          ))}
        </div>

        {draft.document_kind === 'rectification' && (
          <div className="mb-6 border border-gray-900 px-4 py-3 text-[12px]">
            <div className="font-oswald text-[9px] uppercase tracking-[0.16em] text-gray-400">Motiu de la rectificació</div>
            <div className="mt-1">{draft.correction_reason || 'Pendent d’indicar'}</div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-10 text-[12px] leading-relaxed">
          <div>
            <div className="font-oswald text-[9px] uppercase tracking-[0.18em] text-gray-400">Emissor</div>
            <div className="mt-2 font-oswald text-[15px] uppercase">{ISSUER.name}</div>
            <div>{ISSUER.tradeName}</div><div>{ISSUER.address}</div>
            <div>{ISSUER.postalCode} {ISSUER.city}, {ISSUER.province}</div>
            <div>NIF: {ISSUER.taxId}</div><div>{ISSUER.email}</div>
          </div>
          <div>
            <div className="font-oswald text-[9px] uppercase tracking-[0.18em] text-gray-400">Client</div>
            <div className="mt-2 font-oswald text-[15px] uppercase">{draft.customer_name || 'Sense nom'}</div>
            {draft.customer_company && <div>{draft.customer_company}</div>}
            {draft.customer_address && <div>{draft.customer_address}</div>}
            {draft.customer_address2 && <div>{draft.customer_address2}</div>}
            <div>{[draft.customer_postal_code, draft.customer_city].filter(Boolean).join(' ') || '—'}</div>
            <div>{draft.customer_country || '—'}</div>
            {draft.customer_tax_id && <div>NIF: {draft.customer_tax_id}</div>}
            {draft.customer_email && <div>{draft.customer_email}</div>}
          </div>
        </div>

        <table className="w-full border-collapse text-[12px]">
          <thead><tr className="border-b border-gray-900">
            <th className="py-2 text-left font-oswald text-[9px] font-normal uppercase tracking-[0.16em] text-gray-400">Concepte</th>
            <th className="w-20 py-2 text-center font-oswald text-[9px] font-normal uppercase tracking-[0.16em] text-gray-400">Quantitat</th>
            <th className="w-28 py-2 text-right font-oswald text-[9px] font-normal uppercase tracking-[0.16em] text-gray-400">Preu unitari</th>
            <th className="w-28 py-2 text-right font-oswald text-[9px] font-normal uppercase tracking-[0.16em] text-gray-400">Import</th>
          </tr></thead>
          <tbody>
            {draft.items.filter((item) => item.name).map((item, index) => (
              <tr key={`${item.name}-${index}`} className="border-b border-gray-100 align-top">
                <td className="py-3 pr-3"><div>{item.name}</div>{item.description && <div className="mt-1 text-[11px] text-gray-400">{item.description}</div>}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right tabular-nums">{eur(item.product_price)}</td>
                <td className="py-3 text-right tabular-nums">{eur(r2(item.product_price * item.quantity))}</td>
              </tr>
            ))}
            {!draft.items.some((item) => item.name) && <tr><td colSpan="4" className="py-8 text-center text-gray-400">Encara no hi ha cap concepte.</td></tr>}
          </tbody>
        </table>

        <div className="ml-auto mt-8 w-72 space-y-2 text-[12px] tabular-nums">
          <div className="flex justify-between"><span className="text-gray-500">Productes</span><span>{eur(totals.products)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Transport</span><span>{eur(totals.shipping)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Base imposable</span><span>{eur(totals.base)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">IVA 21%</span><span>{eur(totals.iva)}</span></div>
          <div className="flex justify-between border-t-2 border-gray-900 pt-3 font-oswald text-[17px]"><span>Total</span><span>{eur(totals.total)}</span></div>
        </div>

        <footer className="mt-16 border-t border-gray-200 pt-4 text-center text-[10px] text-gray-400">
          <div>{issuerLine()}</div>
          <div className="mt-1">Previsualització d’un esborrany sense validesa fiscal.</div>
        </footer>
      </article>
    </div>
  );
}

function calculate(draft) {
  const products = r2((draft.items || []).reduce(
    (sum, item) => sum + r2(item.product_price) * Math.max(1, Number(item.quantity) || 1), 0
  ));
  const shipping = r2(draft.shipping_total);
  const total = r2(products + shipping);
  const base = r2(total / (1 + IVA_RATE));
  return { products, shipping, total, base, iva: r2(total - base) };
}

export default function AdminInvoiceEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(emptyDraft);
  const [draftId, setDraftId] = useState(id || null);
  const [status, setStatus] = useState(id ? 'loading' : 'ready');
  const [message, setMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const totals = useMemo(() => calculate(draft), [draft]);
  const addressDetails = useMemo(() => parseAddressDetails(draft.customer_address2), [draft.customer_address2]);
  const rectifies = searchParams.get('rectifies');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!id && !rectifies) return;
      setStatus('loading');
      try {
        const headers = await authHeaders();
        const endpoint = id
          ? `/api/admin-invoice-drafts?id=${encodeURIComponent(id)}`
          : `/api/admin-invoices?id=${encodeURIComponent(rectifies)}`;
        const response = await fetch(endpoint, { headers });
        if (!response.ok) throw new Error('No s’han pogut carregar les dades');
        const data = await response.json();
        if (!active) return;
        if (id) {
          setDraft({ ...emptyDraft, ...data.draft, items: data.draft?.items?.length ? data.draft.items : [emptyLine()] });
        } else {
          const original = data.invoice;
          setDraft({
            ...emptyDraft,
            invoice_type: original.invoice_type,
            document_kind: 'rectification',
            rectifies_invoice_id: original.id,
            order_number: original.order_number || '',
            customer_name: original.customer_name || '',
            customer_email: original.customer_email || '',
            customer_tax_id: original.customer_tax_id || '',
            customer_company: original.customer_company || '',
            customer_address: original.customer_address || '',
            customer_address2: original.customer_address2 || '',
            customer_city: original.customer_city || '',
            customer_postal_code: original.customer_postal_code || '',
            customer_country: original.customer_country || 'Espanya',
            shipping_total: -r2(Number(original.base_shipping) * (1 + IVA_RATE)),
            items: [{
              name: `Rectificació de la factura ${original.number}`,
              description: '', quantity: 1,
              product_price: -r2(Number(original.base_products) * (1 + IVA_RATE)),
            }],
          });
        }
        setStatus('ready');
      } catch (error) {
        if (active) { setMessage(error.message); setStatus('error'); }
      }
    };
    load();
    return () => { active = false; };
  }, [id, rectifies]);

  const setField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const setAddressDetail = (field, value) => setField(
    'customer_address2', composeAddressDetails({ ...addressDetails, [field]: value })
  );
  const setLine = (index, field, value) => setDraft((current) => ({
    ...current,
    items: current.items.map((line, i) => i === index ? { ...line, [field]: value } : line),
  }));
  const removeLine = (index) => setDraft((current) => ({
    ...current, items: current.items.filter((_, i) => i !== index),
  }));

  const save = async () => {
    setStatus('saving');
    setMessage('');
    try {
      const headers = await authHeaders({ 'Content-Type': 'application/json' });
      const response = await fetch(
        draftId ? `/api/admin-invoice-drafts?id=${encodeURIComponent(draftId)}` : '/api/admin-invoice-drafts',
        { method: draftId ? 'PATCH' : 'POST', headers, body: JSON.stringify(draft) }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No s’ha pogut desar');
      setDraftId(data.draft.id);
      setDraft({ ...emptyDraft, ...data.draft, items: data.draft.items });
      setStatus('ready');
      setMessage('Esborrany desat. Encara no té número fiscal.');
      if (!id) navigate(`/admin/factures/esborrany/${data.draft.id}`, { replace: true });
      return data.draft.id;
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
      return null;
    }
  };

  const issue = async () => {
    const confirmation = window.prompt(
      `En emetre-la rebrà un número fiscal i ja no es podrà modificar. Escriu ${ISSUE_CONFIRMATION} per continuar.`
    );
    if (confirmation?.trim().toUpperCase() !== ISSUE_CONFIRMATION) {
      if (confirmation !== null) setMessage(`Emissió cancel·lada: cal escriure exactament ${ISSUE_CONFIRMATION}.`);
      return;
    }
    const savedId = await save();
    if (!savedId) return;
    setStatus('issuing');
    try {
      const headers = await authHeaders({ 'Content-Type': 'application/json' });
      const response = await fetch('/api/admin-invoice-drafts', {
        method: 'POST', headers, body: JSON.stringify({ action: 'issue', id: savedId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No s’ha pogut emetre');
      navigate(`/factura/${data.invoice.access_token}`);
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  const discard = async () => {
    if (!draftId || !window.confirm('Vols eliminar aquest esborrany?')) return;
    const headers = await authHeaders();
    const response = await fetch(`/api/admin-invoice-drafts?id=${encodeURIComponent(draftId)}`, { method: 'DELETE', headers });
    if (response.ok) navigate('/admin/factures');
    else setMessage('No s’ha pogut eliminar l’esborrany.');
  };

  if (status === 'loading') return <div className="p-8 text-sm text-gray-500">Carregant l’esborrany…</div>;

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/factures" className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-gray-500 hover:text-black">
            <ArrowLeft className="h-3.5 w-3.5" /> Tornar a factures
          </Link>
          <h1 className="font-oswald text-2xl uppercase tracking-[0.04em]">
            {draft.document_kind === 'rectification' ? 'Factura rectificativa' : 'Factura manual'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Esborrany editable. El número s’assignarà només quan s’emeti.</p>
        </div>
        <div className="flex gap-2">
          {draftId && (
            <button type="button" onClick={discard} className="inline-flex items-center gap-2 border border-red-200 px-4 py-2 text-xs uppercase tracking-wider text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Eliminar
            </button>
          )}
          <button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-xs uppercase tracking-wider hover:border-black">
            <Eye className="h-4 w-4" /> Previsualitzar
          </button>
          <button type="button" onClick={save} disabled={status === 'saving' || status === 'issuing'} className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-xs uppercase tracking-wider hover:border-black disabled:opacity-50">
            <Save className="h-4 w-4" /> Desar
          </button>
          <button type="button" onClick={issue} disabled={status === 'saving' || status === 'issuing'} className="inline-flex items-center gap-2 bg-gray-900 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-black disabled:opacity-50">
            <Send className="h-4 w-4" /> Emetre
          </button>
        </div>
      </div>

      {message && <div className={`mb-5 border px-4 py-3 text-sm ${status === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600'}`}>{message}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-oswald text-xs uppercase tracking-[0.16em] text-gray-500">Document</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipus">
                <select value={draft.invoice_type} onChange={(event) => setField('invoice_type', event.target.value)} className={inputClass}>
                  <option value="simplified">Simplificada (FS)</option>
                  <option value="full">Ordinària (FO)</option>
                </select>
              </Field>
              <Field label="Comanda o referència">
                <input value={draft.order_number || ''} onChange={(event) => setField('order_number', event.target.value)} className={inputClass} />
              </Field>
              {draft.document_kind === 'rectification' && (
                <Field label="Motiu de la rectificació" className="sm:col-span-2">
                  <textarea value={draft.correction_reason || ''} onChange={(event) => setField('correction_reason', event.target.value)} rows="3" className={inputClass} required />
                </Field>
              )}
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-oswald text-xs uppercase tracking-[0.16em] text-gray-500">Client</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom i cognoms"><input value={draft.customer_name || ''} onChange={(event) => setField('customer_name', event.target.value)} className={inputClass} /></Field>
              <Field label="Correu"><input type="email" value={draft.customer_email || ''} onChange={(event) => setField('customer_email', event.target.value)} className={inputClass} /></Field>
              <Field label="Empresa"><input value={draft.customer_company || ''} onChange={(event) => setField('customer_company', event.target.value)} className={inputClass} /></Field>
              <Field label="NIF / CIF"><input value={draft.customer_tax_id || ''} onChange={(event) => setField('customer_tax_id', event.target.value)} className={inputClass} /></Field>
              <Field label="Carrer, plaça o via i número"><input value={draft.customer_address || ''} onChange={(event) => setField('customer_address', event.target.value)} placeholder="Per exemple: carrer Major, 12" className={inputClass} /></Field>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Field label="Pis"><input value={addressDetails.floor} onChange={(event) => setAddressDetail('floor', event.target.value)} placeholder="2n" className={inputClass} /></Field>
                <Field label="Porta"><input value={addressDetails.door} onChange={(event) => setAddressDetail('door', event.target.value)} placeholder="1a" className={inputClass} /></Field>
                <Field label="Escala"><input value={addressDetails.staircase} onChange={(event) => setAddressDetail('staircase', event.target.value)} placeholder="B" className={inputClass} /></Field>
                <Field label="Bloc"><input value={addressDetails.block} onChange={(event) => setAddressDetail('block', event.target.value)} placeholder="3" className={inputClass} /></Field>
              </div>
              <Field label="Altres indicacions postals (si calen)" className="sm:col-span-2"><input value={addressDetails.other} onChange={(event) => setAddressDetail('other', event.target.value)} placeholder="Urbanització, apartament, nau o local" className={inputClass} /></Field>
              <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[140px_1fr_1fr]">
                <Field label="CP"><input value={draft.customer_postal_code || ''} onChange={(event) => setField('customer_postal_code', event.target.value)} className={inputClass} /></Field>
                <Field label="Ciutat"><input value={draft.customer_city || ''} onChange={(event) => setField('customer_city', event.target.value)} className={inputClass} /></Field>
                <Field label="País">
                  <div className="relative">
                    <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                    <select value={draft.customer_country || ''} onChange={(event) => setField('customer_country', event.target.value)} className={`${inputClass} appearance-none pl-9 text-gray-400`}>
                      <option value="">Selecciona un país</option>
                      {draft.customer_country && !COUNTRIES.includes(draft.customer_country) && <option value={draft.customer_country}>{draft.customer_country}</option>}
                      {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                  </div>
                </Field>
              </div>
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-oswald text-xs uppercase tracking-[0.16em] text-gray-500">Línies</h2>
              <button type="button" onClick={() => setDraft((current) => ({ ...current, items: [...current.items, emptyLine()] }))} className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gray-600 hover:text-black">
                <Plus className="h-4 w-4" /> Afegir línia
              </button>
            </div>
            <div className="space-y-3">
              {draft.items.map((line, index) => (
                <div key={index} className="grid gap-3 border-b border-gray-100 pb-3 sm:grid-cols-[1fr_90px_130px_36px]">
                  <div className="space-y-2">
                    <input value={line.name || ''} onChange={(event) => setLine(index, 'name', event.target.value)} placeholder="Concepte" className={inputClass} />
                    <input value={line.description || ''} onChange={(event) => setLine(index, 'description', event.target.value)} placeholder="Descripció opcional" className={inputClass} />
                  </div>
                  <Field label="Quantitat"><input type="number" min="1" value={line.quantity} onChange={(event) => setLine(index, 'quantity', event.target.value)} className={inputClass} /></Field>
                  <Field label="Preu unitari amb IVA"><input type="number" step="0.01" value={line.product_price} onChange={(event) => setLine(index, 'product_price', event.target.value)} className={inputClass} /></Field>
                  <button type="button" onClick={() => removeLine(index)} disabled={draft.items.length === 1} aria-label="Eliminar línia" className="mt-5 h-9 text-gray-400 hover:text-red-600 disabled:opacity-20"><Trash2 className="mx-auto h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <Field label="Transport amb IVA" className="mt-4 ml-auto max-w-[220px]">
              <input type="number" step="0.01" value={draft.shipping_total} onChange={(event) => setField('shipping_total', event.target.value)} className={inputClass} />
            </Field>
          </section>
        </div>

        <aside className="h-fit border border-gray-900 bg-white p-5 lg:sticky lg:top-6">
          <h2 className="font-oswald text-sm uppercase tracking-[0.16em]">Resum</h2>
          <div className="mt-5 space-y-3 text-sm tabular-nums">
            <div className="flex justify-between"><span className="text-gray-500">Productes</span><span>{eur(totals.products)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Transport</span><span>{eur(totals.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Base imposable</span><span>{eur(totals.base)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">IVA 21%</span><span>{eur(totals.iva)}</span></div>
            <div className="flex justify-between border-t-2 border-gray-900 pt-3 font-oswald text-lg"><span>Total</span><span>{eur(totals.total)}</span></div>
          </div>
          <div className="mt-5 bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
            Sèrie prevista: <strong className="text-gray-900">{draft.document_kind === 'rectification' ? 'FR' : draft.invoice_type === 'full' ? 'FO' : 'FS'}</strong>. Desar no consumeix cap número.
          </div>
        </aside>
      </div>

      {previewOpen && <InvoicePreview draft={draft} totals={totals} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
