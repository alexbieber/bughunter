# Publishing a release (so the landing page download buttons work)

The landing page download links point to **GitHub Release assets**. Until you create a release and upload the built installers, those links will 404. Here’s how to fix that.

## 1. Build the installers

On your machine (or in CI), run:

```bash
npm install
npm run build:win   # → dist/Bug Bounty IDE Setup 1.0.0.exe (and portable)
npm run build:mac   # → dist/Bug Bounty IDE-1.0.0.dmg (or .pkg)
npm run build:linux # → dist/Bug Bounty IDE-1.0.0.AppImage
```

Build on **Windows** for the .exe, **macOS** for the .dmg, **Linux** for the AppImage (or use CI for all three).

## 2. Create a GitHub Release

1. Open **https://github.com/alexbieber/bughunter/releases**
2. Click **“Create a new release”**
3. Choose a tag (e.g. `v1.0.0`) or create it
4. Set the release title (e.g. “v1.0.0”) and add notes if you want
5. **Upload the built files** from `dist/`:
   - `Bug Bounty IDE Setup 1.0.0.exe` (Windows)
   - `Bug Bounty IDE-1.0.0.dmg` (macOS)
   - `Bug Bounty IDE-1.0.0.AppImage` (Linux)
6. Publish the release

The filenames must match exactly what’s in `package.json` (version and `productName`), or the landing page links won’t find them.

## 3. After that

The “Download” section on the site uses:

- `.../releases/latest/download/Bug Bounty IDE Setup 1.0.0.exe`
- `.../releases/latest/download/Bug Bounty IDE-1.0.0.dmg`
- `.../releases/latest/download/Bug Bounty IDE-1.0.0.AppImage`

So when someone clicks **Windows** / **macOS** / **Linux**, the browser will download the installer.

When you bump the version (e.g. to 1.0.1), update `package.json`, build again, create a new release with the new assets, and redeploy the site (so the generated links use the new version).
