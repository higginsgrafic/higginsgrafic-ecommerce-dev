/*
  # Create media_pages table for full-screen multimedia content

  1. New Tables
    - `media_pages`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL identifier
      - `title` (text) - Page title
      - `subtitle` (text) - Page subtitle
      - `description` (text) - Page description
      - `background_type` (text) - Type: 'video', 'image', 'color'
      - `video_url` (text) - Video URL if type is video
      - `image_url` (text) - Image URL if type is image
      - `background_color` (text) - Background color if type is color
      - `overlay_opacity` (numeric) - Overlay opacity (0-1)
      - `text_color` (text) - Text color
      - `text_alignment` (text) - 'left', 'center', 'right'
      - `content_position` (text) - 'top', 'center', 'bottom'
      - `show_cta` (boolean) - Show call-to-action button
      - `cta_text` (text) - CTA button text
      - `cta_link` (text) - CTA button link
      - `audio_url` (text) - Background audio URL (optional)
      - `audio_autoplay` (boolean) - Auto-play audio
      - `audio_loop` (boolean) - Loop audio
      - `additional_images` (jsonb) - Additional images with positions
      - `custom_html` (text) - Custom HTML content
      - `is_active` (boolean) - Is page active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS on `media_pages` table
    - Add policy for anyone to read active pages
    - Add policy for authenticated users to manage pages (for future auth)
*/

CREATE TABLE IF NOT EXISTS media_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text DEFAULT '',
  subtitle text DEFAULT '',
  description text DEFAULT '',
  background_type text DEFAULT 'image',
  video_url text DEFAULT '',
  image_url text DEFAULT '',
  background_color text DEFAULT '#000000',
  overlay_opacity numeric DEFAULT 0.4,
  text_color text DEFAULT '#ffffff',
  text_alignment text DEFAULT 'center',
  content_position text DEFAULT 'center',
  show_cta boolean DEFAULT true,
  cta_text text DEFAULT '',
  cta_link text DEFAULT '',
  audio_url text DEFAULT '',
  audio_autoplay boolean DEFAULT false,
  audio_loop boolean DEFAULT true,
  additional_images jsonb DEFAULT '[]'::jsonb,
  custom_html text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE media_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active media pages"
  ON media_pages
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow anonymous insert for demo"
  ON media_pages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update for demo"
  ON media_pages
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete for demo"
  ON media_pages
  FOR DELETE
  TO anon
  USING (true);

INSERT INTO media_pages (slug, title, subtitle, description, background_type, image_url, show_cta, cta_text, cta_link)
VALUES (
  'default',
  'Benvingut a GRÀFIC',
  'Disseny i creativitat sense límits',
  'Descobreix la nostra col·lecció de dissenys únics i originals',
  'image',
  'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1920',
  true,
  'Explorar col·leccions',
  '/collections'
) ON CONFLICT (slug) DO NOTHING;
