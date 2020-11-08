'use strict'

import path from 'path'
import fs from 'fs'
import { app, BrowserWindow, dialog, ipcMain, protocol } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import AppDirectory from 'appdirectory'

const isDevelopment = process.env.NODE_ENV !== 'production'

const dirs = new AppDirectory({ appName: 'roshar-map-translation-editor' })

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const configCancelError = new Error()

ipcMain.on('change-working-directory', (event) => {
  try {
    event.returnValue = createConfig('You will be prompted for the new working directory').workingDirectory
  } catch (e) {
    if (e === configCancelError) {
      event.returnValue = undefined
      return
    }

    throw e
  }
})

function getWorkingDirectory () {
  const configDir = dirs.userConfig()
  const configPath = path.resolve(configDir, 'config.json')

  if (!fs.existsSync(configDir) || !fs.existsSync(configPath)) {
    createConfig(
      'You have not yet configured a working directory and will be prompted for it now. Please select the directory containing the "roshar-map" project'
    )
  }

  let config
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch (e) {
    config = createConfig('Could not read the existing config file, please choose the working directory again')
  }

  if (config.workingDirectory === undefined) {
    config = createConfig('Existing config file did not contain working directory, please select another')
  }

  if (!isValidDirectory(config.workingDirectory)) {
    config = createConfig(`The currently configured working directory "${config.workingDirectory}" is not valid. Please select it again`)
  }

  return config.workingDirectory
}

function createConfig (message) {
  const configDir = dirs.userConfig()
  fs.mkdirSync(configDir, { recursive: true })

  dialog.showMessageBoxSync({
    title: 'No/invalid working directory',
    message,
    buttons: ['Okay']
  })

  while (true) {
    const filePaths = dialog.showOpenDialogSync({ title: 'Select roshar-map directory', properties: ['openDirectory'] })
    if (filePaths === undefined) {
      throw configCancelError
    }

    const workingDirectory = filePaths[0]
    if (isValidDirectory(workingDirectory)) {
      const config = { workingDirectory }
      fs.writeFileSync(path.resolve(configDir, 'config.json'), JSON.stringify(config))
      return config
    }

    dialog.showMessageBoxSync({
      type: 'error',
      title: 'Invalid working directory',
      message: `The selected working directory "${workingDirectory}" is not valid, please select another`,
      buttons: ['Okay']
    })
  }
}

function isValidDirectory (workingDirectory) {
  if (!fs.existsSync(workingDirectory)) {
    return false
  }

  const stat = fs.statSync(workingDirectory)
  if (!stat.isDirectory()) {
    return false
  }

  return fs.existsSync(path.resolve(workingDirectory, 'translations', 'en')) &&
    fs.existsSync(path.resolve(workingDirectory, 'src', 'lang', 'en.lang.json')) &&
    fs.existsSync(path.resolve(workingDirectory, 'translation-comments.json'))
}

async function createWindow () {
  let workingDirectory
  try {
    workingDirectory = getWorkingDirectory()
  } catch (e) {
    if (e === configCancelError) {
      app.quit()
      return
    }

    throw e
  }

  // Create the browser window.
  const win = new BrowserWindow({
    title: 'Roshar Map Translation Editor',
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [`--translation-working-directory=${workingDirectory}`]
    },
    // eslint-disable-next-line no-undef
    icon: path.join(__static, 'icon.png')
  })
  win.setMenu(null)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools()
    }
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
