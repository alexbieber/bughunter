# Bug Bounty IDE

A **downloadable desktop app** for bug hunters: run recon, scanning, and exploitation tools from one place. Enter a domain or URL, pick a tool, and see output in the built-in terminal. No need to remember commands—everything runs inside the app.

## Features

- **User-friendly UI**: Target input, category sidebar (30+ categories from recon to exploitation), **search** to filter tools, one-click run
- **Integrated terminal**: All tool output runs in the IDE terminal (no separate window)
- **80+ tools** from the Awesome Bug Bounty Tools list:
  - **Recon**: Subdomain (Subfinder, Amass, Findomain, ShuffleDNS, dnsx, Assetfinder, AltDNS), Port (Nmap, Naabu, Masscan, RustScan), Screenshots (Gowitness, Aquatone), Tech (httpx, Wafw00f, WhatWeb, Fingerprintx)
  - **Content Discovery**: Gobuster, Feroxbuster, FFuf, Dirsearch, Katana, Hakrawler, Gospider, Kiterunner
  - **Links**: Waybackurls, GAU, Waymore, getJS, LinkFinder, JSLuice
  - **Parameters**: Arjun, ParamSpider, Parameth, x8
  - **Fuzzing**: WFuzz, FFuf
  - **Vulnerability Scanners**: Nuclei (CVE, P1/P2, XSS, full), Nikto, Jaeles, Retire.js
  - **Exploitation**: SQLMap, Ghauri, NoSQLMap; Dalfox, XSStrike, XSSer, BruteXSS; SSRFmap, Gopherus, SSRFire; XXEinjector, xxexploiter; Corsy, Corser; CRLFuzz, CRLFsuite; Oralyzer, OpenRedireX; DotDotPwn, Liffy, LFISuite; tplmap, SSTImap; Commix; GraphQLmap; Smuggler
  - **WAF & 403**: NoMore403, Forbidden Buster
  - **Misc**: Gitleaks, TruffleHog, SecretFinder; git-dumper, Gitjacker, GitTools; S3Scanner, CloudBrute; WPScan, CMSmap, Joomscan; JWT tool, jwtear; Subjack, Subzy, SubOver, tko-subs, DNS Reaper; Hydra, Patator
  - **Permutation**: alterx, Gotator, dnsgen
  - **Origin IP**: CloudRip, hakoriginfinder
  - **Useful**: anew, gf, qsreplace, unfurl, Interactsh, Notify, bbscope
- **Downloadable**: Build installers for Windows (NSIS/portable), macOS, and Linux (AppImage)

## Quick start

```bash
npm install
npm start
```

Enter a target (e.g. `example.com` or `https://example.com`), choose a category, click a tool to run it. Output appears in the bottom terminal panel.

## Building installers (downloadable software)

- **Windows**: `npm run build:win` → `dist/Bug Bounty IDE Setup.exe` (and portable)
- **macOS**: `npm run build:mac`
- **Linux**: `npm run build:linux` → AppImage

Requires [Node.js](https://nodejs.org/) 18+.

## Installing the CLI tools

The IDE **runs** the tools; they must be **installed on your system** and available in `PATH`. Use **Setup / Install tools** in the sidebar to see install commands (Go, pip, or download links).

### Recommended (most impact)

| Tool     | Purpose              | Install |
|----------|----------------------|--------|
| **Nuclei** | Vuln scanning (CVE, XSS, etc.) | `go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest` then `nuclei -update-templates` |
| **Subfinder** | Subdomain enumeration | `go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest` |
| **httpx** | HTTP probing, tech detection | `go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest` |
| **Gau / waybackurls** | URLs from archives | Go install (see tools config) |
| **SQLMap** | SQL injection | `pip install sqlmap` |
| **Dalfox** | XSS scanning | `go install github.com/hahwul/dalfox/v2@latest` |

You need **Go** (for most tools) and/or **Python** (for SQLMap, XSStrike, etc.). On Windows, add Go and Python to your system `PATH` so the IDE can run them.

## Tool config

Tools and commands are defined in `tools-config/tools.json`. You can add more tools or change commands (e.g. wordlists, flags). Use placeholders:

- `{{target}}` → domain only (e.g. `example.com`)
- `{{target_url}}` → full URL (e.g. `https://example.com`)

## Project layout

- `main/` — Electron main process (window, IPC, run commands)
- `renderer/` — UI (HTML, CSS, JS)
- `tools-config/tools.json` — Tool list and commands
- `src/` — Original domain tester CLI (Lighthouse, Playwright, security) — still usable via `npm run test:cli -- <domain>`

## License

MIT
