import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/api/supabase-products';

/**
 * Les factures del client.
 *
 * Les dades les filtra la pròpia base de dades: cada usuari només pot veure
 * les factures que són seves (política RLS d'`invoices`). Aquesta pàgina, per
 * tant, no ha de comprovar res pel seu compte.
 *
 * S'hi arriba des del correu de confirmació (enllaç directe a la factura) o
 * des d'aquí, quan el client vol recuperar una factura vella.
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

export default function MyInvoicesPage() {
  const [estat, setEstat] = useState('carregant');
  const [factures, setFactures] = useState([]);

  useEffect(() => {
    let viu = true;
    supabase
      .from('invoices')
      .select('number, invoice_type, issued_at, total, access_token')
      .order('issued_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (!viu) return;
        if (error) { setEstat('error'); return; }
        setFactures(Array.isArray(data) ? data : []);
        setEstat('ok');
      });
    return () => { viu = false; };
  }, []);

  // Agrupades per any, de la més nova a la més vella.
  const perAny = useMemo(() => {
    const grups = new Map();
    for (const f of factures) {
      const any = (f.number || '').slice(0, 4) || String(new Date(f.issued_at).getFullYear());
      if (!grups.has(any)) grups.set(any, []);
      grups.get(any).push(f);
    }
    return [...grups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [factures]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="font-oswald text-2xl tracking-[0.04em] uppercase mb-1">Les meves factures</h1>
        <p className="text-sm text-gray-500 mb-7">
          Aquí tens totes les factures de les teves comandes. Es poden obrir i desar en PDF quan vulguis.
        </p>

        {estat === 'carregant' && <div className="text-gray-400 text-sm">Carregant…</div>}

        {estat === 'error' && (
          <div className="text-sm text-gray-600 border border-gray-200 bg-gray-50 px-4 py-3">
            No s&apos;han pogut carregar les factures. Torna-ho a provar d&apos;aquí una estona.
          </div>
        )}

        {estat === 'ok' && factures.length === 0 && (
          <div className="text-sm text-gray-600 border border-gray-200 bg-gray-50 px-4 py-3">
            Encara no tens cap factura. Quan facis una comanda, apareixerà aquí.
          </div>
        )}

        {estat === 'ok' && perAny.map(([any, llista]) => (
          <section key={any} className="mb-8">
            <div className="font-oswald text-[11px] tracking-[0.18em] uppercase text-gray-400 mb-2 pb-1 border-b border-gray-200">
              {any}
            </div>
            <ul>
              {llista.map((f) => (
                <li key={f.number} className="flex items-center gap-4 py-3 border-b border-gray-100 text-sm">
                  <span className="font-oswald tracking-wide w-28 shrink-0">{f.number}</span>
                  <span className="text-gray-500 w-24 shrink-0 tabular-nums">{fmtDate(f.issued_at)}</span>
                  <span className="text-gray-400 text-[11px] tracking-[0.12em] uppercase flex-1">
                    {f.invoice_type === 'full' ? 'Factura' : 'Simplificada'}
                  </span>
                  <span className="tabular-nums w-20 text-right">{eur(f.total)}</span>
                  {f.access_token ? (
                    <Link
                      to={`/factura/${f.access_token}`}
                      className="w-16 text-right text-[11px] tracking-[0.12em] uppercase underline decoration-gray-300 hover:decoration-black"
                    >
                      Veure
                    </Link>
                  ) : (
                    <span className="w-16" />
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
