const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');

const GITHUB_REPO = 'alexbieber/bughunter';

function parseVersion(v) {
  const s = String(v || '').replace(/^v/, '').trim();
  return s.split('.').map((n) => parseInt(n, 10) || 0);
}

function isNewer(latest, current) {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    setupAutoUpdater();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Run a tool command and stream output to renderer
ipcMain.handle('run-command', async (_, { command, cwd, env }) => {
  const isWin = process.platform === 'win32';
  const shellCmd = isWin ? 'cmd.exe' : '/bin/sh';
  const shellArg = isWin ? '/c' : '-c';

  return new Promise((resolve, reject) => {
    const child = spawn(shellCmd, [shellArg, command], {
      cwd: cwd || app.getPath('userData'),
      env: { ...process.env, ...env },
      shell: false,
    });

    const chunks = [];
    const errChunks = [];

    child.stdout.on('data', (data) => chunks.push(data.toString()));
    child.stderr.on('data', (data) => errChunks.push(data.toString()));

    child.on('error', (err) => {
      mainWindow?.webContents.send('command-output', { type: 'stderr', data: err.message + '\n' });
      reject(err);
    });

    child.on('close', (code, signal) => {
      mainWindow?.webContents.send('command-output', { type: 'done', code, signal });
      resolve({ code, signal });
    });
  });
});

// Stream output in real time
ipcMain.handle('run-command-stream', async (_, { command, cwd, env }) => {
  const isWin = process.platform === 'win32';
  const shellCmd = isWin ? 'cmd.exe' : '/bin/sh';
  const shellArg = isWin ? '/c' : '-c';

  const child = spawn(shellCmd, [shellArg, command], {
    cwd: cwd || app.getPath('userData'),
    env: { ...process.env, ...env },
    shell: false,
  });

  child.stdout.on('data', (data) => {
    mainWindow?.webContents.send('command-output', { type: 'stdout', data: data.toString() });
  });
  child.stderr.on('data', (data) => {
    mainWindow?.webContents.send('command-output', { type: 'stderr', data: data.toString() });
  });

  child.on('error', (err) => {
    mainWindow?.webContents.send('command-output', { type: 'stderr', data: err.message + '\n' });
  });

  child.on('close', (code, signal) => {
    mainWindow?.webContents.send('command-output', { type: 'done', code, signal });
  });

  return { pid: child.pid };
});

ipcMain.handle('get-app-path', (_, name) => app.getPath(name));
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('open-external', (_, url) => {
  if (url && typeof url === 'string') shell.openExternal(url);
});

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate,
    });
  });
  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('update-downloaded', { version: info.version });
  });
  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('update-progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  });
  autoUpdater.on('error', () => {
    mainWindow?.webContents.send('update-error');
  });
  autoUpdater.checkForUpdates().catch(() => {});
}

ipcMain.handle('update-download', () => {
  autoUpdater.downloadUpdate().catch(() => {
    mainWindow?.webContents.send('update-error');
  });
});
ipcMain.handle('update-quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true);
});

// Fallback: check GitHub API when electron-updater doesn't find an update (e.g. missing latest.yml)
ipcMain.handle('check-for-updates-fallback', () => {
  const current = app.getVersion();
  return new Promise((resolve) => {
    const req = https.get(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers: { 'User-Agent': 'BugBountyIDE-Updater' } },
      (res) => {
        if (res.statusCode !== 200) {
          resolve({ available: false });
          return;
        }
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const tag = (data.tag_name || '').trim();
            const version = tag.replace(/^v/, '');
            const releaseUrl = data.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`;
            if (version && isNewer(version, current)) {
              resolve({ available: true, version, releaseUrl });
            } else {
              resolve({ available: false });
            }
          } catch (_) {
            resolve({ available: false });
          }
        });
      }
    );
    req.on('error', () => resolve({ available: false }));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ available: false });
    });
  });
});

ipcMain.handle('get-tools-config', async () => {
  const fs = require('fs');
  const p = path.join(__dirname, '../tools-config/tools.json');
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { categories: [], tools: [] };
  }
});
