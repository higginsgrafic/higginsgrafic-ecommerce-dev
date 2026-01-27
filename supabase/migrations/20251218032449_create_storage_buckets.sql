/*
  # Configurar Supabase Storage

  1. Buckets (Carpetes principals)
    - `media` - Per vídeos, imatges i altres fitxers multimèdia
    - Bucket públic: els fitxers són accessibles per tothom
  
  2. Polítiques de Seguretat
    - Lectura pública: Qualsevol pot veure/descarregar fitxers
    - Pujada oberta: Qualsevol pot pujar fitxers (es pot restringir després si cal)
    - Actualització/Eliminació: Només per usuaris autenticats
  
  3. Configuració
    - Mida màxima de fitxer: Per defecte Supabase permet fins a 50MB
    - Tipus de fitxers: Tots els tipus acceptats
*/

-- Crear el bucket 'media' si no existeix
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB en bytes
  NULL -- Acceptar tots els tipus de fitxers
)
ON CONFLICT (id) DO NOTHING;

-- Política: Qualsevol pot veure fitxers del bucket 'media'
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Política: Qualsevol pot pujar fitxers al bucket 'media'
CREATE POLICY "Public Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media');

-- Política: Usuaris autenticats poden actualitzar fitxers
CREATE POLICY "Authenticated users can update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

-- Política: Usuaris autenticats poden eliminar fitxers
CREATE POLICY "Authenticated users can delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');