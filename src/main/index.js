'use strict'

import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
const path = require('path')
const fs = require('fs')

function initUpdater() {
  const updaterCacheDirName = 'civet'
  const path = require('path')
  const updatePendingPath = path.join(autoUpdater.app.baseCachePath, updaterCacheDirName, 'pending')
  console.info('update dir:', updatePendingPath)
  if (fs.existsSync(updatePendingPath)) fs.rmdir(updatePendingPath)
  const updateURL = 'https://download.fastgit.org/webbery/civet/releases/download'
  autoUpdater.autoDownload = false
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
  } else {
    autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml')
  }
  autoUpdater.setFeedURL(updateURL)

  autoUpdater.on('checking-for-update', () => {
    sendWindowMessage(workerWindow, 'checking-for-update', 'Checking for update...')
  })
  autoUpdater.on('update-available', (info) => {
    sendWindowMessage(workerWindow, 'update-available', 'Update available.')
  })
  autoUpdater.on('update-not-available', (info) => {
    sendWindowMessage(workerWindow, 'update-not-available', 'Update not available.')
  })
  autoUpdater.on('error', (err) => {
    sendWindowMessage(workerWindow, 'error', 'Error in auto-updater. ' + err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = 'Download speed: ' + progressObj.bytesPerSecond
    logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%'
    logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    sendWindowMessage(workerWindow, 'download-progress', logMessage)
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendWindowMessage(workerWindow, 'update-downloaded', 'Update downloaded')
  })
}
initUpdater()
// import '../renderer/store'
// const cpus = require('os').cpus().length
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

// function enableDevTools(window) {
//   window.webContents.on('did-frame-finish-load', () => {
//     window.webContents.once('devtools-opened', () => {
//       window.focus()
//     })
//     window.webContents.openDevTools()
//   })
// }
let mainWindow, workerWindow
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : path.join(__dirname, '/index.html')
function createRendererWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      webSecurity: false,
      additionalArguments: ['renderer']
    },
    backgroundColor: '#222933',
    allowRunningInsecureContent: true,
    height: 563,
    useContentSize: true,
    width: 1000,
    show: false
  })

  mainWindow.maximize()
  mainWindow.loadURL(winURL)

  mainWindow.onbeforeunload = (e) => {
    console.info('onbeforeunload')
    return true
  }
  mainWindow.on('close', () => {
    // config.save()
    workerWindow.close()
    // mainWindow.close()
  })
  mainWindow.webContents.openDevTools()
  if (process.env.NODE_ENV === 'development') {
    // enableDevTools(mainWindow)
  }
  mainWindow.show()
  // if (process.env.NODE_ENV !== 'development') {
  //   workerWindow.hide()
  // }
}
function createWorkerWindow (bFirst) {
  workerWindow = new BrowserWindow({
    // show: true,
    show: process.env.NODE_ENV === 'development',
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      additionalArguments: ['worker']
    }
  })
  workerWindow.on('closed', () => {
    console.log('background window closed')
  })
  let workerURL
  // if (bFirst) {
  //   workerURL = process.env.NODE_ENV === 'development'
  //     ? `guider.html`
  //     : `file://${__dirname}/guider.html`
  // } else {
  workerURL = process.env.NODE_ENV === 'development'
    // ? `http://localhost:9081`
    ? 'worker.html'
    : path.join(__dirname, '/worker.html')
  // }
  if (process.env.NODE_ENV === 'development') workerWindow.loadFile(workerURL)
  else workerWindow.loadURL(workerURL)
  // workerWindow.webContents.openDevTools()
  if (process.env.NODE_ENV === 'development') {
    workerWindow.webContents.openDevTools()
  }
}

app.on('window-all-closed', async () => {
  console.info('---------close 2------------')
  // if (process.platform !== 'darwin') {
  app.quit()
  // }
})

app.on('activate', () => {
  if (mainWindow === null) {
    console.info('createWindow()')
  }
})

// let childDirectoryWindow
// ipcMain.on('import-directory', () => {
//   console.info('-------------')
//   childDirectoryWindow = new BrowserWindow({
//     parent: mainWindow,
//     modal: true,
//     show: false,
//     width: 300,
//     height: 300,
//     resizable: false,
//     backgroundColor: '#fff',
//     frame: false,
//     hasShadow: true,
//     closable: true,
//     webPreferences: {
//       devTools: false
//     }
//   })
//   childDirectoryWindow.once('ready-to-show', () => {
//     childDirectoryWindow.show()
//   })
//   childDirectoryWindow.loadURL(winURL + '#/downloadModal')
// })
// // 关闭模态窗口
// ipcMain.on('close-down-modal', () => {
//   childDirectoryWindow.hide()
// })
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

function sendWindowMessage(targetWindow, message, payload) {
  if (typeof targetWindow === 'undefined') {
    console.log('Target window does not exist')
    return
  }
  targetWindow.webContents.send(message, payload)
}

app.on('ready', async () => {
  Menu.setApplicationMenu(null)
  createWorkerWindow()
  ipcMain.on('message-from-worker', (event, arg) => {
    // console.info('########################')
    // console.info(arg.type, arg.data)
    sendWindowMessage(mainWindow, 'message-to-renderer', arg)
  })
  ipcMain.on('message-from-renderer', (event, arg) => {
    // console.info('message-to-background: ', event, arg)
    // tasks.push(['message-to-background', event, arg])
    // console.info(workerWindow)
    sendWindowMessage(workerWindow, 'message-from-main', arg)
  })
  ipcMain.on('ready', (event, arg) => {
    console.info('child process ready')
    createRendererWindow()
  })
  ipcMain.on('export2Diectory', (event, arg) => {
    const { dialog } = require('electron')
    console.info(arg)
    const dir = dialog.showOpenDialogSync(mainWindow, {
      title: '导出文件',
      buttonLabel: '导出',
      properties: ['openDirectory']
    })
    if (!dir) return
    console.info('export:', dir)
    if (!fs.statSync(dir[0]).isDirectory()) return
    // copy files to dir
    const path = require('path')
    for (let filepath of arg) {
      if (fs.existsSync(filepath)) {
        console.info(filepath)
        const f = path.parse(filepath)
        const dest = dir + '/' + f.base
        console.info(dest)
        fs.copyFileSync(filepath, dest)
      }
    }
  })
})
