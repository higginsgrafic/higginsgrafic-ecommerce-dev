-- ============================================================
-- Treure dues polítiques que són un risc
-- ============================================================
--
-- Revisades TODES les polítiques del projecte amb la seva definició al davant.
-- El conjunt està ben fet: lectura pública on toca, escriptura només per a
-- `is_admin()`, i files pròpies per als clients. Dues, però, són un risc:
--
-- 1. `orders`: "Users update own orders"
--
--    Deixa que un client autenticat MODIFICI la seva pròpia comanda: l'estat,
--    els imports, les línies... tot. El filtre nome s obliga que el `user_id`
--    continui sent seu.
--
--    Comprovat que no cal: al codi del navegador no hi ha cap escriptura a
--    `orders`. Totes les comandes es creen i s'actualitzen des de les funcions
--    de Netlify, que van amb la clau de servei.
--
-- 2. `rate_limit_log`: "Anyone can insert rate limit log"
--
--    Qualsevol pot inserir files en aquesta taula. Com que el limitador fa un
--    COUNT(*) a sobre i és FAIL-OPEN, omplir-la pot desactivar el rate limiting
--    de tota la botiga. Ja hi havia una migració que ho treia
--    (20260912200000) pero no es va arribar a executar mai.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això → Run.
-- És segur repetir-ho. Si mai cal revertir-ho, es tornen a crear amb CREATE
-- POLICY (les definicions són al fitxer de la migració anterior).

DROP POLICY IF EXISTS "Users update own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert rate limit log" ON public.rate_limit_log;

-- Comprovació: no han de sortir cap de les dues.
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname IN ('Users update own orders', 'Anyone can insert rate limit log');
