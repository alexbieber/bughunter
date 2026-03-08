const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

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
  mainWindow.once('ready-to-show', () => mainWindow.show());

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
