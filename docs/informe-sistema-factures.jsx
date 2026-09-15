import React from 'react';

/**
 * INFORME DEL SISTEMA DE FACTURES — Higgins GRÀFIC
 *
 * Document de traspàs del sistema i la interfície de gestió de factures.
 * Es pot llegir com a codi o renderitzar com a pàgina.
 *
 * Per veure'l a la botiga:
 *   src/routes/lazyPages.js   → export const InformeFacturesPage = lazy(() => import('@/pages/InformeFacturesPage'));
 *   src/routes/AppRoutes.jsx  → <Route path="informe-factures" element={<InformeFacturesPage />} />
 *
 * Estat: el sistema i la interfície funcionen i hi ha 248 tests verds. Totes
 * les migracions estan executades. Res no està desplegat.
 */

// ---------------------------------------------------------------------------
// Peces de maquetació
// ---------------------------------------------------------------------------

const H2 = ({ children }) => (
  <h2 className="font-oswald text-[13px] tracking-[0.18em] uppercase text-gray-900 mt-10 mb-3 pb-1 border-b border-gray-900">
    {children}
  </h2>
);

const H3 = ({ children }) => (
  <h3 className="font-oswald text-[11px] tracking-[0.16em] uppercase text-gray-500 mt-6 mb-2">{children}</h3>
);

const P = ({ children }) => <p className="text-[13.5px] leading-relaxed text-gray-700 mb-3">{children}</p>;

const Bloc = ({ children }) => (
  <div className="text-[13px] leading-relaxed text-gray-700 border-l-2 border-gray-200 pl-4 my-4 bg-gray-50 py-3 pr-4">
    {children}
  </div>
);

const Codi = ({ children }) => (
  <pre className="text-[12px] leading-relaxed bg-gray-900 text-gray-100 p-4 my-4 overflow-x-auto whitespace-pre">
    <code>{children}</code>
  </pre>
);

const Taula = ({ capcalera, files, amplades }) => (
  <div className="overflow-x-auto my-4">
    <table className="w-full text-[12.5px] border-collapse">
      <thead>
        <tr className="border-b border-gray-900">
          {capcalera.map((c, i) => (
            <th
              key={c}
              className="text-left font-oswald font-normal text-[10px] tracking-[0.14em] uppercase text-gray-400 py-2 pr-3"
              style={amplades ? { width: amplades[i] } : undefined}
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {files.map((fila, i) => (
          <tr key={i} className="border-b border-gray-100 align-top">
            {fila.map((cella, j) => (
              <td key={j} className={`py-2 pr-3 ${j === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                {cella}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Llista = ({ items }) => (
  <ul className="my-3 space-y-1.5">
    {items.map((it, i) => (
      <li key={i} className="text-[13.5px] leading-relaxed text-gray-700 pl-4 relative">
        <span className="absolute left-0 text-gray-400">—</span>
        {it}
      </li>
    ))}
  </ul>
);

const Numerada = ({ items }) => (
  <ol className="my-3 space-y-1.5">
    {items.map((it, i) => (
      <li key={i} className="text-[13.5px] leading-relaxed text-gray-700 pl-7 relative">
        <span className="absolute left-0 font-oswald text-gray-400">{String(i + 1).padStart(2, '0')}</span>
        {it}
      </li>
    ))}
  </ol>
);

const Strong = ({ children }) => <strong className="text-gray-900">{children}</strong>;
const B = ({ children }) => <code className="text-[12px] bg-gray-100 px-1 py-0.5 text-gray-800">{children}</code>;

// ---------------------------------------------------------------------------
// L'informe
// ---------------------------------------------------------------------------

export function InformeSistemaFactures() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-12 bg-white text-gray-700">
      <header className="mb-10 pb-6 border-b-2 border-gray-900">
        <div className="font-oswald text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-2">
          Document de traspàs
        </div>
        <h1 className="font-oswald text-3xl tracking-[0.02em] uppercase leading-tight">
          Sistema de factures<br />Higgins GRÀFIC
        </h1>
        <p className="text-[13px] text-gray-500 mt-3">
          El sistema genera, numera, desa i mostra les factures, i l’administració permet
          preparar esborranys, emetre factures manuals, rectificar, exportar i reenviar.
        </p>
      </header>

      {/* ─────────────────────────────────────────────── */}
      <H2>01 · Què se't demana</H2>
      <P>
        Mantenir la <Strong>interfície de gestió de factures</Strong> de la botiga. Aquest document
        descriu què hi ha, per què està fet així i què queda pendent, perquè no hagis de reconstruir
        res ni contradir decisions ja preses.
      </P>

      {/* ─────────────────────────────────────────────── */}
      <H2>02 · El negoci</H2>
      <P>
        Botiga de samarretes impresses sota demanda. El client compra a la web, es cobra amb
        Stripe i la comanda s'envia a <Strong>Gelato</Strong>, el proveïdor d'impressió i enviament.
        L'amo és <Strong>autònom</Strong>, de manera que el seu NIF és el seu DNI.
      </P>
      <Taula
        capcalera={['Dada', 'Valor']}
        files={[
          ['Productes', '63'],
          ['Variants', '3.976'],
          ['Col·leccions', 'Austen 27 · First Contact 7 · The Human Inside 14 · Cube 10 · Miscel·lània 5'],
          ['Preu de venda', '15,50 € IVA inclòs (12,81 € nets)'],
          ['Cost del proveïdor', 'Entre 7,57 € i 8,76 € a les talles S–XL, i entre 9,10 € i 10,53 € a la 2XL, segons el color'],
          ['Enviament', 'Va a preu de cost: el client en paga 4,29 € i el proveïdor en cobra 4,29 €'],
        ]}
      />

      {/* ─────────────────────────────────────────────── */}
      <H2>03 · Pila tècnica</H2>
      <Taula
        capcalera={['Capa', 'Tecnologia']}
        files={[
          ['Frontend', 'React 18 + Vite 7 + React Router 6 + Tailwind 3'],
          ['Components', 'Radix UI, Framer Motion, Lucide'],
          ['Backend', 'Netlify Functions (Node, empaquetat amb esbuild)'],
          ['Base de dades', 'Supabase (Postgres + PostgREST + RLS)'],
          ['Pagaments', 'Stripe'],
          ['Proveïdor', 'Gelato (API v3)'],
          ['Correu', 'Resend, amb plantilles React'],
        ]}
      />
      <Bloc>
        <Strong>Idioma del projecte:</Strong> els comentaris, els missatges de commit i les
        interfícies són <Strong>en català</Strong>. Mantén-ho.
      </Bloc>

      {/* ─────────────────────────────────────────────── */}
      <H2>04 · El cicle complet</H2>
      <Codi>{`El client paga
      │
      ▼
Stripe envia l'avís ──► stripe-webhook
                          │
                          ├─ actualitza la comanda a "confirmada"
                          ├─ createInvoice()  ──► agafa el número correlatiu
                          │                       i desa la factura
                          ├─ envia el correu amb l'enllaç a la factura
                          └─ envia la comanda a Gelato`}</Codi>

      <H3>La numeració</H3>
      <P>
        Viu <Strong>a la base de dades</Strong>, no a la web: dos compradors simultanis no poden
        rebre el mateix número, i un comptador al navegador sí que podria repetir-lo.
      </P>
      <Codi>{`public.invoice_series_counters (series text, year int, last_number int)
public.next_invoice_number(series) RETURNS text
-- FO-2026-000001 · FS-2026-000001 · FR-2026-000001`}</Codi>
      <Llista
        items={[
          <>El número <Strong>només s'agafa quan la factura s'emet de debò</Strong>. Com que la comanda es crea abans de pagar, numerar-la allà deixaria un forat per cada intent abandonat — i la sèrie fiscal no pot tenir forats.</>,
          <>Es crida des del servidor amb <B>supabase.rpc('next_invoice_number')</B>. Els visitants anònims no hi tenen permís.</>,
          <>Verificat: quatre crides simultànies retornen quatre números diferents.</>,
        ]}
      />

      {/* ─────────────────────────────────────────────── */}
      <H2>05 · La taula invoices</H2>
      <Codi>{`id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
number                text NOT NULL UNIQUE          -- FO/FS/FR-2026-000001
invoice_type          text NOT NULL                 -- 'full' | 'simplified'
document_kind         text NOT NULL                 -- 'invoice' | 'rectification'
rectifies_invoice_id  uuid REFERENCES invoices(id)
correction_reason     text
source                text NOT NULL                 -- 'order' | 'manual'
order_id              uuid REFERENCES orders(id) ON DELETE RESTRICT
order_number          text
user_id               uuid
issued_at             timestamptz NOT NULL DEFAULT now()
access_token          uuid NOT NULL DEFAULT gen_random_uuid()
-- Instantània del client (no canvia mai)
customer_name, customer_email, customer_tax_id, customer_company,
customer_address, customer_address2, customer_city,
customer_postal_code, customer_country
-- Instantània dels imports
base_products         numeric(10,2)
base_shipping         numeric(10,2)
iva                   numeric(10,2)
total                 numeric(10,2)
-- Instantània de les línies
items                 jsonb
created_at            timestamptz`}</Codi>

      <Bloc>
        <Strong>Dues decisions que no s'han de desfer.</Strong>
        <div className="mt-2">
          <Strong>1. És una còpia, no una referència.</Strong> La factura desa el nom, l'adreça i els
          imports del dia en què es va emetre. Si demà el client canvia d'adreça o canvia un preu,
          la factura d'ahir continua dient el mateix.
        </div>
        <div className="mt-2">
          <Strong>2. És immutable.</Strong> Un disparador impedeix modificar-la o esborrar-la. Per
          corregir una errada cal una <Strong>factura rectificativa</Strong>, que és una factura
          nova de la sèrie FR. La interfície crea primer un esborrany editable i l&apos;original es conserva.
        </div>
      </Bloc>
      <Codi>{`CREATE TRIGGER invoices_no_update
  BEFORE UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_immutable();`}</Codi>

      <H3>Seguretat: tres maneres d'accedir-hi</H3>
      <Taula
        capcalera={['Qui', 'Com', 'Què veu']}
        files={[
          ['El client amb compte', 'Política RLS: compara user_id o customer_email amb l\'usuari autenticat', 'Només les seves factures'],
          ['El client sense compte', 'Testimoni d\'accés: un UUID aleatori a l\'adreça', 'Una sola factura'],
          ['L\'administrador', 'Funció de servidor amb clau de servei, prèvia comprovació verifyAdmin()', 'Tot'],
        ]}
      />
      <P>
        El client sense compte obre la factura amb un <Strong>testimoni d'accés</Strong>: qui el té,
        la veu; qui no, no la troba. És el mateix sistema que fan servir Stripe o Amazon. I la
        funció que serveix una factura <Strong>mai no retorna la llista</Strong>, perquè no serveixi
        per esbrinar quantes n'hi ha ni de qui són.
      </P>

      {/* ─────────────────────────────────────────────── */}
      <H2>06 · Fitxers del sistema</H2>

      <H3>Migracions (totes executades a Supabase)</H3>
      <Taula
        capcalera={['Fitxer', 'Què fa']}
        files={[
          ['20260915190000_columnes_factura_a_orders.sql', 'invoice_company i invoice_tax_id a orders'],
          ['20260915200000_tipus_de_factura_a_orders.sql', 'invoice_type a orders'],
          ['20260915210000_numeracio_de_factures.sql', 'invoice_counters + next_invoice_number()'],
          ['20260915220000_taula_factures.sql', 'La taula invoices + immutabilitat + RLS'],
          ['20260915230000_testimoni_dacces_a_les_factures.sql', 'access_token'],
          ['20260915240000_gestio_i_series_de_factures.sql', 'Sèries FO/FS/FR, esborranys i emissió manual atòmica'],
        ]}
      />
      <Bloc>
        <Strong>Convenció:</Strong> cada migració explica <em>per què</em> cal i acaba amb una
        consulta de comprovació. S'executen <Strong>a mà</Strong> al SQL Editor de Supabase
        (vegeu la secció 09).
      </Bloc>

      <H3>Funcions de servidor</H3>
      <Taula
        capcalera={['Fitxer', 'Què fa']}
        files={[
          ['create-payment-intent.js', 'Crea la comanda. Desa empresa i CIF i calcula invoice_type'],
          ['stripe-webhook.js', 'En confirmar-se el pagament, crida createInvoice() (exportada per poder-la testejar)'],
          ['get-invoice.js', 'Retorna UNA factura pel seu testimoni. Valida el format abans de tocar la base'],
          ['admin-invoices.js', 'Totes les factures, amb filtres, cerca, detall i totals'],
          ['admin-invoice-drafts.js', 'Crea, modifica, elimina i emet esborranys'],
          ['admin-invoice-actions.js', 'Reenvia una factura per correu'],
        ]}
      />

      <H3>Pàgines</H3>
      <Taula
        capcalera={['Fitxer', 'Ruta', 'Per a qui']}
        files={[
          ['src/pages/InvoicePage.jsx', '/factura/:token', 'El client, sense compte. Imprimible en A4'],
          ['src/pages/MyInvoicesPage.jsx', '/compte/factures', 'El client amb compte. Llistat agrupat per any'],
          ['src/pages/AdminInvoicesPage.jsx', '/admin/factures', 'L\'administrador. Factures, esborranys, filtres, CSV i accions'],
          ['src/pages/AdminInvoiceEditorPage.jsx', '/admin/factures/nova', 'Creació manual i rectificatives abans d’emetre'],
        ]}
      />

      <H3>Configuració i rutes</H3>
      <Taula
        capcalera={['Fitxer', 'Què hi ha']}
        files={[
          ['src/config/issuer.js', 'Les dades fiscals de l\'emissor, en un sol lloc'],
          ['src/config/pricing.js', 'Preu de venda, IVA i descompte del proveïdor'],
          ['src/routes/lazyPages.js', 'Registre de pàgines amb càrrega diferida'],
          ['src/routes/AppRoutes.jsx', 'Les rutes'],
          ['src/api/authHeaders.js', 'Capçalera Authorization: Bearer per a les crides d\'admin'],
        ]}
      />

      {/* ─────────────────────────────────────────────── */}
      <H2>07 · Decisions de disseny, i per què</H2>
      <Taula
        capcalera={['Decisió', 'Motiu']}
        files={[
          ['Sèries FO, FS i FR separades', 'La normativa exigeix separar ordinàries, simplificades i rectificatives quan conviuen el mateix any'],
          ['El número s\'agafa en emetre, no en comprar', 'Els intents abandonats deixarien forats a la sèrie'],
          ['Còpia en comptes de referència', 'Un document fiscal no pot canviar quan canvia la comanda'],
          ['Immutabilitat per disparador', 'Per corregir cal rectificativa; l\'original es conserva'],
          ['Testimoni a l\'adreça', 'El client ha de poder obrir la factura des del correu, sense compte'],
          ['get-invoice retorna una factura, mai la llista', 'Així no serveix per esbrinar quantes n\'hi ha ni de qui són'],
          ['El text de cerca es neteja', 'Els filtres de PostgREST es componen amb comes i parèntesis'],
          ['L\'última línia s\'ajusta uns cèntims', 'La suma de les línies ha de donar exactament el total desat'],
        ]}
      />

      {/* ─────────────────────────────────────────────── */}
      <H2>08 · Què està verificat i què no</H2>
      <H3>Verificat</H3>
      <Llista
        items={[
          <>248 tests passant i <B>npm run build</B> sense errors</>,
          <>L'esquema de la base de dades, comprovat des de fora: les columnes existeixen i responen</>,
          <>La numeració: crides simultànies donen números diferents; un visitant anònim rep «permís denegat»</>,
          <>La suma de les línies quadra amb el total en tots els casos provats</>,
        ]}
      />
      <H3>No verificat</H3>
      <Llista
        items={[
          <><Strong>El circuit complet amb un pagament real.</Strong> Cap comanda no hi ha passat mai, perquè la botiga encara no ha venut res. Només es pot comprovar amb una comanda de prova (targeta <B>4242 4242 4242 4242</B>)</>,
          <>No s'ha creat cap factura de prova, <Strong>a posta</Strong>: el bloqueig d'immutabilitat no permet esborrar-la i gastaria el primer número de la sèrie corresponent</>,
          <>Res no està desplegat a producció</>,
        ]}
      />

      {/* ─────────────────────────────────────────────── */}
      <H2>09 · Estat de la interfície de gestió</H2>

      <H3>Implementat</H3>
      <Numerada
        items={[
          <><Strong>Factura rectificativa.</Strong> Es crea com a esborrany vinculat a l&apos;original i s&apos;emet amb la sèrie FR</>,
          <><Strong>Factura manual.</Strong> Es pot desar incompleta i editar fins al moment d&apos;emetre-la</>,
          <><Strong>Reenviament i exportació.</Strong> L&apos;administrador pot reenviar l&apos;enllaç i exportar el conjunt filtrat en CSV</>,
        ]}
      />

      <H3>Important</H3>
      <Numerada
        items={[
          <><Strong>Exportar</Strong> (CSV o Excel) el conjunt filtrat, per a la gestoria</>,
          <><Strong>Generar el PDF com a fitxer.</Strong> Avui la factura és una pàgina HTML que s'imprimeix des del navegador; un PDF desat permetria adjuntar-lo al correu</>,
          <><Strong>Paginar</Strong> la pantalla d'admin. Ara té un límit de 1.000 files i avisa quan l'assoleix, perquè els totals deixarien de ser de tot el conjunt</>,
        ]}
      />

      <H3>Desitjable</H3>
      <Numerada
        items={[
          <>Enllaç a la factura a la pàgina de seguiment de la comanda (<B>/track</B>)</>,
          <>Filtres de data, a més de l'any, i per client</>,
          <>Resum anual pensat per a la declaració: vendes, IVA repercutit i nombre de factures</>,
        ]}
      />

      {/* ─────────────────────────────────────────────── */}
      <H2>10 · Regles del projecte que has de respectar</H2>
      <Numerada
        items={[
          <><Strong>No es desplega.</Strong> L'amo va demanar explícitament que no es faci cap desplegament a Netlify. Es fa commit i push, i prou</>,
          <><Strong>Cada canvi, amb tests.</Strong> La suite ha de continuar verda: <B>npx vitest run</B></>,
          <><Strong>Les migracions s'executen a mà.</Strong> El CLI de Supabase no està autenticat en aquest entorn. Cal escriure el fitxer a supabase/migrations/ <em>i</em> donar a l'amo el bloc SQL per enganxar al SQL Editor. Avisa'l sempre que una migració sigui necessària</>,
          <><Strong>L'amo no és tècnic.</Strong> Explicacions curtes, en català, i digues clarament què ha de fer ell i què fas tu. Val més dir «això és una consulta de gestor» que improvisar assessorament fiscal</>,
          <><Strong>Els comentaris expliquen el perquè.</Strong> Al projecte hi ha el costum d'escriure, al costat del codi, quin problema resolia. Mantén-ho: és el que evita que algú desfaci una decisió sense saber per què es va prendre</>,
        ]}
      />

      {/* ─────────────────────────────────────────────── */}
      <H2>11 · Com treballar-hi</H2>
      <Codi>{`npm run dev                 # servidor de desenvolupament (port 3003)
npx vitest run              # tots els tests
npx vitest run tests/unit/invoice-generation.test.js   # un de sol
npx eslint <fitxer>         # comprovar un fitxer
npm run build               # comprovar que compila`}</Codi>
      <P>
        <Strong>Provar la factura de debò:</Strong> cal una comanda amb la targeta de prova de
        Stripe. Un cop feta, la factura apareixerà a <B>/admin/factures</B> amb un número
        de la sèrie FO o FS.
      </P>
      <P>
        <Strong>Referència de disseny:</Strong> <B>docs/model-factura.html</B> és el model que va
        servir per dissenyar la pàgina; inclou un selector per veure les dues versions.
      </P>

      {/* ─────────────────────────────────────────────── */}
      <H2>12 · Vocabulari</H2>
      <Taula
        capcalera={['Terme', 'Què vol dir aquí']}
        files={[
          ['Factura simplificada', 'La que es fa a un particular. No porta CIF. És el cas normal'],
          ['Factura (normal)', 'La que es fa a una empresa o autònom, amb el seu CIF'],
          ['Base', 'L\'import sense IVA. A la factura hi ha base de productes i base de transport, separades'],
          ['Transport', 'El que costa l\'enviament, sense IVA. Es reparteix per unitat: la primera peça paga la tarifa sencera i les altres la reduïda'],
          ['Testimoni d\'accés', 'El codi aleatori de l\'adreça que permet obrir una factura sense compte'],
          ['Rectificativa', 'Una factura nova que en corregeix una d\'anterior'],
          ['Sèrie', 'El conjunt de números d\'un mateix tipus de document. Aquí n\'hi ha una de sola'],
          ['Gelato', 'El proveïdor que imprimeix i envia les samarretes'],
          ['Gelato+', 'El pla de pagament del proveïdor, que aplica un 20 % de descompte sobre el catàleg'],
        ]}
      />

      {/* ─────────────────────────────────────────────── */}
      <H2>13 · Context del catàleg (si has de tocar la botiga)</H2>
      <Llista
        items={[
          <>El proveïdor <Strong>encara té les fitxes muntades amb una samarreta diferent</Strong> (Gildan 5000) de la que es ven (Gildan 64000), i amb la tècnica vella (DTG en comptes de DTF). L'amo ho ha de refer a la seva interfície de Gelato</>,
          <>Quan ho faci, caldrà tornar a sincronitzar amb <B>npm run sync-gelato</B> i revisar la taula de costos del mateix script</>,
        ]}
      />

      <footer className="mt-14 pt-5 border-t border-gray-200 text-[11px] text-gray-400">
        Informe elaborat a partir de l'estat real del repositori. Els commits del sistema de
        factures són del 43210af al 0e64480. Res no està desplegat.
      </footer>
    </article>
  );
}

export default InformeSistemaFactures;
