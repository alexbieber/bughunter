const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bug Bounty IDE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Space Grotesk', sans-serif; background: #0d1117; color: #e6edf3; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { max-width: 480px; padding: 2rem; text-align: center; }
    .logo { font-size: 3rem; margin-bottom: 0.5rem; }
    h1 { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.5rem; }
    p { color: #8b949e; margin: 0 0 1.5rem; line-height: 1.5; }
    .btn { display: inline-block; background: #238636; color: #fff; padding: 0.6rem 1.25rem; border-radius: 6px; text-decoration: none; font-weight: 500; }
    .btn:hover { background: #2ea043; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🛡️</div>
    <h1>Bug Bounty IDE</h1>
    <p>Downloadable desktop app with 80+ tools for recon, scanning, and exploitation. All tools run in-app.</p>
    <a href="https://github.com/hackthetrack1234-8755/bughunter" class="btn">Get the app on GitHub</a>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
console.log('Static build complete: public/index.html');
