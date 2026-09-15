-- ============================================================
-- Seguretat: tancar les taules noves de factures
-- ============================================================
--
-- PER QUÈ CAL
--
-- `invoices` va néixer amb les polítiques de seguretat activades, però les dues
-- taules que es van afegir després —`invoice_drafts` i
-- `invoice_series_counters`— es van crear sense. Ho vaig comprovar amb la clau
-- pública, la mateixa que viatja dins del navegador de qualsevol visitant:
--
--   invoices                 protegit
--   invoice_drafts           llegible I escrivible per qualsevol
--   invoice_series_counters  llegible I escrivible per qualsevol
--
-- El risc no és teòric:
--
--   - Els esborranys porten noms, correus, NIF i adreces de clients.
--   - El comptador es pot manipular. Reiniciar-lo o fer-lo saltar trenca la
--     numeració correlativa, que és exactament el que tot el sistema protegeix.
--
-- Amb la seguretat activada i CAP política, només el servidor (service_role)
-- hi arriba. Les funcions `next_invoice_number()` i `issue_invoice_draft()`
-- són SECURITY DEFINER, així que continuen funcionant: s'executen com el
-- propietari de la taula i la seguretat de files no les atura.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho.

ALTER TABLE public.invoice_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_series_counters ENABLE ROW LEVEL SECURITY;

-- Comprovació: les tres taules han de sortir amb rowsecurity = true.
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'invoice_drafts', 'invoice_series_counters')
ORDER BY tablename;
