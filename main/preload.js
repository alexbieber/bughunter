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
  getToolsConfig: () => ipcRenderer.invoke('get-tools-config'),
});
