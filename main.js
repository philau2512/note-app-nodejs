const { app, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./config');
const server = require('./server-electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: config.app.name,
    icon: path.join(__dirname, 'public/images/icon.png')
  });

  // Đợi server khởi động và tải trang từ localhost
  const loadApp = () => {
    const port = config.port || 3000;
    mainWindow.loadURL(`http://localhost:${port}`);
    console.log(`Đang tải ứng dụng từ http://localhost:${port}`);
  };

  // Đợi 1 giây cho server khởi động
  setTimeout(loadApp, 1000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});