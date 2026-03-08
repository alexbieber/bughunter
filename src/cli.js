#!/usr/bin/env node

import { join } from 'path';
import { runAll } from './run-all.js';

const reportsDir = join(process.cwd(), 'reports');
const domain = process.argv[2] || process.env.DOMAIN;

if (!domain) {
  console.log(`
  domain-tester (local)
  Test any built software by domain name using Lighthouse, Playwright, and security checks.

  Usage:
    npx domain-tester <domain>
    node src/cli.js <domain>

  Examples:
    node src/cli.js https://example.com
    node src/cli.js staging.myapp.com

  Reports are saved in: ./reports
`);
  process.exit(1);
}

runAll(domain, reportsDir).then(
  (out) => {
    console.log('\nSummary:', JSON.stringify(out.summary, null, 2));
    if (out.lighthouse?.summary) {
      console.log('Lighthouse scores:', out.lighthouse.summary);
    }
    process.exit(out.summary.failed > 0 ? 1 : 0);
  },
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
