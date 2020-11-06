import CodeMirror from 'codemirror'

CodeMirror.defineMode('markdown', function (cmCfg, modeCfg) {
  function getMode (name) {
    if (CodeMirror.findModeByName) {
      const found = CodeMirror.findModeByName(name)
      if (found) {
        name = found.mime || found.mimes[0]
      }
    }
    const mode = CodeMirror.getMode(cmCfg, name)
    return mode.name === 'null' ? null : mode
  }

  // Should characters that affect highlighting be highlighted separate?
  // Does not include characters that will be output (such as `1.` and `-` for lists)
  if (modeCfg.highlightFormatting === undefined) {
    modeCfg.highlightFormatting = false
  }

  // Maximum number of nested blockquotes. Set to 0 for infinite nesting.
  // Excess `>` will emit `error` token.
  if (modeCfg.maxBlockquoteDepth === undefined) {
    modeCfg.maxBlockquoteDepth = 0
  }

  // Turn on strikethrough syntax
  if (modeCfg.strikethrough === undefined) {
    modeCfg.strikethrough = false
  }

  if (modeCfg.fencedCodeBlockHighlighting === undefined) {
    modeCfg.fencedCodeBlockHighlighting = true
  }

  if (modeCfg.fencedCodeBlockDefaultMode === undefined) {
    modeCfg.fencedCodeBlockDefaultMode = 'markdown'
  }

  if (modeCfg.xml === undefined) {
    modeCfg.xml = true
  }

  // Allow token types to be overridden by user-provided token types.
  if (modeCfg.tokenTypeOverrides === undefined) {
    modeCfg.tokenTypeOverrides = {}
  }

  const tokenTypes = {
    code: 'comment',
    quote: 'quote',
    internalLinkMarker: 'internal-link-marker',
    formatting: 'formatting',
    linkEmail: 'link',
    linkText: 'link',
    linkHref: 'string',
    internalLinkHref: 'string',
    em: 'em',
    strong: 'strong',
    strikethrough: 'strikethrough',
    smallCaps: 'small-caps',
    inlineTranslatorNote: 'inline-tn'
  }

  for (const tokenType in tokenTypes) {
    if (Object.keys(tokenTypes).includes(tokenType) && modeCfg.tokenTypeOverrides[tokenType]) {
      tokenTypes[tokenType] = modeCfg.tokenTypeOverrides[tokenType]
    }
  }

  const textRE = /^[^#![\]*_\\<> "'()~:^]+/
  const fencedCodeRE = /^(~~~+|```+)[ \t]*tn[^\n`]*$/
  const punctuation = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/

  function switchInline (stream, state, f) {
    state.f = state.inline = f
    return f(stream, state)
  }

  // Blocks

  function blankLine (state) {
    // Reset linkTitle state
    state.linkHref = false
    state.linkText = false
    state.internalLinkHref = false
    // Reset EM state
    state.em = false
    // Reset STRONG state
    state.strong = false
    // Reset strikethrough state
    state.strikethrough = false
    state.smallCaps = false
    state.inlineTranslatorNote = false
    // Reset state.quote
    state.quote = 0
    // Reset state.trailingSpace
    state.trailingSpace = 0
    state.trailingSpaceNewLine = false
    // Mark this line as blank
    state.prevLine = state.thisLine
    state.thisLine = { stream: null }
    return null
  }

  function blockNormal (stream, state) {
    const firstTokenOnLine = stream.column() === state.indentation

    let match = null
    if (stream.eatSpace()) {
      return null
    }
    if (stream.eat('>')) {
      state.quote = firstTokenOnLine ? 1 : state.quote + 1
      if (modeCfg.highlightFormatting) {
        state.formatting = 'quote'
      }
      stream.eatSpace()
      return getType(state)
    } else if (firstTokenOnLine && (match = stream.match(fencedCodeRE, true))) {
      state.quote = 0
      state.fencedEndRE = new RegExp(match[1] + '+ *$')
      // try switching mode
      state.localMode = modeCfg.fencedCodeBlockHighlighting && getMode(modeCfg.fencedCodeBlockDefaultMode)
      if (state.localMode) {
        state.localState = CodeMirror.startState(state.localMode)
      }
      state.f = state.block = local
      if (modeCfg.highlightFormatting) {
        state.formatting = 'code-block'
      }
      state.code = -1
      return getType(state)
      // SETEXT has lowest block-scope precedence after HR, so check it after
      //  the others (code, blockquote, list...)
    }

    return switchInline(stream, state, state.inline)
  }

  function local (stream, state) {
    const maxFencedEndInd = 3
    if (state.fencedEndRE && state.indentation <= maxFencedEndInd && stream.match(state.fencedEndRE)) {
      if (modeCfg.highlightFormatting) {
        state.formatting = 'code-block'
      }
      const returnType = getType(state)
      state.localMode = state.localState = null
      state.block = blockNormal
      state.f = inlineNormal
      state.fencedEndRE = null
      state.code = 0
      state.thisLine.fencedCodeEnd = true
      return returnType
    } else if (state.localMode) {
      return state.localMode.token(stream, state.localState)
    } else {
      stream.skipToEnd()
      return tokenTypes.code
    }
  }

  // Inline
  function getType (state) {
    const styles = []

    if (state.formatting) {
      styles.push(tokenTypes.formatting)

      if (typeof state.formatting === 'string') {
        state.formatting = [state.formatting]
      }

      for (let i = 0; i < state.formatting.length; i++) {
        styles.push(tokenTypes.formatting + '-' + state.formatting[i])

        // Add `formatting-quote` and `formatting-quote-#` for blockquotes
        // Add `error` instead if the maximum blockquote nesting depth is passed
        if (state.formatting[i] === 'quote') {
          if (!modeCfg.maxBlockquoteDepth || modeCfg.maxBlockquoteDepth >= state.quote) {
            styles.push(tokenTypes.formatting + '-' + state.formatting[i] + '-' + state.quote)
          } else {
            styles.push('error')
          }
        }
      }
    }

    if (state.linkHref) {
      styles.push(tokenTypes.linkHref, 'url')
    } else if (state.internalLinkHref) {
      styles.push(tokenTypes.linkHref, 'url', 'url-internal')
    } else { // Only apply inline styles to non-url text
      if (state.strong) {
        styles.push(tokenTypes.strong)
      }
      if (state.em) {
        styles.push(tokenTypes.em)
      }
      if (state.strikethrough) {
        styles.push(tokenTypes.strikethrough)
      }
      if (state.linkText) {
        styles.push(tokenTypes.linkText)
      }
      if (state.code) {
        styles.push(tokenTypes.code)
      }
      if (state.internalLinkMarker) {
        styles.push(tokenTypes.internalLinkMarker)
      }
      if (state.smallCaps) {
        styles.push(tokenTypes.smallCaps)
      }
      if (state.inlineTranslatorNote) {
        styles.push(tokenTypes.inlineTranslatorNote)
      }
    }

    if (state.quote) {
      styles.push(tokenTypes.quote)

      // Add `quote-#` where the maximum for `#` is modeCfg.maxBlockquoteDepth
      if (!modeCfg.maxBlockquoteDepth || modeCfg.maxBlockquoteDepth >= state.quote) {
        styles.push(tokenTypes.quote + '-' + state.quote)
      } else {
        styles.push(tokenTypes.quote + '-' + modeCfg.maxBlockquoteDepth)
      }
    }

    if (state.trailingSpaceNewLine) {
      styles.push('trailing-space-new-line')
    } else if (state.trailingSpace) {
      styles.push('trailing-space-' + (state.trailingSpace % 2 ? 'a' : 'b'))
    }

    return styles.length ? styles.join(' ') : null
  }

  function handleText (stream, state) {
    if (stream.match(textRE, true)) {
      return getType(state)
    }
    return undefined
  }

  function inlineNormal (stream, state) {
    let t
    let type
    const style = state.text(stream, state)
    if (typeof style !== 'undefined') {
      return style
    }

    const ch = stream.next()

    if (ch === '\\') {
      stream.next()
      if (modeCfg.highlightFormatting) {
        type = getType(state)
        const formattingEscape = tokenTypes.formatting + '-escape'
        return type ? type + ' ' + formattingEscape : formattingEscape
      }
    }

    if (ch === '_' && stream.match(/\[tn]\(/, true)) {
      state.inlineTranslatorNote = true
      return getType(state)
    } else if (state.inlineTranslatorNote && ch === ')' && stream.peek() === '_') {
      const t = getType(state)
      stream.eat('_')
      state.inlineTranslatorNote = false
      return t
    }

    if (ch === '#' && stream.match(/\[[^\]]*\] ?(?:\(|\[)/, false)) {
      state.internalLinkMarker = true
      state.internalLink = true
      return getType(state)
    }

    if (ch === '[' && state.internalLinkMarker && stream.match(/[^\]]*\](\(.*?\)| ?\[.*?\])/, false)) {
      state.internalLinkMarker = false
      state.linkText = true
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link'
      }
      return getType(state)
    }

    if (ch === ']' && state.internalLink && state.linkText) {
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link'
      }
      type = getType(state)
      state.linkText = false
      state.internalLink = false
      state.inline = state.f = stream.match(/\(.*?\)| ?\[.*?\]/, false) ? internalLinkHref : inlineNormal
      return type
    }

    if (ch === '[' && !state.internalLink) {
      if (state.linkText && stream.match(/^.*?\]/)) {
        return getType(state)
      }
      state.linkText = true
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link'
      }
      return getType(state)
    }

    if (ch === ']' && state.linkText) {
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link'
      }
      type = getType(state)
      state.linkText = false
      state.inline = state.f = stream.match(/\(.*?\)| ?\[.*?\]/, false) ? linkHref : inlineNormal
      return type
    }

    if (ch === '*' || ch === '_' || ch === '^') {
      let len = 1; const before = stream.pos === 1 ? ' ' : stream.string.charAt(stream.pos - 2)
      while (len < 3 && stream.eat(ch)) { len++ }
      const after = stream.peek() || ' '
      // See http://spec.commonmark.org/0.27/#emphasis-and-strong-emphasis
      const leftFlanking = !/\s/.test(after) && (!punctuation.test(after) || /\s/.test(before) || punctuation.test(before))
      const rightFlanking = !/\s/.test(before) && (!punctuation.test(before) || /\s/.test(after) || punctuation.test(after))
      let setEm = null
      let setStrong = null
      let setSmallCaps = null
      if (len % 2 && ch !== '^') { // Em
        if (!state.em && leftFlanking && (ch === '*' || !rightFlanking || punctuation.test(before))) {
          setEm = true
        } else if (state.em === ch && rightFlanking && (ch === '*' || !leftFlanking || punctuation.test(after))) {
          setEm = false
        }
      }
      if (len === 1 && ch === '^') { // Em
        if (!state.smallCaps && leftFlanking && (ch === '^' || !rightFlanking || punctuation.test(before))) {
          setSmallCaps = true
        } else if (state.smallCaps === ch && rightFlanking && (ch === '^' || !leftFlanking || punctuation.test(after))) {
          setSmallCaps = false
        }
      }
      if (len > 1 && ch !== '^') { // Strong
        if (!state.strong && leftFlanking && (ch === '*' || !rightFlanking || punctuation.test(before))) {
          setStrong = true
        } else if (state.strong === ch && rightFlanking && (ch === '*' || !leftFlanking || punctuation.test(after))) {
          setStrong = false
        }
      }
      if (setStrong !== null || setEm !== null || setSmallCaps !== null) {
        if (modeCfg.highlightFormatting) {
          state.formatting = setEm == null ? 'strong' : setStrong == null ? 'em' : 'strong em'
        }
        if (setEm === true) {
          state.em = ch
        }
        if (setStrong === true) {
          state.strong = ch
        }
        if (setSmallCaps === true) {
          state.smallCaps = ch
        }
        t = getType(state)
        if (setEm === false) {
          state.em = false
        }
        if (setStrong === false) {
          state.strong = false
        }
        if (setSmallCaps === false) {
          state.smallCaps = false
        }
        return t
      }
    } else if (ch === ' ') {
      if (stream.eat('*') || stream.eat('_')) { // Probably surrounded by spaces
        if (stream.peek() === ' ') { // Surrounded by spaces, ignore
          return getType(state)
        } else { // Not surrounded by spaces, back up pointer
          stream.backUp(1)
        }
      }
    }

    if (modeCfg.strikethrough) {
      if (ch === '~' && stream.eatWhile(ch)) {
        if (state.strikethrough) { // Remove strikethrough
          if (modeCfg.highlightFormatting) {
            state.formatting = 'strikethrough'
          }
          t = getType(state)
          state.strikethrough = false
          return t
        } else if (stream.match(/^[^\s]/, false)) { // Add strikethrough
          state.strikethrough = true
          if (modeCfg.highlightFormatting) {
            state.formatting = 'strikethrough'
          }
          return getType(state)
        }
      } else if (ch === ' ') {
        if (stream.match(/^~~/, true)) { // Probably surrounded by space
          if (stream.peek() === ' ') { // Surrounded by spaces, ignore
            return getType(state)
          } else { // Not surrounded by spaces, back up pointer
            stream.backUp(2)
          }
        }
      }
    }

    if (ch === ' ') {
      if (stream.match(/^ +$/, false)) {
        state.trailingSpace++
      } else if (state.trailingSpace) {
        state.trailingSpaceNewLine = true
      }
    }

    return getType(state)
  }

  function linkHref (stream, state) {
    // Check if space, and return NULL if so (to avoid marking the space)
    if (stream.eatSpace()) {
      return null
    }
    const ch = stream.next()
    if (ch === '(' || ch === '[') {
      state.f = state.inline = getLinkHrefInside(ch === '(' ? ')' : ']')
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link-string'
      }
      state.linkHref = true
      return getType(state)
    }
    return 'error'
  }

  function internalLinkHref (stream, state) {
    // Check if space, and return NULL if so (to avoid marking the space)
    if (stream.eatSpace()) {
      return null
    }
    const ch = stream.next()
    if (ch === '(' || ch === '[') {
      state.f = state.inline = getInternalLinkHrefInside(ch === '(' ? ')' : ']')
      if (modeCfg.highlightFormatting) {
        state.formatting = 'link-string'
      }
      state.internalLinkHref = true
      return getType(state)
    }
    return 'error'
  }

  const linkRE = {
    ')': /^(?:[^\\()]|\\.|\((?:[^\\()]|\\.)*\))*?(?=\))/,
    ']': /^(?:[^\\[\]]|\\.|\[(?:[^\\[\]]|\\.)*\])*?(?=\])/
  }

  function getLinkHrefInside (endChar) {
    return function (stream, state) {
      const ch = stream.next()

      if (ch === endChar) {
        state.f = state.inline = inlineNormal
        if (modeCfg.highlightFormatting) {
          state.formatting = 'link-string'
        }
        const returnState = getType(state)
        state.linkHref = false
        return returnState
      }

      stream.match(linkRE[endChar])
      state.linkHref = true
      return getType(state)
    }
  }

  function getInternalLinkHrefInside (endChar) {
    return function (stream, state) {
      const ch = stream.next()

      if (ch === endChar) {
        state.f = state.inline = inlineNormal
        if (modeCfg.highlightFormatting) {
          state.formatting = 'link-string'
        }
        const returnState = getType(state)
        state.internalLinkHref = false
        return returnState
      }

      stream.match(linkRE[endChar])
      state.internalLinkHref = true
      return getType(state)
    }
  }

  const mode = {
    startState () {
      return {
        f: blockNormal,

        prevLine: { stream: null },
        thisLine: { stream: null },

        block: blockNormal,
        htmlState: null,
        indentation: 0,

        inline: inlineNormal,
        text: handleText,

        formatting: false,
        linkText: false,
        linkHref: false,
        internalLinkHref: false,
        code: 0,
        em: false,
        strong: false,
        quote: 0,
        trailingSpace: 0,
        trailingSpaceNewLine: false,
        strikethrough: false,
        fencedEndRE: null,
        smallCaps: false
      }
    },

    copyState (s) {
      return {
        f: s.f,

        prevLine: s.prevLine,
        thisLine: s.thisLine,

        block: s.block,
        indentation: s.indentation,

        localMode: s.localMode,
        localState: s.localMode ? CodeMirror.copyState(s.localMode, s.localState) : null,

        inline: s.inline,
        text: s.text,
        formatting: false,
        linkText: s.linkText,
        linkHref: s.linkHref,
        internalLinkHref: s.internalLinkHref,
        code: s.code,
        em: s.em,
        strong: s.strong,
        smallCaps: s.smallCaps,
        strikethrough: s.strikethrough,
        quote: s.quote,
        indentedCode: s.indentedCode,
        trailingSpace: s.trailingSpace,
        trailingSpaceNewLine: s.trailingSpaceNewLine,
        md_inside: s.md_inside,
        fencedEndRE: s.fencedEndRE
      }
    },

    token (stream, state) {
      // Reset state.formatting
      state.formatting = false

      if (stream !== state.thisLine.stream) {
        if (stream.match(/^\s*$/, true)) {
          blankLine(state)
          return null
        }

        state.prevLine = state.thisLine
        state.thisLine = { stream }

        // Reset state.trailingSpace
        state.trailingSpace = 0
        state.trailingSpaceNewLine = false

        if (!state.localState) {
          state.f = state.block
        }
      }
      return state.f(stream, state)
    },

    innerMode (state) {
      if (state.localState) {
        return { state: state.localState, mode: state.localMode }
      }
      return { state, mode }
    },

    indent (state, textAfter, line) {
      if (state.localState && state.localMode.indent) {
        return state.localMode.indent(state.localState, textAfter, line)
      }
      return CodeMirror.Pass
    },

    blankLine,

    getType,

    blockCommentStart: '<!--',
    blockCommentEnd: '-->',
    closeBrackets: '()[]{}\'\'""``',
    fold: 'markdown'
  }

  return mode
})

CodeMirror.defineMIME('text/markdown', 'markdown')

CodeMirror.defineMIME('text/x-markdown', 'markdown')
