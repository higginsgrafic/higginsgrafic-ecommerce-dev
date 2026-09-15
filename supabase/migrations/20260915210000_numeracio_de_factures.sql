-- ============================================================
-- Numeració correlativa de factures
-- ============================================================
--
-- PER QUÈ CAL
--
-- El número de factura ha de ser correlatiu i SENSE FORATS: 1, 2, 3... sense
-- salts ni números repetits. No es pot fer amb un comptador a la web (dues
-- comandes alhora es podrien repetir el número), i tampoc no serveix el número
-- de comanda `GRF-...`, perquè la comanda es crea ABANS de pagar i cada intent
-- abandonat deixaria un forat a la sèrie fiscal.
--
-- AQUESTA SOLUCIÓ
--
-- Una taula comptadora, una fila per any, i una funció que dona el número
-- següent. El bloqueig de fila de Postgres fa que, si entren dues comandes al
-- mateix instant, cadascuna rebi un número diferent.
--
-- La funció s'ha de cridar JUST quan s'emet la factura, no abans.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho.

CREATE TABLE IF NOT EXISTS public.invoice_counters (
  year int PRIMARY KEY,
  last_number int NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  any_actual int := EXTRACT(YEAR FROM now())::int;
  seguent int;
BEGIN
  INSERT INTO public.invoice_counters AS c (year, last_number)
  VALUES (any_actual, 1)
  ON CONFLICT (year) DO UPDATE SET last_number = c.last_number + 1
  RETURNING c.last_number INTO seguent;

  -- Format: 2026-000001
  RETURN any_actual::text || '-' || LPAD(seguent::text, 6, '0');
END;
$$;

-- Només la pot cridar el servidor (service role) i els usuaris autenticats.
-- Un visitant anònim no hi ha de poder cremar números.
REVOKE EXECUTE ON FUNCTION public.next_invoice_number() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.next_invoice_number() TO service_role, authenticated;

-- Comprovació: ha de tornar la funció i la taula.
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'next_invoice_number';
