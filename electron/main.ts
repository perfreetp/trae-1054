import { app, BrowserWindow } from 'electron'
import path from 'path'

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    title: '智慧港口安全环保监控系统',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../public/icon.png')
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../index.html'))
  }

  win.on('closed', () => {
    win = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
