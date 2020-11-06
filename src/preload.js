import fs from 'fs'
import path from 'path'
import { ipcRenderer } from 'electron'
import * as read from '@/model/read'
import * as write from '@/model/write'

const workingDirectoryPrefix = '--translation-working-directory='
window.workingDirectory = window.process.argv.find(arg => arg.startsWith(workingDirectoryPrefix)).substring(workingDirectoryPrefix.length)

window.changeWorkingDirectory = () => {
  const result = ipcRenderer.sendSync('change-working-directory')
  if (result === undefined) {
    return false
  }

  window.workingDirectory = result

  return true
}

window.loadLocales = () => {
  const locales = fs.readdirSync(path.resolve(window.workingDirectory, 'translations'), { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name !== 'en')
    .map((entry) => {
      const dataFilePath = path.resolve(window.workingDirectory, 'translations', entry.name, 'data.json')

      if (!fs.existsSync(dataFilePath)) {
        return {
          locale: entry.name,
          flag: 'unknown',
          name: `${entry.name}, no data.json`
        }
      }

      try {
        const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))

        return { ...data, locale: entry.name }
      } catch {
        return {
          locale: entry.name,
          flag: 'unknown',
          name: `${entry.name}, could not read data.json`
        }
      }
    })
  locales.unshift({
    locale: 'en',
    flag: 'us',
    name: 'English (US)'
  })
  return locales
}

Object.assign(window, read)
Object.assign(window, write)

window.isTranslated = (lang, type, entry) => {
  return fs.existsSync(path.resolve(window.workingDirectory, 'translations', lang, type, `${entry}.md`))
}
