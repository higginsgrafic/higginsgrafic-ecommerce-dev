/**
 * Comprova, contra la base de dades de debò, que el mode de proves hi és.
 *
 * PER QUÈ EXISTEIX
 *
 * Una migració escrita no vol dir una migració executada. La validació
 * d'imports va estar mesos al repositori sense arribar mai a la base de dades,
 * i ningú no se'n va adonar perquè l'última instrucció del fitxer era una
 * comprovació que no donava error.
 *
 * Aquest guió no es refia de cap document: pregunta a la base de dades. I ho
 * fa servir el propietari per saber si pot començar a provar, i qui mantingui
 * el projecte després per saber si el mode de proves continua dempeus.
 *
 * COM ES FA SERVIR
 *
 *     node scripts/verifica-mode-de-proves.mjs
 *
 * No calen claus noves: fa servir les del `.env`.
 *
 * PER QUÈ ÉS SEGUR
 *
 * Cada prova que toca dades va dins d'una transacció que s'ha de desfer, i el
 * guió COMPROVA que s'ha desfet de debò (compta les files abans i després).
 * Això és a posta: el 16/09/2026 una fila de prova es va quedar a `invoices`
 * perquè es va donar per fet que `Prefer: tx=rollback` funcionava sense
 * comprovar-ho. Aquí, si una prova no es desfà, el guió s'atura i ho diu.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const env = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
const llegir = (clau) => {
  const m = env.match(new RegExp(`^${clau}=(.*)$`, 'm'));
  return (m?.[1] || '').trim().replace(/^["']|["']$/g, '');
};

const URL_BASE = llegir('VITE_SUPABASE_URL') || process.env.SUPABASE_URL;
const CLAU = llegir('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !CLAU) {
  console.error('Falten VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY al .env');
  process.exit(1);
}

const capçaleres = { apikey: CLAU, Authorization: `Bearer ${CLAU}` };

let fallades = 0;
let avisos = 0;

function be(text) { console.log(`  \x1b[32mOK\x1b[0m    ${text}`); }
function malament(text) { fallades++; console.log(`  \x1b[31mFALLA\x1b[0m ${text}`); }
function avis(text) { avisos++; console.log(`  \x1b[33mAVIS\x1b[0m  ${text}`); }
function seccio(titol) { console.log(`\n\x1b[1m${titol}\x1b[0m`); }

/** Consulta una taula. Retorna { estat, files, error }. */
async function consulta(taula, select = '*', extra = '') {
  const resposta = await fetch(`${URL_BASE}/rest/v1/${taula}?select=${select}&limit=1${extra}`, { headers: capçaleres });
  const text = await resposta.text();
  let files = [];
  try { files = JSON.parse(text); } catch { files = []; }
  return { estat: resposta.status, files, error: resposta.status >= 400 ? JSON.parse(text) : null };
}

/** Nombre de files reals d'una taula. */
async function comptar(taula) {
  const resposta = await fetch(`${URL_BASE}/rest/v1/${taula}?select=*&limit=1`, {
    headers: { ...capçaleres, Prefer: 'count=exact' },
  });
  const rang = resposta.headers.get('content-range') || '*/0';
  return Number(rang.split('/')[1] || 0);
}

/**
 * Una prova que ha de ser rebutjada, dins d'una transacció que es desfà.
 * Comprova que la fila NO hi ha quedat: si hi queda, s'atura tot.
 */
async function provaRebuig(taula, cos, descripcio, missatgeEsperat) {
  const abans = await comptar(taula);
  const resposta = await fetch(`${URL_BASE}/rest/v1/${taula}`, {
    method: 'POST',
    headers: { ...capçaleres, 'Content-Type': 'application/json', Prefer: 'tx=rollback,return=representation' },
    body: JSON.stringify(cos),
  });
  const text = await resposta.text();
  const despres = await comptar(taula);

  if (despres > abans) {
    // El pitjor cas: s'ha acceptat i la fila hi ha quedat.
    malament(`${descripcio}: LA FILA HA QUEDAT A LA BASE (abans ${abans}, després ${despres}). Atura't i esborra-la.`);
    console.log(`        Resposta: ${text.slice(0, 200)}`);
    return;
  }

  if (resposta.status >= 400) {
    const coincideix = !missatgeEsperat || new RegExp(missatgeEsperat, 'i').test(text);
    if (coincideix) be(`${descripcio} (rebutjada, i no ha quedat cap fila)`);
    else avis(`${descripcio}: rebutjada, però amb un missatge inesperat: ${text.slice(0, 160)}`);
  } else {
    // Acceptada, però la transacció s'ha desfet: el guard no hi és o no mira
    // el que hauria de mirar.
    malament(`${descripcio}: la base de dades l'ha ACCEPTAT i no hauria.`);
  }
}

console.log('\x1b[1mComprovació del mode de proves\x1b[0m');
console.log(`Base de dades: ${URL_BASE}`);

// ------------------------------------------------------------
seccio('1. Les columnes');
let faltenColumnes = false;
for (const taula of ['orders', 'invoices', 'invoice_drafts']) {
  const { error } = await consulta(taula, 'is_test');
  if (error?.code === '42703') { faltenColumnes = true; malament(`${taula}.is_test no existeix`); }
  else if (error) { faltenColumnes = true; malament(`${taula}.is_test: ${error.message}`); }
  else be(`${taula}.is_test existeix`);
}

// ------------------------------------------------------------
seccio('2. El comptador de proves')
{
  const { error } = await consulta('invoice_test_counters', 'year,last_number');
  if (error) malament(`invoice_test_counters no existeix (${error.message})`);
  else be('invoice_test_counters existeix');
}

// ------------------------------------------------------------
seccio('3. La sèrie fiscal, intacta')
{
  const series = await consulta('invoice_series_counters', 'series,year,last_number');
  if (series.error) {
    malament(`No s'ha pogut llegir invoice_series_counters: ${series.error.message}`);
  } else if (!series.files.length) {
    be('invoice_series_counters és buit: cap número fiscal gastat');
  } else {
    avis(`invoice_series_counters ja té files: ${JSON.stringify(series.files[0])}`);
  }

  const factures = await comptar('invoices');
  const comptadorProves = await consulta('invoice_test_counters', 'last_number');
  const filesComptador = Array.isArray(comptadorProves.files) ? comptadorProves.files : [];
  const proves = filesComptador.reduce((n, f) => n + (Number(f.last_number) || 0), 0);
  if (comptadorProves.error) {
    be(`invoices té ${factures} files`);
  } else if (factures === proves) {
    be(`invoices té ${factures} files i el comptador de proves en compta ${proves}: quadra`);
  } else {
    avis(`invoices té ${factures} files i el comptador de proves en compta ${proves}`);
  }
}

// ------------------------------------------------------------
if (faltenColumnes) {
  seccio('4 i 5. Els murs');
  console.log('  \x1b[33mNo es poden comprovar: falta la migració del mode de proves.\x1b[0m');
  console.log('  Executa primer `20260916130000_mode_de_proves.sql` i torna a passar aquest guió.');
} else {
  seccio('4. Els murs (proves que han de ser rebutjades)');
  {
    // Una comanda de prova NO pot portar un número fiscal.
    await provaRebuig('invoices', {
      number: 'FS-2026-999999', invoice_type: 'simplified', document_kind: 'invoice',
      source: 'manual', base_products: 10, base_shipping: 0, iva: 2.1, total: 12.1, is_test: true,
    }, 'Una prova amb número fiscal', 'PROVA-');

    // Una factura de debò NO pot portar el prefix de prova.
    await provaRebuig('invoices', {
      number: 'PROVA-2026-999999', invoice_type: 'simplified', document_kind: 'invoice',
      source: 'manual', base_products: 10, base_shipping: 0, iva: 2.1, total: 12.1, is_test: false,
    }, 'Una factura de debò amb número PROVA-', 'PROVA-');

    // Els imports han de quadrar.
    await provaRebuig('invoices', {
      number: 'PROVA-2026-999998', invoice_type: 'simplified', document_kind: 'invoice',
      source: 'manual', base_products: 100, base_shipping: 0, iva: 21, total: 1, is_test: true,
    }, 'Una factura amb imports que no quadren', 'no quadren');
  }

  seccio('5. El bloc del client');
  {
    // La política ha de ser SELECT i amb el filtre de les proves. Com que no
    // es pot llegir `pg_policies` des d'aquí, es comprova el que es pot: que
    // la taula respon. La política es comprova amb la consulta SQL del pla.
    const { estat } = await consulta('invoices', 'id');
    if (estat === 200) {
      be('invoices respon');
      avis('Amb la clau de SERVEI sempre es veu tot: la política del client s\'ha de comprovar amb la consulta SQL del pla.');
    } else {
      malament(`invoices no respon (${estat})`);
    }
  }
}

// ------------------------------------------------------------
console.log('');
if (fallades === 0 && avisos === 0) {
  console.log('\x1b[32m\x1b[1mTot correcte: el mode de proves està instal·lat.\x1b[0m');
  console.log('Ja pots fer una prova: /admin/factures/proves → «Generar una prova»');
} else if (fallades === 0) {
  console.log(`\x1b[33m\x1b[1mCap fallada, però hi ha ${avisos} avís(os) que val la pena llegir.\x1b[0m`);
} else {
  console.log(`\x1b[31m\x1b[1m${fallades} comprovació(ns) han fallat.\x1b[0m`);
  console.log('Si les columnes `is_test` no existeixen, falta executar:');
  console.log('  supabase/migrations/20260916130000_mode_de_proves.sql');
  process.exitCode = 1;
}
