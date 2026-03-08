import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Run Lighthouse on a URL locally. Saves HTML + JSON report.
 * @param {string} url - Full URL (e.g. https://example.com)
 * @param {string} reportsDir - Directory to save reports
 * @returns {{ reportPath: string, summary: object }}
 */
export async function runLighthouse(url, reportsDir) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  });

  try {
    const options = {
      logLevel: 'info',
      output: 'html',
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    const runnerResult = await lighthouse(url, options);

    const slug = new URL(url).hostname.replace(/\./g, '-');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const base = `lighthouse-${slug}-${ts}`;

    const htmlPath = join(reportsDir, `${base}.html`);
    const jsonPath = join(reportsDir, `${base}.report.json`);

    if (typeof runnerResult.report === 'string') {
      writeFileSync(htmlPath, runnerResult.report, 'utf8');
    }
    if (runnerResult.lhr) {
      writeFileSync(jsonPath, JSON.stringify(runnerResult.lhr, null, 2), 'utf8');
    }

    const lhr = runnerResult.lhr || {};
    const categories = lhr.categories || {};
    const summary = {};
    for (const [key, cat] of Object.entries(categories)) {
      if (cat.score != null) summary[key] = Math.round((cat.score ?? 0) * 100);
    }

    return {
      reportPath: htmlPath,
      jsonPath,
      summary,
      success: true,
    };
  } finally {
    await chrome.kill();
  }
}
