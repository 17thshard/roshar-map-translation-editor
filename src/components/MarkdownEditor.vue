<template>
  <div :class="['markdown-editor', { 'markdown-editor--preview': preview }]">
    <div class="markdown-editor__toolbar">
      <div class="markdown-editor__toolbar-group">
        <button type="button" title="Undo" class="markdown-editor__toolbar-button" :disabled="preview" @click="command('undo')">
          <RotateCcwIcon size="1x" :stroke-width="3" />
        </button>
        <button type="button" title="Redo" class="markdown-editor__toolbar-button" :disabled="preview" @click="command('redo')">
          <RotateCwIcon size="1x" :stroke-width="3" />
        </button>
      </div>
      <div class="markdown-editor__toolbar-group">
        <button type="button" title="Bold" class="markdown-editor__toolbar-button" :disabled="preview" @click="command('bold')">
          <BoldIcon size="1x" :stroke-width="3" />
        </button>
        <button type="button" title="Italic" class="markdown-editor__toolbar-button" :disabled="preview" @click="command('italic')">
          <ItalicIcon size="1x" :stroke-width="3" />
        </button>
        <button type="button" title="Small Caps" class="markdown-editor__toolbar-button" :disabled="preview" @click="command('small-caps')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-small-caps"
          >
            <g transform="translate(-3, 0)">
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </g>
            <g transform="scale(0.6) translate(17, 14)">
              <polyline points="4 7 4 4 20 4 20 7" />
              <line x1="9" y1="20" x2="15" y2="20" />
              <line x1="12" y1="4" x2="12" y2="20" />
            </g>
          </svg>
        </button>
      </div>
      <div class="markdown-editor__toolbar-group">
        <button type="button" title="Insert link" class="markdown-editor__toolbar-button" :disabled="preview" @click="command('link')">
          <LinkIcon size="1x" :stroke-width="3" />
        </button>
        <button
          type="button"
          title="Insert inline translator's note"
          class="markdown-editor__toolbar-button"
          :disabled="preview"
          @click="command('inline-tn')"
        >
          <BookmarkIcon size="1x" :stroke-width="3" />
        </button>
      </div>
      <div v-if="!inline" class="markdown-editor__toolbar-group">
        <button type="button" title="Add quote" class="markdown-editor__toolbar-button" :disabled="preview" @click="command('quote')">
          <ChevronRightIcon size="1x" :stroke-width="3" />
        </button>
        <button
          type="button"
          title="Add block translator's note"
          class="markdown-editor__toolbar-button"
          :disabled="preview"
          @click="command('translator-note')"
        >
          <CodeIcon size="1x" :stroke-width="3" />
        </button>
      </div>
      <div class="markdown-editor__toolbar-group">
        <button type="button" title="Toggle Preview" class="markdown-editor__toolbar-button" @click="command('preview')">
          <EyeIcon v-if="!preview" size="1x" :stroke-width="3" />
          <EyeOffIcon v-else size="1x" :stroke-width="3" />
        </button>
      </div>
    </div>
    <div class="markdown-editor__content">
      <textarea :id="id" ref="textarea" :placeholder="placeholder" />
      <Markdown
        v-if="preview"
        :class="['markdown-editor__preview', { 'markdown-editor__preview--inline': inline }]"
        :content="value"
        :inline="inline"
      />
    </div>
  </div>
</template>

<script>
import {
  BoldIcon,
  BookmarkIcon,
  ChevronRightIcon,
  CodeIcon,
  EyeIcon,
  EyeOffIcon,
  ItalicIcon,
  LinkIcon,
  RotateCcwIcon,
  RotateCwIcon
} from 'vue-feather-icons'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/display/placeholder'
import 'codemirror/addon/lint/lint'
import '@/components/editor-mode'
import Markdown from '@/components/Markdown.vue'

CodeMirror.registerHelper('lint', 'markdown', function (text, opts, editor) {
  const found = []
  for (let line = 0; line < editor.lineCount(); line++) {
    editor.getLineTokens(line)
      .filter(token => token.type !== null && token.type.includes('url-internal') && token.state.internalLinkHref && token.string !== '(')
      .forEach((token) => {
        const [type, entry] = token.string.split('/', 2)
        if (!window.isTranslated('en', type, entry)) {
          found.push({ from: CodeMirror.Pos(line, token.start), to: CodeMirror.Pos(line, token.end), message: 'Unknown entry' })
        }
      })
  }
  return found
})

function beforeChange (cm, event) {
  // Identify typing events that add a newline to the buffer.
  const hasTypedNewline = (
    event.origin === '+input' &&
    typeof event.text === 'object' &&
    event.text.join('') === '')

  // Prevent newline characters from being added to the buffer.
  if (hasTypedNewline) {
    return event.cancel()
  }

  // Identify paste events.
  const hasPastedNewline = (
    event.origin === 'paste' &&
    typeof event.text === 'object' &&
    event.text.length > 1)

  // Format pasted text to replace newlines with spaces.
  if (hasPastedNewline) {
    const newText = event.text.join(' ')
    return event.update(null, null, [newText])
  }

  return null
}

CodeMirror.defineOption('noNewlines', false, function (cm, val, old) {
  // Handle attaching/detaching event listners as necessary.
  if (val === true && old !== true) {
    cm.on('beforeChange', beforeChange)
  } else if (val === false && old === true) {
    cm.off('beforeChange', beforeChange)
  }
})

export default {
  name: 'MarkdownEditor',
  components: {
    Markdown,
    RotateCcwIcon,
    RotateCwIcon,
    ItalicIcon,
    BoldIcon,
    EyeIcon,
    EyeOffIcon,
    LinkIcon,
    CodeIcon,
    ChevronRightIcon,
    BookmarkIcon
  },
  props: {
    id: {
      type: String,
      default: () => {
        return 'markdown-editor-' + Math.random().toString(16).substr(2, 9)
      }
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: '',
      required: false
    },
    options: {
      type: Object,
      default () {
        return {
          lineWrapping: true
        }
      }
    },
    inline: {
      type: Boolean
    }
  },
  data () {
    return {
      editor: null,
      preview: false,
      fullScreen: false,
      html: '',
      toolbars: []
    }
  },
  watch: {
    value (val) {
      if (val !== this.editor.getValue()) {
        this.editor.setValue(val ?? '')
      }
    }
  },
  mounted () {
    this.build()
  },
  methods: {
    isEmpty (s) {
      return s === null || s === undefined ? true : /^[\s\xA0]*$/.test(s)
    },
    isUrl (s) {
      return this.isEmpty(s) ? false : s.match(/((http(s)?):\/\/[\w./\-=?#]+)/gi)
    },
    format () {
      let a = arguments[0]
      for (let i = 1; i <= arguments.length; i++) {
        a = a.replace(/%[a-z]/, arguments[i])
      }
      return a // Make chainable
    },
    _toggleBlock (type, start, end) {
      end = this.isEmpty(end) ? start : end
      const ed = this.editor
      const startPoint = ed.getCursor('start')
      const endPoint = ed.getCursor('end')
      let text
      const stat = this.state()
      if (stat[type]) {
        text = ed.getLine(startPoint.line)
        start = text.slice(0, startPoint.ch)
        end = text.slice(startPoint.ch)
        if (type === 'bold') {
          start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, '')
          end = end.replace(/(\*\*|__)/, '')
        } else if (type === 'italic') {
          start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, '')
          end = end.replace(/(\*|_)/, '')
        } else if (type === 'strikethrough') {
          start = start.replace(/(\*\*|~~)(?![\s\S]*(\*\*|~~))/, '')
          end = end.replace(/(\*\*|~~)/, '')
        }
        ed.replaceRange(start + end, {
          line: startPoint.line,
          ch: 0
        }, {
          line: startPoint.line,
          ch: 99999999999999
        })
        if (type === 'bold' || type === 'strikethrough') {
          startPoint.ch -= 2
          if (startPoint !== endPoint) {
            endPoint.ch -= 2
          }
        } else if (type === 'italic') {
          startPoint.ch -= 1
          if (startPoint !== endPoint) {
            endPoint.ch -= 1
          }
        }
      } else {
        text = ed.getSelection()
        if (type === 'bold') {
          text = text.split('**').join('')
          text = text.split('__').join('')
        } else if (type === 'italic') {
          text = text.split('*').join('')
          text = text.split('_').join('')
        } else if (type === 'strikethrough') {
          text = text.split('~~').join('')
        }
        ed.replaceSelection(start + text + end)
        startPoint.ch += start.length
        endPoint.ch = startPoint.ch + text.length
      }
      ed.setSelection(startPoint, endPoint)
    },
    _toggleLine (name) {
      const ed = this.editor
      const stat = this.state()
      const startPoint = ed.getCursor('start')
      const endPoint = ed.getCursor('end')
      const repl = {
        quote: /^(\s*)>\s+/
      }
      const map = {
        quote: '> '
      }
      for (let i = startPoint.line; i <= endPoint.line; i++) {
        (function (i) {
          let text = ed.getLine(i)
          if (stat[name]) {
            text = text.replace(repl[name], '$1')
          } else {
            text = map[name] + text
          }
          ed.replaceRange(text, {
            line: i, ch: 0
          }, {
            line: i, ch: 99999999999999
          })
        })(i)
      }
    },
    _insertTranslatorNote () {
      const ed = this.editor
      const startPoint = ed.getCursor('start')

      ed.replaceRange('\n```tn\n\n```', CodeMirror.Pos(startPoint.line))
      ed.setSelection(CodeMirror.Pos(startPoint.line + 2), CodeMirror.Pos(startPoint.line + 2))
    },
    state (pos) {
      pos = pos || this.editor.getCursor('start')
      const stat = this.editor.getTokenAt(pos)
      if (!stat.type) {
        return {}
      }
      const types = stat.type.split(' ')
      const ret = {}
      let data
      let text
      for (let i = 0; i < types.length; i++) {
        data = types[i]
        if (data === 'strong') {
          ret.bold = true
        } else if (data === 'variable-2') {
          text = this.editor.getLine(pos.line)
          if (/^\s*\d+\.\s/.test(text)) {
            ret.numlist = true
          } else {
            ret.bullist = true
          }
        } else if (data === 'atom') {
          ret.quote = true
        } else if (data === 'em') {
          ret.italic = true
        } else if (data === 'quote') {
          ret.quote = true
        } else if (data === 'strikethrough') {
          ret.strikethrough = true
        } else if (data === 'link' || data === 'url') {
          ret.link = true
        } else if (data === 'small-caps') {
          ret.smallCaps = true
        } else if (data === 'inline-tn') {
          ret.inlineTranslatorNote = true
        }
      }
      return ret
    },
    _replaceSelection (active, startEnd, val) {
      const ed = this.editor
      let text
      let start = startEnd[0]
      let end = startEnd[1]
      const startPoint = ed.getCursor('start')
      const endPoint = ed.getCursor('end')
      if (val) {
        Object.keys(val).forEach((key) => {
          start = start.replace('#' + key + '#', val[key])
          end = end.replace('#' + key + '#', val[key])
        })
      }
      if (active) {
        text = ed.getLine(startPoint.line)
        start = text.slice(0, startPoint.ch)
        end = text.slice(startPoint.ch)
        ed.replaceRange(start + end, { line: startPoint.line, ch: 0 })
      } else {
        ed.replaceSelection(start + end)
        startPoint.ch += start.length
        if (startPoint !== endPoint) {
          endPoint.ch += start.length
        }
      }
      ed.setSelection(startPoint, endPoint)
    },
    drawLink (obj) {
      const stat = this.state()
      this._replaceSelection(stat.link, ['[#title#]', '(#url# "#title#")'], obj)
    },
    command (key) {
      const ed = this.editor
      const text = ed.getSelection()
      this.$emit('command:' + key, this)
      let url, title
      switch (key) {
        case 'undo':
          ed.undo()
          break
        case 'redo':
          ed.redo()
          break
        case 'bold':
          this._toggleBlock('bold', '**')
          break
        case 'italic':
          this._toggleBlock('italic', '*')
          break
        case 'small-caps':
          this._toggleBlock('small-caps', '^')
          break
        case 'translator-note':
          this._insertTranslatorNote()
          break
        case 'inline-tn':
          this._toggleBlock('inline-tn', '_[tn](', ')_')
          break
        case 'link':
          url = prompt('Please enter link', 'https://')
          if (this.isUrl(url)) {
            title = !this.isEmpty(text) ? text : url
            this.drawLink({ title, url })
          }
          break
        case 'quote':
          this._toggleLine('quote')
          break
        case 'preview':
          this.preview = !this.preview
          break
        case 'clean':
          break
      }
      ed.focus()
    },
    build () {
      if (this.__rendered) {
        return
      }
      const shortcuts = {}
      const o = Object.assign({ mode: 'markdown', extraKeys: shortcuts, lint: true, noNewlines: this.inline === true }, this.options)
      const ed = this.editor = CodeMirror.fromTextArea(this.$refs.textarea, o)
      ed.setValue(this.value ?? '')
      ed.setSize(this.width, this.height)
      ed.on('change', (ed) => {
        const val = ed.getValue()
        this.$emit('change', val)
        this.$emit('input', val)
      })
      this.__rendered = true
    }
  },
  destroy () {
    this.editor.toTextArea()
  }
}
</script>

<style lang="scss">
.markdown-editor {
  max-width: 100%;

  &__toolbar {
    display: flex;
    background: #175199;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    overflow: hidden;

    &-group {
      display: flex;
      align-items: stretch;
      border-right: 1px solid rgba(0, 0, 0, 0.5);

      &:last-child {
        border-right: none;
      }
    }

    &-button {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      appearance: none;
      outline: none;
      box-sizing: border-box;
      border: none;
      background: none;
      color: #f6f7fc;
      text-transform: uppercase;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;

      &:hover, &:active, &:focus {
        background: lighten(#175199, 10%);
      }

      &:disabled {
        background: darken(#175199, 10%);
        cursor: not-allowed;
      }
    }
  }

  &__content {
    position: relative;
  }

  &__preview {
    display: none;
    background: #f5ecda;
    padding: 1rem 3rem;
    overflow: auto;
    color: #242629;
    box-sizing: border-box;
    height: auto !important;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    text-align: justify;
    line-height: 1.9;
    border: 1px solid #175199;
    border-top: none;

    &--inline {
      padding: 0.5rem 1rem;
    }
  }

  .CodeMirror {
    font-family: Whitney, sans-serif;
    color: #25364a;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    background: #e1e2e6;
    border: 1px solid #afb0b3;
    border-top: none;
    transition: border-color 0.2s ease-in-out;
    padding: 0.625rem;
    box-sizing: border-box;
    height: auto;

    &-focused {
      border-color: #175199;
    }
  }

  &--preview {
    .CodeMirror {
      display: none;
    }

    .markdown-editor__preview {
      display: block;
    }
  }

  .cm-s-default .cm-header {
    color: blue;
  }

  .cm-s-default .cm-quote {
    color: #39860f;
  }

  .cm-negative {
    color: #d44;
  }

  .cm-positive {
    color: #292;
  }

  .cm-small-caps {
    font-variant: small-caps;
  }

  .cm-header, .cm-strong {
    font-weight: bold;
  }

  .cm-em {
    font-style: italic;
  }

  .cm-link {
    text-decoration: underline;
  }

  .cm-strikethrough {
    text-decoration: line-through;
  }

  .cm-s-default .cm-keyword {
    color: #708;
  }

  .cm-s-default .cm-atom {
    color: #219;
  }

  .cm-s-default .cm-number {
    color: #164;
  }

  .cm-s-default .cm-def {
    color: #00f;
  }

  .cm-s-default .cm-variable-2 {
    color: #05a;
  }

  .cm-s-default .cm-variable-3, .cm-s-default .cm-type {
    color: #085;
  }

  .cm-s-default .cm-comment, .cm-s-default .cm-inline-tn {
    color: #a50;
  }

  .cm-s-default .cm-string {
    color: #a11;
  }

  .cm-s-default .cm-string-2 {
    color: #f50;
  }

  .cm-s-default .cm-meta {
    color: #555;
  }

  .cm-s-default .cm-qualifier {
    color: #555;
  }

  .cm-s-default .cm-builtin {
    color: #30a;
  }

  .cm-s-default .cm-bracket {
    color: #997;
  }

  .cm-s-default .cm-tag {
    color: #170;
  }

  .cm-s-default .cm-attribute {
    color: #00c;
  }

  .cm-s-default .cm-hr {
    color: #999;
  }

  .cm-s-default .cm-link {
    color: #0f3562;
  }

  .cm-s-default .cm-url {
    color: #19559a;
  }

  .cm-s-default .cm-error {
    color: #f00;
  }

  .cm-invalidchar {
    color: #f00;
  }
}

.CodeMirror-lint {
  &-markers {
    width: 16px;
  }

  &-tooltip {
    background-color: #ffd;
    border: 1px solid black;
    border-radius: 4px 4px 4px 4px;
    color: black;
    font-family: monospace;
    font-size: 10pt;
    overflow: hidden;
    padding: 2px 5px;
    position: fixed;
    white-space: pre-wrap;
    z-index: 100;
    max-width: 600px;
    opacity: 0;
    transition: opacity .4s;
  }

  &-mark {
    background-position: left bottom;
    background-repeat: repeat-x;

    &-warning {
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sJFhQXEbhTg7YAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAMklEQVQI12NkgIIvJ3QXMjAwdDN+OaEbysDA4MPAwNDNwMCwiOHLCd1zX07o6kBVGQEAKBANtobskNMAAAAASUVORK5CYII=");
    }

    &-error {
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAHD855QAAAABmJLR0QAAAAAAAD5Q7t/AAAAG0lEQVQI12NgYGBgYDitxfAfQuAGMOnTWgz/AcSWB9Gtp/HUAAAAAElFTkSuQmCC");
    }
  }

  &-marker {
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
    display: inline-block;
    height: 16px;
    width: 16px;
    vertical-align: middle;
    position: relative;
  }

  &-message {
    padding-left: 18px;
    background-position: top left;
    background-repeat: no-repeat;

    &-multiple {
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAMAAADzjKfhAAAACVBMVEUAAAAAAAC/v7914kyHAAAAAXRSTlMAQObYZgAAACNJREFUeNo1ioEJAAAIwmz/H90iFFSGJgFMe3gaLZ0od+9/AQZ0ADosbYraAAAAAElFTkSuQmCC");
      background-repeat: no-repeat;
      background-position: right bottom;
      width: 100%;
      height: 100%;
    }
  }

  &-marker, &-message {
    &-warning {
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAANlBMVEX/uwDvrwD/uwD/uwD/uwD/uwD/uwD/uwD/uwD6twD/uwAAAADurwD2tQD7uAD+ugAAAAD/uwDhmeTRAAAADHRSTlMJ8mN1EYcbmiixgACm7WbuAAAAVklEQVR42n3PUQqAIBBFUU1LLc3u/jdbOJoW1P08DA9Gba8+YWJ6gNJoNYIBzAA2chBth5kLmG9YUoG0NHAUwFXwO9LuBQL1giCQb8gC9Oro2vp5rncCIY8L8uEx5ZkAAAAASUVORK5CYII=");
    }

    &-error {
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAHlBMVEW7AAC7AACxAAC7AAC7AAAAAAC4AAC5AAD///+7AAAUdclpAAAABnRSTlMXnORSiwCK0ZKSAAAATUlEQVR42mWPOQ7AQAgDuQLx/z8csYRmPRIFIwRGnosRrpamvkKi0FTIiMASR3hhKW+hAN6/tIWhu9PDWiTGNEkTtIOucA5Oyr9ckPgAWm0GPBog6v4AAAAASUVORK5CYII=");
    }
  }
}

</style>
