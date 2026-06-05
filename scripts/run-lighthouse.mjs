/**
 * Executa Lighthouse contra el build local de producció.
 * Ús: node scripts/run-lighthouse.mjs [URL]
 */
import { writeFileSync } from 'fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const TARGETS = [
  { url: 'http://127.0.0.1:4173/', label: 'home' },
  { url: 'http://127.0.0.1:4173/productes', label: 'productes' },
];

async function run() {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });

  const options = {
    logLevel: 'warn',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    preset: 'desktop',
  };

  const results = [];

  for (const target of TARGETS) {
    console.log(`\n📊 Auditant ${target.label}: ${target.url}`);
    try {
      const result = await lighthouse(target.url, options);
      const report = result.lhr;
      const scores = {
        label: target.label,
        url: target.url,
        performance: Math.round(report.categories.performance.score * 100),
        accessibility: Math.round(report.categories.accessibility.score * 100),
        bestPractices: Math.round(report.categories['best-practices'].score * 100),
        seo: Math.round(report.categories.seo.score * 100),
      };
      console.log('✅ Scores:', JSON.stringify(scores, null, 2));
      results.push(scores);
    } catch (err) {
      console.error(`❌ Error a ${target.label}:`, err.message);
      results.push({ label: target.label, url: target.url, error: err.message });
    }
  }

  // Guarda resultats
  const outPath = '/tmp/lighthouse-scores.json';
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 Resultats guardats a ${outPath}`);
  console.log('\n📋 RESUM FINAL:');
  console.table(results);

  await chrome.kill();
  process.exit(0);
}

run();