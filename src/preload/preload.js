const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('noMolestar', {
  config: {
    getApiKey: () => ipcRenderer.invoke('config:get-api-key'),
    setApiKey: (key) => ipcRenderer.invoke('config:set-api-key', key),
    hasApiKey: () => ipcRenderer.invoke('config:has-api-key'),
    clearApiKey: () => ipcRenderer.invoke('config:clear-api-key'),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  },
});
