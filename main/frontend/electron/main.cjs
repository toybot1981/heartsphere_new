'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.APP_DEV === '1';
const devPort = process.env.APP_PORT || '3020';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: '心域',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL(`http://localhost:${devPort}`);
    win.webContents.openDevTools();
  } else {
    const dist = path.join(__dirname, '..', 'dist', 'index.html');
    win.loadFile(dist);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
