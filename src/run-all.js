import { mkdir } from 'fs/promises';
import { join } from 'path';
import { runLighthouse } from './lighthouse-runner.js';
import { runPlaywrightSmoke } from './playwright-runner.js';
import { runSecurityCheck } from './security-runner.js';
import { writeFileSync } from 'fs';

/**
 * Normalize input to a full URL.
 * @param {string} domain - e.g. example.com or https://example.com
 */
function toUrl(domain) {
  const s = domain.trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

/**
 * Run all tests for a domain and save a summary report.
 * @param {string} domain - Domain or full URL
 * @param {string} [reportsDir] - Default ./reports
 */
export async function runAll(domain, reportsDir = join(process.cwd(), 'reports')) {
  await mkdir(reportsDir, { recursive: true });
  const url = toUrl(domain);

  const out = {
    domain,
    url,
    timestamp: new Date().toISOString(),
    lighthouse: null,
    playwright: null,
    security: null,
    summary: { passed: 0, failed: 0 },
  };

  console.log(`\n Testing: ${url}\n`);

  // 1. Security (fast)
  console.log('  Security check...');
  out.security = await runSecurityCheck(url);
  if (out.security.success) out.summary.passed++; else out.summary.failed++;

  // 2. Playwright smoke (optional if browser not installed)
  console.log('  Playwright smoke...');
  try {
    out.playwright = await runPlaywrightSmoke(url, reportsDir);
    if (out.playwright.success) out.summary.passed++; else out.summary.failed++;
  } catch (e) {
    out.playwright = { success: false, error: e.message, skipped: true };
    out.summary.failed++;
  }

  // 3. Lighthouse (slower)
  console.log('  Lighthouse audit...');
  try {
    out.lighthouse = await runLighthouse(url, reportsDir);
    out.summary.passed++;
  } catch (err) {
    out.lighthouse = { success: false, error: err.message };
    out.summary.failed++;
  }

  // Save summary
  const slug = new URL(url).hostname.replace(/\./g, '-');
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const summaryPath = join(reportsDir, `summary-${slug}-${ts}.json`);
  writeFileSync(summaryPath, JSON.stringify(out, null, 2), 'utf8');

  console.log('\n Done. Summary:', summaryPath);
  return out;
}
