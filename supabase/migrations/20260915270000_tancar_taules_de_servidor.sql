-- ============================================================
-- Tancar les taules que només fa servir el servidor
-- ============================================================
--
-- PER QUÈ CAL
--
-- He comprovat amb la clau pública —la que viatja dins del navegador de
-- qualsevol visitant— que 21 de les 24 taules del projecte són llegibles I
-- ESCRIBIBLES des de fora. Entre elles:
--
--   staff                     La taula que decideix qui és administrador!
--   addresses, profiles       Adreces i dades dels clients
--   products, product_variants Preus i catàleg
--   pricing_config, shipping_config, promotions_config
--
-- La de `staff` és la més greu: `verifyAdmin` mira si el teu usuari hi és amb
-- el rol d'admin. Com que s'hi pot escriure des de fora, qualsevol podria
-- afegir-s'hi i passar a ser administrador: emetre factures, veure totes les
-- comandes i canviar el preu dels productes.
--
-- AQUESTA MIGRACIÓ
--
-- Tanca les taules que NOMÉS fa servir el servidor (les funcions de Netlify,
-- que van amb la clau de servei i per tant no queden afectades). Amb la
-- seguretat activada i cap política, ningú més no hi arriba.
--
-- Les taules que llegeix el navegador (el catàleg, les configuracions) NO es
-- toquen aquí: necessiten una política de lectura abans de tancar-les, i això
-- va a la migració següent per no deixar la botiga sense dades.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho.

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DIAGNÒSTIC: en quin estat està cada taula
-- ============================================================
-- Aquesta consulta diu, per a cada taula, si té la seguretat activada i
-- quantes polítiques té. Serveix per decidir quines falten per tancar.
--
-- Es llegir així:
--   rowsecurity = false           → oberta a tothom (cal arreglar-la)
--   rowsecurity = true, 0 policies → només el servidor hi arriba (correcte
--                                    per a taules internes)
--   rowsecurity = true, n policies → filtrada per política (correcte per a
--                                    dades dels clients)

SELECT
  t.tablename AS taula,
  t.rowsecurity AS seguretat_activa,
  (SELECT count(*) FROM pg_policies p
    WHERE p.schemaname = 'public' AND p.tablename = t.tablename) AS politiques
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.rowsecurity, t.tablename;
