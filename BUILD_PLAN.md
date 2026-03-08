# Build plan: installable software anyone can use

This plan turns the Bug Bounty IDE into **one installable app** that anyone can download and run on Windows, macOS, or Linux—no Node.js or dev environment required.

---

## 1. Goal

- **Output**: Installable applications that end users run by double‑clicking (or from the Start Menu / Applications).
- **Users**: Anyone (researchers, bug hunters, students)—no need to install Node, npm, or run terminals to “start” the app.
- **Platforms**: Windows (primary), macOS, Linux (AppImage).

---

## 2. What “anyone” gets

| Platform | Artifact | How users get it |
|----------|----------|-------------------|
| **Windows** | `Bug Bounty IDE Setup 1.0.0.exe` (NSIS installer) | Download → run → choose install folder → finish. |
| **Windows** | `Bug Bounty IDE 1.0.0.exe` (portable) | Download → run from any folder; no install step. |
| **macOS** | `Bug Bounty IDE-1.0.0.dmg` (or `.app`) | Download → open DMG → drag to Applications. |
| **Linux** | `Bug Bounty IDE-1.0.0.AppImage` | Download → `chmod +x` → run; runs like a normal app. |

After install, the user double‑clicks the app icon. No terminal, no `npm start`.

---

## 3. Prerequisites (only for you, the builder)

You need these **on the machine where you run the build** (not on the end user’s machine):

| Requirement | Purpose |
|-------------|--------|
| **Node.js 18+** | Run `npm` and Electron build. |
| **npm** | Install deps and run build scripts. |
| **~500 MB free disk** | `node_modules` + Electron + build output. |
| **Windows**: Visual Studio Build Tools (if needed for native modules) | Usually not needed with current stack. |
| **macOS**: Xcode Command Line Tools (for Mac build) | Only when building the Mac version. |

End users do **not** need Node, npm, or Git.

---

## 4. Build process (step‑by‑step)

### Phase A: Prepare the project

1. **Clone / open the project**
   ```bash
   cd "f:\cursor projects\test2bug"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   If you see `ENOSPC` (no space), free disk space and retry.

3. **Smoke test (run as developer)**
   ```bash
   npm start
   ```
   - Enter a target (e.g. `example.com`).
   - Click a tool (e.g. Subfinder or Nuclei) and confirm the terminal shows output (or “not found” if the tool isn’t installed—that’s expected).

### Phase B: Build installers

4. **Build for your platform**
   - **Windows** (on a Windows machine):
     ```bash
     npm run build:win
     ```
     Output: `dist/Bug Bounty IDE Setup 1.0.0.exe` and `dist/Bug Bounty IDE 1.0.0.exe` (portable).
   - **macOS** (on a Mac):
     ```bash
     npm run build:mac
     ```
     Output: `dist/Bug Bounty IDE-1.0.0.dmg` (or `.app` in `dist/mac`).
   - **Linux** (on Linux):
     ```bash
     npm run build:linux
     ```
     Output: `dist/Bug Bounty IDE-1.0.0.AppImage`.

5. **Optional: build all from one place**
   - Use the included GitHub Actions workflow (see **Section 7** and the file `.github/workflows/build-release.yml`). Push a tag like `v1.0.0` to trigger builds for Windows, macOS, and Linux; installers are attached to the GitHub Release automatically.

### Phase C: Distribute so anyone can install

6. **Put installers where users can download**
   - **Option A – GitHub Releases (recommended)**
     - Create a repo (or use existing).
     - Tag a release (e.g. `v1.0.0`).
     - Upload `Bug Bounty IDE Setup 1.0.0.exe`, portable EXE, DMG, AppImage as release assets.
     - Users go to “Releases”, download the file for their OS, and run it.
   - **Option B – Website**
     - Host the same files on your site (e.g. “Download for Windows”, “Download for Mac”, “Download for Linux”).
   - **Option C – Package managers (advanced)**
     - Windows: winget, Chocolatey.
     - macOS: Homebrew cask.
     - Linux: Flathub, Snap (requires extra packaging).

---

## 5. User journey (after download)

1. **Download** the installer for their OS (e.g. `Bug Bounty IDE Setup 1.0.0.exe`).
2. **Run** the installer (Windows may show “Unknown publisher” until you add code signing—see Section 6).
3. **Install** (choose folder if using NSIS; portable users just run the EXE).
4. **Launch** the app from Start Menu / desktop / Applications.
5. **First use**
   - Enter a target (domain or URL).
   - Click “Setup / Install tools” to see how to install Subfinder, Nuclei, etc. (Go/Python or direct download).
   - Install those tools on the system once; the IDE will run them from the terminal panel.

The app itself is **fully installable**; the optional part is installing the CLI tools (Nuclei, Subfinder, etc.) for full functionality.

---

## 6. Optional: code signing and notarization (recommended for “anyone”)

So that “anyone” doesn’t get scary warnings when installing:

| Platform | What to do |
|----------|------------|
| **Windows** | Sign the EXE with a code‑signing certificate (e.g. from DigiCert, Sectigo). Reduces “Windows protected your PC” / SmartScreen warnings. |
| **macOS** | Sign the app and notarize with Apple. Avoids “unidentified developer” and Gatekeeper blocks. |
| **Linux** | No standard signing for AppImage; some stores (e.g. Flathub) have their own verification. |

Steps are not in this repo; they depend on your certificate and CI. Plan: obtain certificate → configure `electron-builder` with signing options → run the same build commands; the builder will sign the artifacts.

---

## 7. Optional: automated builds (CI)

To build the same installers on every release without using your laptop:

1. **GitHub Actions (included)**
   - File: `.github/workflows/build-release.yml`
   - **Trigger**: Push a version tag (e.g. `v1.0.0`).
   - **Jobs**: Build Windows (NSIS/portable), macOS (DMG), Linux (AppImage) on separate runners.
   - **Release**: The workflow creates a GitHub Release for that tag and attaches all installer files. “Anyone” goes to the repo → **Releases** → downloads the right file for their OS.

2. **How to use it**
   - Push your code to a GitHub repo.
   - Create and push a tag:
     ```bash
     git tag v1.0.0
     git push origin v1.0.0
     ```
   - Open the repo → **Actions** → wait for “Build release” to finish.
   - Open **Releases** → you’ll see `v1.0.0` with Windows/macOS/Linux installers attached.

3. **Secrets (optional)**
   - For code signing (Windows) and notarization (macOS), add certificates and keys to GitHub Secrets and extend the workflow to sign/notarize before uploading.

---

## 8. Checklist: from zero to “anyone can install”

Use this as a single checklist to build and ship the installable software.

- [ ] **Code ready**: App runs with `npm start`, no critical bugs.
- [ ] **Dependencies**: `npm install` succeeds (enough disk space).
- [ ] **Build Windows**: `npm run build:win` → EXE(s) in `dist/`.
- [ ] **Build macOS** (if needed): On a Mac, `npm run build:mac` → DMG or .app.
- [ ] **Build Linux** (if needed): On Linux, `npm run build:linux` → AppImage.
- [ ] **Test install**: On a clean VM or another PC, run the installer and launch the app.
- [ ] **Document**: README or website with “Download for Windows / Mac / Linux” and first‑run steps.
- [ ] **Distribute**: Upload installers to GitHub Releases (or your site).
- [ ] **(Optional)** Code signing (Windows) and notarization (macOS) for fewer security warnings.
- [ ] **(Optional)** CI workflow to build installers on every release.

---

## 9. Summary

| Step | Action |
|------|--------|
| 1 | Install Node 18+, free ~500 MB disk. |
| 2 | `npm install` then `npm start` to verify. |
| 3 | `npm run build:win` (or `build:mac` / `build:linux`) to create installers. |
| 4 | Upload `dist/` installers to GitHub Releases or your website. |
| 5 | Users download and run the installer; no Node or dev setup required. |

The “whole plan” is: **build once with Electron + electron-builder → get installers → put them where users can download → anyone can install and run the software.**
