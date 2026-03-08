const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const GITHUB_REPO = 'https://github.com/alexbieber/bughunter';
const GITHUB_RELEASES = `${GITHUB_REPO}/releases`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Bug Bounty IDE — Desktop app with 80+ tools for recon, scanning & exploitation. One place to run Subfinder, Nuclei, SQLMap and more." />
  <title>Bug Bounty IDE — 80+ tools in one desktop app</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #06060a;
      --bg-elevated: #0c0c12;
      --surface: #12121a;
      --border: #1e1e2a;
      --text: #e8e8ed;
      --text-muted: #8888a0;
      --accent: #f59e0b;
      --accent-dim: #b45309;
      --accent-glow: rgba(245, 158, 11, 0.25);
      --success: #22c55e;
      --radius: 12px;
      --font-sans: 'Syne', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-sans);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.5;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
    }
    .wrap { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    header {
      padding: 1.5rem 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
    }
    .logo span { font-size: 1.5rem; }
    .nav a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      transition: color 0.2s, background 0.2s;
    }
    .nav a:hover { color: var(--accent); background: var(--surface); }
    .hero {
      padding: 4rem 0 5rem;
      text-align: center;
    }
    .hero .badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--accent);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      margin-bottom: 1.5rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .hero h1 {
      font-size: clamp(2.5rem, 7vw, 4rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 1rem;
      background: linear-gradient(180deg, #fff 0%, #a0a0b0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero h1 .accent { background: linear-gradient(135deg, var(--accent) 0%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero .tagline {
      font-size: 1.2rem;
      color: var(--text-muted);
      max-width: 520px;
      margin: 0 auto 2.5rem;
      font-weight: 500;
    }
    .cta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: 1rem;
      padding: 0.9rem 1.6rem;
      border-radius: var(--radius);
      text-decoration: none;
      transition: transform 0.15s, box-shadow 0.2s;
      border: none;
      cursor: pointer;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%);
      color: #0a0a0a;
      box-shadow: 0 4px 24px var(--accent-glow);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px var(--accent-glow); }
    .btn-secondary {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
    .btn svg { width: 1.2em; height: 1.2em; }
    section { padding: 4rem 0; }
    section h2 {
      font-size: clamp(1.75rem, 4vw, 2.25rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .feature-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .feature-card:hover { border-color: var(--accent-dim); box-shadow: 0 0 0 1px var(--accent-glow); }
    .feature-card .icon { font-size: 1.75rem; margin-bottom: 0.75rem; }
    .feature-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.35rem; }
    .feature-card p { font-size: 0.9rem; color: var(--text-muted); }
    .stat {
      font-family: var(--font-mono);
      font-size: 2rem;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }
    .downloads {
      background: var(--bg-elevated);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .downloads .wrap { text-align: center; }
    .downloads h2 { margin-bottom: 0.5rem; }
    .downloads .sub { color: var(--text-muted); margin-bottom: 2rem; }
    .download-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .download-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      min-width: 180px;
      padding: 1rem 1.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      color: var(--text);
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      transition: border-color 0.2s, background 0.2s, transform 0.15s;
    }
    .download-btn:hover { border-color: var(--accent); background: rgba(245, 158, 11, 0.08); transform: translateY(-2px); }
    .download-btn .os-icon { font-size: 1.5rem; }
    .download-btn .label { display: block; font-size: 0.8rem; font-weight: 500; color: var(--text-muted); margin-top: 0.15rem; }
    .source-link {
      font-size: 0.95rem;
      color: var(--text-muted);
    }
    .source-link a { color: var(--accent); text-decoration: none; font-weight: 500; }
    .source-link a:hover { text-decoration: underline; }
    .categories {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
    .pill {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--text-muted);
    }
    footer {
      padding: 3rem 0;
      text-align: center;
      border-top: 1px solid var(--border);
    }
    footer p { color: var(--text-muted); font-size: 0.9rem; }
    footer a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>
  <header class="wrap">
    <div class="logo"><span>🛡️</span> Bug Bounty IDE</div>
    <nav class="nav">
      <a href="#features">Features</a>
      <a href="#download">Download</a>
      <a href="${GITHUB_REPO}">GitHub</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="wrap">
        <div class="badge">Desktop app · Windows, macOS, Linux</div>
        <h1>One IDE. <span class="accent">80+ tools.</span></h1>
        <p class="tagline">Recon, scanning, and exploitation in one place. Enter a target, pick a tool, run. No need to remember commands.</p>
        <div class="cta-row">
          <a href="${GITHUB_RELEASES}" class="btn btn-primary">
            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            Download
          </a>
          <a href="${GITHUB_REPO}" class="btn btn-secondary">View on GitHub</a>
        </div>
        <p class="source-link">Releases · <a href="${GITHUB_REPO}#readme">Build from source</a></p>
      </div>
    </section>

    <section id="features">
      <div class="wrap">
        <h2>Built for bug hunters</h2>
        <div class="features">
          <div class="feature-card">
            <div class="stat">80+</div>
            <h3>Tools in one app</h3>
            <p>Subfinder, Nuclei, SQLMap, FFuf, Dalfox, and dozens more. Recon to exploitation.</p>
          </div>
          <div class="feature-card">
            <div class="icon">⌨️</div>
            <h3>Integrated terminal</h3>
            <p>All tool output runs in the IDE. No separate windows, no copy-paste.</p>
          </div>
          <div class="feature-card">
            <div class="icon">🎯</div>
            <h3>One-click run</h3>
            <p>Enter domain or URL, pick a tool, click. Commands are built for you.</p>
          </div>
          <div class="feature-card">
            <div class="icon">📦</div>
            <h3>Download & run</h3>
            <p>Windows (NSIS/portable), macOS, Linux (AppImage). Install and go.</p>
          </div>
        </div>
        <div class="categories">
          <span class="pill">Recon</span>
          <span class="pill">Content discovery</span>
          <span class="pill">Vuln scanners</span>
          <span class="pill">Exploitation</span>
          <span class="pill">WAF & 403</span>
          <span class="pill">Misc</span>
        </div>
      </div>
    </section>

    <section id="download" class="downloads">
      <div class="wrap">
        <h2>Download Bug Bounty IDE</h2>
        <p class="sub">Pick your platform. Requires Node 18+ to build from source.</p>
        <div class="download-grid">
          <a href="${GITHUB_RELEASES}" class="download-btn">
            <span class="os-icon">🪟</span>
            <span><strong>Windows</strong><span class="label">Setup.exe · Portable</span></span>
          </a>
          <a href="${GITHUB_RELEASES}" class="download-btn">
            <span class="os-icon">🍎</span>
            <span><strong>macOS</strong><span class="label">.dmg / .pkg</span></span>
          </a>
          <a href="${GITHUB_RELEASES}" class="download-btn">
            <span class="os-icon">🐧</span>
            <span><strong>Linux</strong><span class="label">AppImage</span></span>
          </a>
        </div>
        <p class="source-link">Releases are published on <a href="${GITHUB_RELEASES}">GitHub Releases</a>. To build locally: <code style="font-family: var(--font-mono); font-size: 0.85em; background: var(--surface); padding: 0.2rem 0.5rem; border-radius: 4px;">npm run build:win</code> / <code style="font-family: var(--font-mono); font-size: 0.85em; background: var(--surface); padding: 0.2rem 0.5rem; border-radius: 4px;">build:mac</code> / <code style="font-family: var(--font-mono); font-size: 0.85em; background: var(--surface); padding: 0.2rem 0.5rem; border-radius: 4px;">build:linux</code></p>
      </div>
    </section>
  </main>

  <footer class="wrap">
    <p><a href="${GITHUB_REPO}">Bug Bounty IDE</a> — MIT · Tools run on your system; install via Setup in the app.</p>
  </footer>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
console.log('Static build complete: public/index.html');
