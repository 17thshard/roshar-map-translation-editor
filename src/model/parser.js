import markdown from 'simple-markdown'

const LINK_INSIDE = '(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*'
const LINK_HREF_AND_TITLE = '\\s*<?((?:\\([^)]*\\)|[^\\s\\\\]|\\\\.)*?)>?(?:\\s+[\'"]([\\s\\S]*?)[\'"])?\\s*'

const rules = {
  paragraph: markdown.defaultRules.paragraph,
  blockQuote: markdown.defaultRules.blockQuote,
  newline: markdown.defaultRules.newline,
  escape: markdown.defaultRules.escape,
  inlineTranslatorNote: {
    order: markdown.defaultRules.em.order - 1,
    match: markdown.inlineRegex(/^_\[tn]\(((?:\\[\s\S]|[^\\])+?)\)_/),
    parse (capture, parse, state) {
      return {
        content: parse(capture[1], state)
      }
    }
  },
  translatorNote: {
    order: markdown.defaultRules.paragraph.order - 1,
    match: markdown.blockRegex(/^ *(`{3,}|~{3,}) *tn *\n([\s\S]+?)\n?\1 *(?:\n *)+\n/),
    parse (capture, parse, state) {
      return {
        content: markdown.parseBlock(parse, capture[2], state)
      }
    }
  },
  em: markdown.defaultRules.em,
  strong: markdown.defaultRules.strong,
  u: markdown.defaultRules.u,
  smallCaps: {
    order: markdown.defaultRules.em.order,
    match: markdown.inlineRegex(/^\^((?:\\[\s\S]|[^\\])+?)\^/),
    parse (capture, parse, state) {
      return {
        content: parse(capture[1], state)
      }
    }
  },
  internalLink: {
    order: markdown.defaultRules.link.order - 1,
    match: markdown.inlineRegex(new RegExp(
      '^#\\[(' + LINK_INSIDE + ')\\]\\(' + LINK_HREF_AND_TITLE + '\\)'
    )),
    parse (capture, parse, state) {
      return {
        content: parse(capture[1], state),
        target: markdown.unescapeUrl(capture[2]),
        title: capture[3]
      }
    }
  },
  link: markdown.defaultRules.link,
  br: markdown.defaultRules.br,
  text: markdown.defaultRules.text
}

export default markdown.parserFor(rules)
