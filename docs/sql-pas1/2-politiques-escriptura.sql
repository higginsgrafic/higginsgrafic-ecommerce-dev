-- ============================================================
-- UNA SOLA CONSULTA: qui pot escriure, i on
-- ============================================================
-- Només lectura. No modifica res.
--
-- cmd: a = inserir, w = modificar, d = esborrar.
-- És l'única pregunta que va quedar oberta a la nota de la falsa alarma.
-- ============================================================

SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd IN ('a', 'w', 'd')
ORDER BY tablename, cmd, policyname;
