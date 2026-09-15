import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function AdminInvoicesPage() {
  const [estat, setEstat] = useState('carregant');
  const [dades, setDades] = useState({ invoices: [], totals: { perAny: [], perTrimestre: [] }, truncated: false });
  const [anyFiltre, setAnyFiltre] = useState('');
  const [tipusFiltre, setTipusFiltre] = useState('');
  const [cerca, setCerca] = useState('');
  const [cercaAplicada, setCercaAplicada] = useState('');

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
        const res = await fetch(`/api/admin-invoices?${params.toString()}`, { headers });
        if (!viu) return;
        if (!res.ok) { setEstat('error'); return; }
        const json = await res.json();
        if (!viu) return;
        setDades({
          invoices: json.invoices || [],
          totals: json.totals || { perAny: [], perTrimestre: [] },
          truncated: Boolean(json.truncated),
        });
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
      (acc, a) => ({ count: acc.count + a.count, total: acc.total + a.total, iva: acc.iva + a.iva }),
      { count: 0, total: 0, iva: 0 }
    ),
    [dades]
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <h1 className="font-oswald text-2xl tracking-[0.04em] uppercase mb-1">Factures</h1>
      <p className="text-sm text-gray-500 mb-6">
        Totes les factures emeses, amb els totals per any i per trimestre.
      </p>

      {/* Filtres */}
      <form
        onSubmit={(e) => { e.preventDefault(); setCercaAplicada(cerca.trim()); }}
        className="flex flex-wrap items-end gap-3 mb-6 pb-6 border-b border-gray-200"
      >
        <Camp etiqueta="Any">
          <select value={anyFiltre} onChange={(e) => setAnyFiltre(e.target.value)} className={inputClass}>
            <option value="">Tots</option>
            {anys.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </Camp>
        <Camp etiqueta="Tipus">
          <select value={tipusFiltre} onChange={(e) => setTipusFiltre(e.target.value)} className={inputClass}>
            <option value="">Tots</option>
            <option value="full">Factura</option>
            <option value="simplified">Simplificada</option>
          </select>
        </Camp>
        <Camp etiqueta="Cerca">
          <input
            type="search"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Número, client, CIF o comanda"
            className={`${inputClass} w-72`}
          />
        </Camp>
        <button
          type="submit"
          className="px-5 py-2 bg-gray-900 text-white font-oswald tracking-[0.12em] uppercase text-xs hover:bg-black transition-colors"
        >
          Cercar
        </button>
        {(anyFiltre || tipusFiltre || cercaAplicada) && (
          <button
            type="button"
            onClick={() => { setAnyFiltre(''); setTipusFiltre(''); setCerca(''); setCercaAplicada(''); }}
            className="px-3 py-2 text-xs uppercase tracking-[0.12em] text-gray-500 hover:text-gray-900 transition-colors"
          >
            Treure filtres
          </button>
        )}
      </form>

      {estat === 'carregant' && <div className="text-gray-400 text-sm">Carregant…</div>}

      {estat === 'error' && (
        <div className="text-sm text-gray-600 border border-gray-200 bg-gray-50 px-4 py-3">
          No s&apos;han pogut carregar les factures.
        </div>
      )}

      {estat === 'ok' && (
        <>
          {dades.truncated && (
            <div className="text-sm text-amber-700 border border-amber-200 bg-amber-50 px-4 py-3 mb-5">
              Hi ha més factures de les que es poden mostrar alhora. Els totals de sota són només d&apos;aquestes.
              Estreta la cerca per veure-les totes.
            </div>
          )}

          {/* Totals per trimestre */}
          {dades.totals.perTrimestre.length > 0 && (
            <section className="mb-8">
              <h2 className="font-oswald text-[11px] tracking-[0.18em] uppercase text-gray-400 mb-3">
                Totals per trimestre
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-900">
                      <th className="text-left font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2">Període</th>
                      <th className="text-right font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-24">Factures</th>
                      <th className="text-right font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-32">Base</th>
                      <th className="text-right font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-28">IVA</th>
                      <th className="text-right font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dades.totals.perTrimestre.map((t) => (
                      <tr key={t.period} className="border-b border-gray-100">
                        <td className="py-2 font-oswald tracking-wide">{t.period}</td>
                        <td className="py-2 text-right tabular-nums text-gray-500">{t.count}</td>
                        <td className="py-2 text-right tabular-nums">{eur(t.base)}</td>
                        <td className="py-2 text-right tabular-nums">{eur(t.iva)}</td>
                        <td className="py-2 text-right tabular-nums font-oswald">{eur(t.total)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-900">
                      <td className="py-2 font-oswald uppercase text-[12px] tracking-[0.1em]">Total mostrat</td>
                      <td className="py-2 text-right tabular-nums text-gray-500">{totalGeneral.count}</td>
                      <td className="py-2" />
                      <td className="py-2 text-right tabular-nums">{eur(totalGeneral.iva)}</td>
                      <td className="py-2 text-right tabular-nums font-oswald">{eur(totalGeneral.total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Factures */}
          <section>
            <h2 className="font-oswald text-[11px] tracking-[0.18em] uppercase text-gray-400 mb-3">
              Factures ({dades.invoices.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-900">
                    <th className="text-left font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-32">Número</th>
                    <th className="text-left font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-24">Data</th>
                    <th className="text-left font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2">Client</th>
                    <th className="text-left font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-28">CIF</th>
                    <th className="text-left font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-28">Tipus</th>
                    <th className="text-right font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 w-24">Total</th>
                    <th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {dades.invoices.map((f) => (
                    <tr key={f.number} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 font-oswald tracking-wide">{f.number}</td>
                      <td className="py-2 text-gray-500 tabular-nums">{fmtDate(f.issued_at)}</td>
                      <td className="py-2">
                        <div>{f.customer_name || '—'}</div>
                        {f.customer_company && <div className="text-[11px] text-gray-400">{f.customer_company}</div>}
                      </td>
                      <td className="py-2 text-gray-500">{f.customer_tax_id || '—'}</td>
                      <td className="py-2 text-[11px] tracking-[0.1em] uppercase text-gray-400">
                        {f.invoice_type === 'full' ? 'Factura' : 'Simplificada'}
                      </td>
                      <td className="py-2 text-right tabular-nums">{eur(f.total)}</td>
                      <td className="py-2 text-right">
                        {f.access_token ? (
                          <Link
                            to={`/factura/${f.access_token}`}
                            className="text-[11px] tracking-[0.1em] uppercase underline decoration-gray-300 hover:decoration-black"
                          >
                            Veure
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {dades.invoices.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        No hi ha cap factura amb aquests filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
