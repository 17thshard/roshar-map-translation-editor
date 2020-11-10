import fs from 'fs'
import paths from 'path'

export function loadReference () {
  function load (type) {
    return fs.readdirSync(paths.resolve(window.workingDirectory, 'translations', 'en', type), { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith('.md'))
      .map(e => e.name.substring(0, e.name.length - 3))
  }

  return {
    events: load('events'),
    locations: load('locations'),
    characters: load('characters'),
    misc: load('misc')
  }
}

export function loadReferenceMessages () {
  return loadMessages('en')
}

export function loadMessages (lang) {
  const path = paths.resolve(window.workingDirectory, 'src', 'lang', `${lang}.lang.json`)
  if (!fs.existsSync(path)) {
    return {}
  }
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

export function loadMessageComments () {
  const data = JSON.parse(fs.readFileSync(paths.resolve(window.workingDirectory, 'translation-comments.json'), 'utf8'))

  Object.keys(data).forEach((key) => {
    const entry = data[key]
    if (typeof entry === 'object') {
      return
    }

    data[key] = { name: entry }
  })

  return data
}

export function getTitle (lang, type, entry) {
  const path = paths.resolve(window.workingDirectory, 'translations', lang, type, `${entry}.md`)
  if (!fs.existsSync(path)) {
    return lang === 'en' ? null : getTitle('en', type, entry)
  }

  return parseSections(fs.readFileSync(path, 'utf8')).root.name
}

export function getContent (lang, type, entry) {
  const path = paths.resolve(window.workingDirectory, 'translations', lang, type, `${entry}.md`)
  if (!fs.existsSync(path)) {
    return null
  }

  return parseSections(fs.readFileSync(path, 'utf8'))
}

function parseSections (content, ignoreOutsideOfSections) {
  let root
  const sections = {}
  const lines = content.split('\n')

  let currentSection
  lines.forEach((line) => {
    const headerMatch = line.trim().match(/^(#+)\s+(.*?)$/)
    if (headerMatch != null) {
      const [, hashes, name] = headerMatch

      if (hashes.length === 1) {
        currentSection = { name: name.trim(), content: '' }

        root = currentSection
      } else {
        currentSection = { content: '' }
        sections[name.toLowerCase().trim()] = currentSection
      }

      return
    }

    if (currentSection === undefined && ignoreOutsideOfSections === true) {
      return
    } else if (currentSection === undefined) {
      throw new Error('Line found outside of section, you might have forgotten the title starting with "#"')
    }

    currentSection.content += line + '\n'
  })

  if (root !== undefined) {
    root.content = root.content.trim()
  }

  Object.keys(sections).forEach((key) => {
    sections[key].content = sections[key].content.trim()
  })

  const metadata = {}
  if (sections.metadata) {
    sections.metadata.content.split('\n').filter(line => line.trim().startsWith('|')).slice(2).forEach((line) => {
      const match = line.trim().match(/^\|([^|]+)\|([^|]+)\|$/)

      if (match !== null) {
        metadata[match[1].trim()] = match[2].trim()
      }
    })
  }

  return { root, sections, metadata }
}
