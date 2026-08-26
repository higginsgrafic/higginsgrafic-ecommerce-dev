#!/usr/bin/env node
/**
 * Local verification script — security audit checks
 *
 * Verifies:
 * 1. No VITE_GELATO_API_KEY in any .env or source file
 * 2. No secret values are bundled in client code
 * 3. Legacy client-side Gelato order creation is disabled
 * 4. Production code does not include development-only mock behaviour
 *
 * Run: node scripts/verify-security.js
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const errors = [];
const warnings = [];
const passes = [];

// --- Helpers ---

function readEnvFiles() {
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development', '.env.example'];
  const results = [];
  for (const f of envFiles) {
    const path = join(ROOT, f);
    if (existsSync(path)) {
      results.push({ file: f, content: readFileSync(path, 'utf8') });
    }
  }
  return results;
}

function scanSourceFiles(dir, exts = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = [];
  function walk(d) {
    const entries = readdirSync(d);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build') continue;
      const full = join(d, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (exts.includes(extname(full))) {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

function readFile(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

// --- Checks ---

// 1. No VITE_GELATO_API_KEY
function checkNoGelatoApiKey() {
  const envFiles = readEnvFiles();
  for (const { file, content } of envFiles) {
    if (content.includes('VITE_GELATO_API_KEY')) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('VITE_GELATO_API_KEY') && !line.trim().startsWith('#')) {
          // Flag only if there's an actual value (not empty)
          const value = line.split('=')[1];
          if (value && value.trim().length > 0) {
            errors.push(`${file}:${i + 1} — VITE_GELATO_API_KEY has a non-empty value (should be removed from client env)`);
          }
        }
      }
    }
  }

  // Check source files for VITE_GELATO_API_KEY usage
  const srcFiles = scanSourceFiles(join(ROOT, 'src'));
  for (const file of srcFiles) {
    const content = readFile(file);
    if (content && content.includes('VITE_GELATO_API_KEY')) {
      errors.push(`${file} — references VITE_GELATO_API_KEY (should not be in client code)`);
    }
  }

  if (errors.filter(e => e.includes('VITE_GELATO_API_KEY')).length === 0) {
    passes.push('No VITE_GELATO_API_KEY in env files or client source');
  }
}

// 2. No secret values bundled in client code
function checkNoBundledSecrets() {
  const secretPatterns = [
    { name: 'Stripe secret key', pattern: /sk_(live|test)_[a-zA-Z0-9]{20,}/ },
    { name: 'Supabase service role key', pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*.*service_role/ },
    { name: 'Gelato API key', pattern: /gelato[a-zA-Z0-9_-]{20,}/i },
    { name: 'Resend API key', pattern: /re_[a-zA-Z0-9]{20,}/ },
    { name: 'Hardcoded password', pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  ];

  const srcFiles = scanSourceFiles(join(ROOT, 'src'));
  for (const file of srcFiles) {
    // Skip mock/test files — they may contain test data that looks like secrets
    if (file.includes('mock') || file.includes('test') || file.includes('__')) continue;
    const content = readFile(file);
    if (!content) continue;
    for (const { name, pattern } of secretPatterns) {
      if (pattern.test(content)) {
        errors.push(`${file} — possible ${name} found in client source`);
      }
    }
  }

  // Check netlify functions for hardcoded secrets (should use env vars)
  const netlifyFiles = scanSourceFiles(join(ROOT, 'netlify/functions'));
  for (const file of netlifyFiles) {
    const content = readFile(file);
    if (!content) continue;
    // Functions should reference process.env, not hardcode values
    for (const { name, pattern } of secretPatterns) {
      if (pattern.test(content) && !content.includes('process.env')) {
        errors.push(`${file} — possible hardcoded ${name} without env var reference`);
      }
    }
  }

  if (errors.filter(e => e.includes('possible')).length === 0) {
    passes.push('No secret values detected in source files');
  }
}

// 3. Legacy client-side Gelato order creation is disabled
function checkGelatoOrderDisabled() {
  const gelatoFile = readFile(join(ROOT, 'src/api/gelato.js'));
  if (!gelatoFile) {
    warnings.push('src/api/gelato.js not found');
    return;
  }

  // createGelatoOrder should throw
  const exportMatch = gelatoFile.match(/export\s+const\s+createGelatoOrder\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?throw\s+new\s+Error/);
  if (exportMatch) {
    passes.push('createGelatoOrder throws error (client-side disabled)');
  } else {
    errors.push('src/api/gelato.js — createGelatoOrder does not throw (client-side order creation may still be enabled)');
  }

  // Should not import VITE_GELATO_API_KEY
  if (gelatoFile.includes('VITE_GELATO_API_KEY')) {
    errors.push('src/api/gelato.js — still references VITE_GELATO_API_KEY');
  } else {
    passes.push('src/api/gelato.js does not reference VITE_GELATO_API_KEY');
  }
}

// 4. Production code does not include development-only mock behaviour
function checkNoDevMockInProd() {
  const devPatterns = [
    { name: 'NODE_ENV=development bypass', pattern: /NODE_ENV\s*===?\s*['"]development['"]/ },
    { name: 'NETLIFY_DEV bypass', pattern: /NETLIFY_DEV\s*===?\s*['"]true['"]/ },
    { name: 'mock order creation', pattern: /mockOrder|mock_order|createMockOrder/i },
  ];

  const netlifyFiles = scanSourceFiles(join(ROOT, 'netlify/functions'));
  for (const file of netlifyFiles) {
    const content = readFile(file);
    if (!content) continue;
    for (const { name, pattern } of devPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Check if it's in a comment
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i]) && !lines[i].trim().startsWith('//') && !lines[i].trim().startsWith('*')) {
            errors.push(`${file}:${i + 1} — ${name} found in production code (not in comment)`);
          }
        }
      }
    }
  }

  // Check CheckoutContent for mock order path
  const checkoutFile = readFile(join(ROOT, 'src/components/fullwide/CheckoutContent.jsx'));
  if (checkoutFile) {
    // Mock order creation should be guarded by a dev-only flag
    const hasMockPath = checkoutFile.includes('mockOrder') || checkoutFile.includes('createMockOrder');
    if (hasMockPath) {
      // Check if it's behind a dev check
      const mockIndex = checkoutFile.indexOf('createMockOrder');
      const surrounding = checkoutFile.slice(Math.max(0, mockIndex - 300), mockIndex + 300);
      if (!surrounding.includes('import.meta.env.DEV')) {
        warnings.push('CheckoutContent.jsx — mock order creation may not be guarded by import.meta.env.DEV');
      }
    }
  }

  if (errors.filter(e => e.includes('development') || e.includes('NETLIFY_DEV') || e.includes('mock')).length === 0) {
    passes.push('No development-only mock behaviour in production code paths');
  }
}

// 5. Bonus: Check that tracking token is hashed in DB-facing code
function checkTrackingTokenHashed() {
  const cpiFile = readFile(join(ROOT, 'netlify/functions/create-payment-intent.js'));
  if (cpiFile) {
    if (cpiFile.includes('tracking_token_hash') && cpiFile.includes('hashToken')) {
      passes.push('create-payment-intent stores tracking_token_hash (not raw token)');
    } else {
      errors.push('create-payment-intent.js — does not hash tracking token before storage');
    }
  }

  const ordersFile = readFile(join(ROOT, 'netlify/functions/orders.js'));
  if (ordersFile) {
    if (ordersFile.includes('hashToken') && ordersFile.includes('tracking_token_hash')) {
      passes.push('orders.js hashes incoming tracking token before DB lookup');
    } else {
      errors.push('orders.js — does not hash tracking token before DB lookup');
    }
  }
}

// --- Run all checks ---

console.log('=== Security Verification Script ===\n');

checkNoGelatoApiKey();
checkNoBundledSecrets();
checkGelatoOrderDisabled();
checkNoDevMockInProd();
checkTrackingTokenHashed();

console.log('--- Passes ---');
for (const p of passes) {
  console.log(`  ✓ ${p}`);
}

if (warnings.length > 0) {
  console.log('\n--- Warnings ---');
  for (const w of warnings) {
    console.log(`  ⚠ ${w}`);
  }
}

if (errors.length > 0) {
  console.log('\n--- Errors ---');
  for (const e of errors) {
    console.log(`  ✗ ${e}`);
  }

  // Check if only remaining error is local .env
  const onlyEnvErrors = errors.every(e => e.startsWith('.env'));
  if (onlyEnvErrors) {
    console.log('\n  NOTE: .env is a local gitignored file. Remove VITE_GELATO_API_KEY');
    console.log('  from your local .env manually. This does not affect the branch.');
  }

  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s), ${passes.length} pass(es)`);
  process.exit(1);
} else {
  console.log(`\n${passes.length} pass(es), ${warnings.length} warning(s), 0 errors`);
  process.exit(0);
}
