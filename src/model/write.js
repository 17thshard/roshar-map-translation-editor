import fs from 'fs'
import paths from 'path'

export function saveMessages (lang, messages) {
  return fs.writeFileSync(
    paths.resolve(window.workingDirectory, 'src', 'lang', `${lang}.lang.json`),
    JSON.stringify(messages, undefined, 4)
  )
}

export function saveContent (lang, type, entry, content) {
  const path = paths.resolve(window.workingDirectory, 'translations', lang, type, `${entry}.md`)
  const text = type === 'events' ? buildEventFile(content) : buildFile(content)

  return fs.writeFileSync(path, text)
}

export function createLanguage (code, name, flag) {
  const langDirectory = paths.resolve(window.workingDirectory, 'translations', code)
  if (fs.existsSync(langDirectory)) {
    throw new Error('Language already exists!')
  }

  fs.mkdirSync(langDirectory, { recursive: true })
  fs.writeFileSync(paths.resolve(langDirectory, 'data.json'), JSON.stringify({ name, flag }, undefined, 4))
}

function buildEventFile (content) {
  const detailsText = content.details !== undefined
    ? `
## Details
${content.details.trim()}
`
    : ''

  return `# ${content.name}
${(content.blurb || '').trim()}
${detailsText}${buildMetadata(content.metadata)}`
}

function buildFile (content) {
  return `# ${content.name}

${(content.text || '').trim()}
${buildMetadata(content.metadata)}`
}

function buildMetadata (metadata) {
  const keys = Object.keys(metadata).filter(k => metadata[k] !== undefined)
  if (keys.length === 0) {
    return ''
  }

  return `
## Metadata
| Field | Value |
| ----- | ----- |
${keys.map(k => `| ${k} | ${metadata[k].trim()} |`)}
`
}
