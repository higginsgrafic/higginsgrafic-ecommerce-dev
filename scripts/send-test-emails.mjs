import esbuild from 'esbuild';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const tmpBundle = path.join(rootDir, 'scripts', '.send-test-emails.tmp.mjs');

try {
  esbuild.buildSync({
    entryPoints: [path.join(rootDir, 'scripts', 'send-test-emails.js')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    jsx: 'automatic',
    outfile: tmpBundle,
  });

  spawnSync('node', [tmpBundle], { stdio: 'inherit', cwd: rootDir });
} finally {
  if (fs.existsSync(tmpBundle)) {
    fs.unlinkSync(tmpBundle);
  }
}
