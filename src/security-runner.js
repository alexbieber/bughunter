/**
 * Basic local security checks by domain: HTTPS, security headers.
 * No external services — just fetch and inspect.
 * @param {string} url - Full URL
 * @returns {{ success: boolean, https: boolean, headers: object, issues: string[] }}
 */
export async function runSecurityCheck(url) {
  const issues = [];
  let https = false;
  const securityHeaders = {};

  try {
    const parsed = new URL(url);
    https = parsed.protocol === 'https:';
    if (!https) issues.push('Not using HTTPS');

    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'DomainTester-Local/1.0' },
    });

    const desired = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'content-security-policy',
      'x-xss-protection',
    ];
    for (const name of desired) {
      const val = res.headers.get(name);
      if (val) securityHeaders[name] = val;
      else issues.push(`Missing header: ${name}`);
    }

    return {
      success: issues.length === 0,
      https,
      headers: securityHeaders,
      issues,
      status: res.status,
    };
  } catch (err) {
    issues.push(err.message);
    return {
      success: false,
      https: false,
      headers: securityHeaders,
      issues,
    };
  }
}
