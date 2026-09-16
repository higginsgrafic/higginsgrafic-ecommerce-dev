-- ============================================================
-- Slugs dels productes nous, i treure el duplicat de l'Afrodita A
-- ============================================================
--
-- PER QUÈ CAL
--
-- El guió de sincronització de Gelato (`scripts/sync-gelato-products.js`) no
-- genera mai el `slug` dels productes: la columna es va crear amb una migració
-- i es va omplir un cop a mà. Els productes que arriben després neixen amb el
-- `slug` buit.
--
-- I sense slug, un producte NO és a la botiga: les adreces de la fitxa es fan
-- amb el slug (`/the-human-inside/c3-p0`). El producte existeix, però no s'hi
-- pot arribar i no surt enlloc.
--
-- QUÈ HA PASSAT
--
-- El 16/09/2026 es van refer les fitxes de Gelato amb la Gildan 64000 i DTF, i
-- la sincronització va portar dos productes nous:
--
--   * `The Human Inside - Afrodita A - n`  (la fitxa nova)
--   * `The Human Inside - c3p0 - n`        (el dibuix C3-P0, que faltava)
--
-- Tots dos amb el slug buit. I, com que l'Afrodita A ja existia amb la fitxa
-- vella (Gildan 5000), ara n'hi ha dos.
--
-- QUÈ FA AQUESTA MIGRACIÓ
--
--   1. Desactiva la fitxa VELLA de l'Afrodita A (la del Gildan 5000, que no
--      s'ha de vendre). No s'esborra: es desactiva, per si cal consultar-la.
--   2. Dona el slug `the-human-inside-afrodita-a` a la fitxa NOVA.
--   3. Dona el slug `the-human-inside-c3p0` al C3-P0.
--
-- Com executar-ho: Supabase → SQL Editor → enganxar això sencer → Run.
-- És segur repetir-ho.
--
-- NOTA: el guió de sincronització queda arreglat perquè generi el slug tot
-- sol; aquesta migració només arregla el que ja ha passat.
-- ============================================================

BEGIN;

-- 1. La fitxa vella de l'Afrodita A (Gildan 5000), fora de la venda.
--    Es busca pel seu identificador de Gelato, que és únic i no canvia.
UPDATE public.products
SET is_active = false,
    updated_at = now()
WHERE gelato_product_id = 'd63b0b55-0ea9-4a62-8e38-29670d2fe346'
  AND is_active = true;

-- 2. La fitxa nova de l'Afrodita A pren el slug de la vella.
UPDATE public.products
SET slug = 'the-human-inside-afrodita-a',
    is_active = true,
    updated_at = now()
WHERE gelato_product_id = '5d226f10-17f9-4283-85f6-5146c706c531';

-- 3. El C3-P0, que no tenia cap slug.
UPDATE public.products
SET slug = 'the-human-inside-c3p0',
    is_active = true,
    updated_at = now()
WHERE gelato_product_id = '83eabbf5-2395-469f-9522-8d01c4529d78';

COMMIT;

-- Comprovació: no hi ha d'haver cap producte actiu sense slug, i l'Afrodita A
-- vell ha de quedar inactiu.
SELECT count(*) AS actius_sense_slug
FROM public.products
WHERE is_active = true AND (slug IS NULL OR slug = '');

SELECT slug, name, is_active
FROM public.products
WHERE gelato_product_id IN (
  'd63b0b55-0ea9-4a62-8e38-29670d2fe346',
  '5d226f10-17f9-4283-85f6-5146c706c531',
  '83eabbf5-2395-469f-9522-8d01c4529d78'
)
ORDER BY is_active DESC, slug;
