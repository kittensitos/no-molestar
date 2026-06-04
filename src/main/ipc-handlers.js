const { BrowserWindow } = require('electron');
const { app } = require('electron');
const configStore = require('./config-store');

function registerIpcHandlers(ipcMain) {
  ipcMain.handle('config:get-api-key', () => configStore.getApiKey());
  ipcMain.handle('config:set-api-key', (_e, key) => configStore.setApiKey(key));
  ipcMain.handle('config:has-api-key', () => configStore.hasApiKey());
  ipcMain.handle('config:clear-api-key', () => configStore.clearApiKey());

  ipcMain.handle('window:minimize', (e) => {
    BrowserWindow.fromWebContents(e.sender)?.minimize();
  });

  ipcMain.handle('window:maximize', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win) win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.handle('window:close', (e) => {
    BrowserWindow.fromWebContents(e.sender)?.close();
  });

  ipcMain.handle('app:quit', () => app.quit());

  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:get-platform', () => process.platform);
}

module.exports = { registerIpcHandlers };
