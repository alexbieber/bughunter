const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  runCommand: (opts) => ipcRenderer.invoke('run-command', opts),
  runCommandStream: (opts) => ipcRenderer.invoke('run-command-stream', opts),
  onCommandOutput: (cb) => {
    const handler = (_, data) => cb(data);
    ipcRenderer.on('command-output', handler);
    return () => ipcRenderer.removeListener('command-output', handler);
  },
  getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getToolsConfig: () => ipcRenderer.invoke('get-tools-config'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onUpdateAvailable: (cb) => {
    const handler = (_, data) => cb(data);
    ipcRenderer.on('update-available', handler);
    return () => ipcRenderer.removeListener('update-available', handler);
  },
  onUpdateDownloaded: (cb) => {
    const handler = (_, data) => cb(data);
    ipcRenderer.on('update-downloaded', handler);
    return () => ipcRenderer.removeListener('update-downloaded', handler);
  },
  onUpdateProgress: (cb) => {
    const handler = (_, data) => cb(data);
    ipcRenderer.on('update-progress', handler);
    return () => ipcRenderer.removeListener('update-progress', handler);
  },
  onUpdateError: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('update-error', handler);
    return () => ipcRenderer.removeListener('update-error', handler);
  },
  downloadUpdate: () => ipcRenderer.invoke('update-download'),
  quitAndInstall: () => ipcRenderer.invoke('update-quit-and-install'),
  checkForUpdatesFallback: () => ipcRenderer.invoke('check-for-updates-fallback'),
});
