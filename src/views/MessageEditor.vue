<template>
  <form class="message-editor">
    <label for="message-editor__path">Path</label>
    <input id="message-editor__path" type="text" :value="path" readonly>
    <label for="message-editor__text">
      Text
      <button v-if="locale !== 'en'" class="message-editor__action" type="button" @click="$emit('input', { path, value: reference })">
        Copy Original
      </button>
      <template v-if="dirty">
        <span v-if="locale !== 'en'" class="message-editor__action-separator">◆</span>

        <button
          class="message-editor__action"
          type="button"
          @click.prevent.stop="$emit('input', { path, value: originalTranslation })"
        >
          Reset
        </button>
      </template>
    </label>
    <input
      v-if="comment.markdown === undefined"
      id="message-editor__text"
      type="text"
      :value="translation"
      :placeholder="locale !== 'en' ? reference : ''"
      :dir="textDirection"
      @input="$emit('input', { path, value: $event.target.value })"
    >
    <MarkdownEditor
      v-else
      id="event-editor__text"
      :key="`${locale}-${path}-text`"
      :value="translation"
      :direction="textDirection"
      :inline="comment.markdown === 'inline'"
      @input="$emit('input', { path, value: $event })"
    />
    <template v-if="comment.context !== undefined">
      <span class="message-editor__label">Context</span>
      <Markdown class="message-editor__context" :content="comment.context" />
    </template>
    <template v-if="comment.variables !== undefined">
      <span class="message-editor__label">Variables</span>
      <table class="message-editor__variables">
        <tr v-for="(value, key) in comment.variables" :key="`${key}-row`">
          <td class="message-editor__variables-name">
            {{ `{${key}\}` }}
          </td>
          <Markdown class="message-editor__variables-value" tag="td" :content="value" inline />
        </tr>
      </table>
    </template>
  </form>
</template>

<script>
import Markdown from '@/components/Markdown.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'

function getFromObject (object, path) {
  return (path === '' ? [] : path.split('.')).reduce((acc, key) => acc[key] ?? {}, object)
}

export default {
  name: 'MessageEditor',
  components: { MarkdownEditor, Markdown },
  props: {
    localeMessages: {
      type: [Object, Array],
      required: true
    },
    originalLocaleMessages: {
      type: [Object, Array],
      required: true
    }
  },
  computed: {
    locale () {
      return this.$route.params.locale
    },
    basePath () {
      return this.$route.query.basePath ?? ''
    },
    path () {
      const param = this.$route.params.path
      return this.basePath === '' ? param : `${this.basePath}.${param}`
    },
    comment () {
      return this.$store.state.messageComments[this.path] ?? {}
    },
    textDirection () {
      return window.getTextDirection(this.locale)
    },
    reference () {
      const enhancedMessages = this.locale === 'en'
        ? this.$store.state.referenceMessages
        : {
          meta: {
            translator: {
              url: 'https://example.com',
              name: 'Translator',
              logo: 'logo.png'
            }
          },
          ...this.$store.state.referenceMessages
        }

      return getFromObject(enhancedMessages, this.path) ?? ''
    },
    translation () {
      const translation = getFromObject(this.localeMessages, this.$route.params.path)

      return typeof translation === 'string' ? translation : ''
    },
    originalTranslation () {
      const translation = getFromObject(this.originalLocaleMessages, this.$route.params.path)

      return typeof translation === 'string' ? translation : ''
    },
    dirty () {
      return this.translation !== this.originalTranslation
    }
  }
}
</script>

<style lang="scss">
.message-editor {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;

  label, &__label {
    display: flex;
    align-items: baseline;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 0.125rem;
    margin-left: 0.25rem;
  }

  input[type=text], textarea, .markdown-editor {
    margin-bottom: 0.5rem;
  }

  &__context {
    font-family: inherit;
    margin-bottom: 0.5rem;
    padding-left: 0.25rem;

    p:first-child {
      margin-top: 0;
    }

    p:last-child {
      margin-bottom: 0;
    }
  }

  &__action {
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    color: #0f3562;
    text-transform: uppercase;
    padding: 0;
    margin-left: 0.25rem;
    font-size: 0.8em;

    &:hover, &:active, &:focus {
      color: #19559a;
    }

    &-separator {
      font-size: 0.7em;
      margin-left: 0.25rem;
      align-self: center;
    }
  }

  &__variables {
    width: 100%;

    &-name {
      font-family: monospace;
      font-size: 14px;
    }

    &-value {
      font-family: inherit;
    }
  }
}
</style>
