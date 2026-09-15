import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FlaskConical, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { authHeaders } from '@/api/authHeaders';
import { CLAU_MODE_PROVES } from '@/api/stripe';

/**
 * Eines per fer proves.
 *
 * PER QUÈ EXISTEIX
 *
 * El mode de proves ja funcionava, però no hi havia manera de veure QUÈ havia
 * passat: les comandes de prova no surten enlloc (a posta, perquè no compten),
 * i les factures de prova només eren al llistat de proves. Sense veure el
 * resultat, provar és endevinar.
 *
 * Aquesta pàgina té tres coses:
 *
 *   1. L'interruptor del mode de proves per a les compres amb targeta.
 *   2. Les dades per fer-les (la targeta de prova de Stripe).
 *   3. El que ha passat: les darreres comandes i factures de prova, i si el
 *      correu està configurat.
 *
 * RES DEL QUE SURT D'AQUÍ ÉS UN DOCUMENT FISCAL. Ni compta a les declaracions
 * ni surt al compte de cap client.
 */

const eur = (n) => new Intl.NumberFormat('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  .format(Math.round((Number(n) || 0) * 100) / 100) + ' €';

const fmt = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('ca-ES', { dateStyle: 'short', timeStyle: 'short' }).format(d);
};

function Targeta({ etiqueta, valor, copiable = false }) {
  const [copiat, setCopiat] = useState(false);
  const copia = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiat(true);
      setTimeout(() => setCopiat(false), 1500);
    } catch { /* si no es pot copiar, es llegeix a mà */ }
  };
  return (
    <div className="border border-gray-200 bg-white px-3 py-2">
      <div className="font-oswald text-[9px] uppercase tracking-[0.16em] text-gray-400">{etiqueta}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="font-oswald tabular-nums text-gray-900">{valor}</span>
        {copiable && (
          <button type="button" onClick={copia} className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-gray-900">
            {copiat ? 'Copiat' : 'Copiar'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminTestToolsPage() {
  // Es llegeix amb un inicialitzador i no dins d'un `useEffect`: fer servir
  // `setState` dins d'un effect provoca un segon cicle de render innecessari.
  const [modeActiu, setModeActiu] = useState(() => {
    try { return window.localStorage.getItem(CLAU_MODE_PROVES) === '1'; } catch { return false; }
  });
  const [estat, setEstat] = useState('carregant');
  const [comandes, setComandes] = useState([]);
  const [factures, setFactures] = useState([]);
  const [missatge, setMissatge] = useState('');
  const [generant, setGenerant] = useState(false);

  const viu = useRef(true);

  /**
   * Consulta les comandes i factures de prova.
   *
   * Es fa servir des del botó d'actualitzar i des de la càrrega inicial. La
   * càrrega inicial té la seva pròpia funció interna (vegeu l'effect) perquè
   * una crida dins d'un effect es llegeix com una actualització d'estat
   * sincrònica, i aquí no ho és: tot arriba després d'esperar el servidor.
   */
  const consultaProves = useCallback(async () => {
    const headers = await authHeaders();
    const [resComandes, resFactures] = await Promise.all([
      fetch('/api/orders?list=1&test=1', { headers }),
      fetch('/api/admin-invoices?test=true', { headers }),
    ]);
    let comandesNoves = null;
    let facturesNoves = null;
    if (resComandes.ok) {
      const d = await resComandes.json();
      comandesNoves = d.orders || [];
    }
    if (resFactures.ok) {
      const d = await resFactures.json();
      facturesNoves = d.invoices || [];
    }
    return { comandesNoves, facturesNoves };
  }, []);

  const refresca = useCallback(async () => {
    try {
      const { comandesNoves, facturesNoves } = await consultaProves();
      if (!viu.current) return;
      if (comandesNoves) setComandes(comandesNoves);
      if (facturesNoves) setFactures(facturesNoves);
      setEstat('ok');
    } catch {
      if (viu.current) setEstat('error');
    }
  }, [consultaProves]);

  useEffect(() => {
    let viuEncara = true;
    const carrega = async () => {
      try {
        const { comandesNoves, facturesNoves } = await consultaProves();
        if (!viuEncara) return;
        if (comandesNoves) setComandes(comandesNoves);
        if (facturesNoves) setFactures(facturesNoves);
        setEstat('ok');
      } catch {
        if (viuEncara) setEstat('error');
      }
    };
    carrega();
    return () => { viuEncara = false; viu.current = false; };
  }, [consultaProves]);

  const canviaMode = (actiu) => {
    setModeActiu(actiu);
    try {
      if (actiu) window.localStorage.setItem(CLAU_MODE_PROVES, '1');
      else window.localStorage.removeItem(CLAU_MODE_PROVES);
    } catch { /* res */ }
    setMissatge(actiu
      ? 'Mode de proves engegat. La propera compra que facis quedarà marcada com a prova: factura PROVA-, correu a l’adreça de proves i res a Gelato.'
      : 'Mode de proves apagat. Les compres tornaran a ser de debò.');
  };

  const generaProva = async () => {
    setGenerant(true);
    setMissatge('Generant la prova…');
    try {
      const headers = await authHeaders({ 'Content-Type': 'application/json' });
      const resposta = await fetch('/api/admin-test-order', {
        method: 'POST', headers, body: JSON.stringify({ quantity: 1 }),
      });
      const d = await resposta.json();
      if (!resposta.ok) {
        setMissatge(d.error || 'No s’ha pogut generar la prova.');
        return;
      }
      setMissatge(`Prova creada: ${d.invoice?.number}. ${d.correuEnviat ? 'El correu ha sortit cap a l’adreça de proves.' : `No s’ha enviat cap correu${d.correuMotiu ? ` (${d.correuMotiu})` : ''}.`}`);
      await refresca();
    } catch {
      setMissatge('No s’ha pogut generar la prova.');
    } finally {
      setGenerant(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/factures/proves" className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-gray-500 hover:text-black">
            <ArrowLeft className="h-3.5 w-3.5" /> Tornar a les proves
          </Link>
          <h1 className="font-oswald text-2xl uppercase tracking-[0.04em]">Eines de prova</h1>
          <p className="mt-1 text-sm text-gray-500">
            Per provar el circuit sencer sense gastar cap número de la sèrie fiscal i sense que res compti enlloc.
          </p>
        </div>
        <button type="button" onClick={refresca} className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-xs uppercase tracking-wider hover:border-black">
          <RefreshCw className="h-4 w-4" /> Actualitzar
        </button>
      </div>

      {missatge && <div className="mb-5 border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">{missatge}</div>}

      {/* 1. L'interruptor */}
      <section className={`mb-6 border-2 p-5 ${modeActiu ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-oswald text-sm uppercase tracking-[0.14em]">
              Compres amb targeta {modeActiu ? '· MODE DE PROVES ENGEGAT' : ''}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              Amb el mode engegat, la propera compra que facis des del cistell quedarà marcada com a prova:
              la factura serà <strong>PROVA-</strong>, el correu anirà a l’adreça de proves i no s’enviarà res a Gelato.
            </p>
          </div>
          <button
            type="button"
            onClick={() => canviaMode(!modeActiu)}
            className={`shrink-0 px-5 py-3 font-oswald text-xs uppercase tracking-[0.12em] text-white ${modeActiu ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-900 hover:bg-black'}`}
          >
            {modeActiu ? 'Aturar el mode de proves' : 'Engegar el mode de proves'}
          </button>
        </div>

        {modeActiu && (
          <div className="mt-5 border-t border-amber-200 pt-4">
            <div className="mb-3 font-oswald text-[10px] uppercase tracking-[0.16em] text-amber-800">
              Dades de la targeta de prova de Stripe
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Targeta etiqueta="Número" valor="4242 4242 4242 4242" copiable />
              <Targeta etiqueta="Caducitat" valor="12 / 34" />
              <Targeta etiqueta="CVC" valor="123" />
              <Targeta etiqueta="Codi postal" valor="08032" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Link to="/cistell" className="inline-flex items-center gap-2 bg-amber-600 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-amber-700">
                Anar al cistell i comprar
              </Link>
              <span className="text-gray-500">
                Fes la compra com un client normal. En acabar, aquí hi trobaràs la comanda i la factura.
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Generar una prova sense targeta */}
      <section className="mb-6 border border-gray-200 bg-white p-5">
        <h2 className="font-oswald text-sm uppercase tracking-[0.14em]">Generar una prova sense targeta</h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-600">
          Crea una comanda de prova amb la seva factura <strong>PROVA-</strong> i el seu correu, agafant una peça
          real del catàleg i calculant els imports com al checkout. No passa per Stripe ni envia res a Gelato.
        </p>
        <button
          type="button"
          onClick={generaProva}
          disabled={generant}
          className="mt-4 inline-flex items-center gap-2 bg-gray-900 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-black disabled:opacity-50"
        >
          <FlaskConical className="h-4 w-4" /> {generant ? 'Generant…' : 'Generar una prova'}
        </button>
      </section>

      {/* 3. Què ha passat */}
      <section className="mb-6 border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="font-oswald text-sm uppercase tracking-[0.14em]">Comandes de prova ({comandes.length})</h2>
          <span className="text-xs text-gray-400">No surten enlloc més, i no compten a les declaracions</span>
        </div>
        {estat === 'carregant' && <div className="px-5 py-6 text-sm text-gray-400">Carregant…</div>}
        {estat === 'error' && <div className="px-5 py-6 text-sm text-red-600">No s’han pogut carregar. Comprova que el servidor sigui el de les proves (vegeu la nota del capdamunt de la pàgina).</div>}
        {estat === 'ok' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-900">
                  {['Data', 'Número', 'Estat', 'Total', 'Gelato', 'Factura'].map((h, i) => (
                    <th key={h} className={`px-4 py-2 font-oswald text-[10px] font-normal uppercase tracking-[0.14em] text-gray-400 ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comandes.map((c) => {
                  const factura = factures.find((f) => f.order_number && f.order_number === c.order_number);
                  return (
                    <tr key={c.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-500">{fmt(c.created_at)}</td>
                      <td className="px-4 py-3 font-oswald">{c.order_number || '—'}</td>
                      <td className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">{c.statusLabel || c.status}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{eur(c.total)}</td>
                      <td className="px-4 py-3 text-right">
                        {c.gelato_order_id
                          ? <span className="text-red-600">Sí (!)</span>
                          : <span className="text-green-700">No</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-oswald">
                        {factura?.access_token
                          ? <Link to={`/factura/${factura.access_token}`} className="underline hover:no-underline">{factura.number}</Link>
                          : (factura?.number || '—')}
                      </td>
                    </tr>
                  );
                })}
                {!comandes.length && (
                  <tr><td colSpan="6" className="px-5 py-10 text-center text-gray-400">Encara no hi ha cap comanda de prova.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="font-oswald text-sm uppercase tracking-[0.14em]">Factures de prova ({factures.length})</h2>
          <Link to="/admin/factures/proves" className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900">
            Gestionar-les
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-900">
                {['Número', 'Data', 'Client', 'Total', ''].map((h, i) => (
                  <th key={h} className={`px-4 py-2 font-oswald text-[10px] font-normal uppercase tracking-[0.14em] text-gray-400 ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {factures.map((f) => (
                <tr key={f.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-oswald">{f.number}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(f.issued_at)}</td>
                  <td className="px-4 py-3">{f.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{eur(f.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {f.access_token && <Link to={`/factura/${f.access_token}`} className="border border-gray-200 px-2 py-1 text-[10px] uppercase tracking-wider hover:border-black">Veure</Link>}
                      {/* Esborrar una prova es fa des de la llista de proves,
                          que és qui té l'endpoint. Aquí només s'hi porta. */}
                      <Link to="/admin/factures/proves" className="inline-flex items-center gap-1 border border-red-200 px-2 py-1 text-[10px] uppercase tracking-wider text-red-700 hover:bg-red-50">
                        <Trash2 className="h-3 w-3" /> Esborrar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!factures.length && (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">Encara no hi ha cap factura de prova.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Recordatori del que NO passa */}
      <section className="mt-6 border border-gray-200 bg-gray-50 p-5">
        <h2 className="font-oswald text-xs uppercase tracking-[0.16em] text-gray-500">Què garanteix el mode de proves</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> Cap número de la sèrie FO/FS/FR es gasta. <code className="text-xs">invoice_series_counters</code> ha de continuar buit.</li>
          <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> Cap prova surt al compte d’un client: la política de la base de dades les amaga.</li>
          <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> Cap correu arriba a un client: només a l’adreça de proves.</li>
          <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> Res no s’envia a Gelato: no es paga cap samarreta de debò.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" /> Les proves es poden esborrar, i no compten a les declaracions.</li>
        </ul>
        <p className="mt-4 text-xs text-gray-500">
          Per comprovar-ho tot d’una tirada, al terminal: <code>npm run verifica:proves</code>
        </p>
      </section>
    </div>
  );
}
