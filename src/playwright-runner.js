import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Run a quick smoke test on a URL: load page, take screenshot, basic checks.
 * @param {string} url - Full URL
 * @param {string} reportsDir - Directory for screenshots
 * @returns {{ success: boolean, screenshotPath?: string, error?: string }}
 */
export async function runPlaywrightSmoke(url, reportsDir) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = response?.status() ?? 0;
    const ok = status >= 200 && status < 400;

    const slug = new URL(url).hostname.replace(/\./g, '-');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const screenshotPath = join(reportsDir, `playwright-${slug}-${ts}.png`);

    await page.screenshot({ path: screenshotPath, fullPage: false });

    const title = await page.title();
    return {
      success: ok,
      status,
      title,
      screenshotPath,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  } finally {
    if (browser) await browser.close();
  }
}
