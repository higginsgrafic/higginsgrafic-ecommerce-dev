import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: No s\'han trobat les variables VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY al .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadFile(filePath, bucketName, storagePath) {
  try {
    console.log(`📤 Pujant ${path.basename(filePath)}...`);

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: fileName.endsWith('.zip') ? 'application/zip' : 'application/gzip',
        upsert: true
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    console.log(`✅ ${fileName} pujat correctament!`);
    console.log(`🔗 URL pública: ${urlData.publicUrl}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`❌ Error pujant ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Pujant arxius de descàrrega a Supabase Storage...\n');

  const projectRoot = path.join(__dirname, '..');

  // Generar els arxius primer
  console.log('📦 Generant arxius...');
  const { execSync } = await import('child_process');
  execSync('bash scripts/create-download.sh', { cwd: projectRoot, stdio: 'inherit' });

  // Esperar una mica perquè els arxius es generin
  await new Promise(resolve => setTimeout(resolve, 2000));

  const zipPath = path.join(projectRoot, 'public', 'project-download.zip');
  const tarPath = path.join(projectRoot, 'public', 'project-download.tar.gz');

  try {
    const zipUrl = await uploadFile(zipPath, 'project-downloads', 'project-download.zip');
    const tarUrl = await uploadFile(tarPath, 'project-downloads', 'project-download.tar.gz');

    console.log('\n✅ Tots els arxius pujats correctament!');
    console.log('\n📋 URLs públiques:');
    console.log(`  ZIP: ${zipUrl}`);
    console.log(`  TAR.GZ: ${tarUrl}`);
    console.log('\n💡 Actualitza els enllaços a AdminPage.jsx amb aquestes URLs');
  } catch (error) {
    console.error('\n❌ Error durant la pujada:', error.message);
    process.exit(1);
  }
}

main();
