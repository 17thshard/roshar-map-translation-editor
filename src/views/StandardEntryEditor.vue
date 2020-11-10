<template>
  <form class="standard-entry-editor">
    <label for="standard-entry-editor__id">ID</label>
    <input id="standard-entry-editor__id" type="text" :value="id" readonly>
    <p v-if="error !== null" class="standard-entry-editor__error">
      The following error occurred while trying to read the translated file for this entry: {{ error }}
    </p>
    <label for="standard-entry-editor__name">
      Name
      <button v-if="locale !== 'en'" class="standard-entry-editor__action" type="button" @click="name = reference.root.name">
        Copy Original
      </button>
    </label>
    <input
      id="standard-entry-editor__name"
      v-model="name"
      type="text"
      :placeholder="locale !== 'en' ? reference.root.name : ''"
      :dir="textDirection"
    >
    <label for="standard-entry-editor__text">
      Text
      <button v-if="locale !== 'en'" class="standard-entry-editor__action" type="button" @click="text = reference.root.content">
        Copy Original
      </button>
    </label>
    <MarkdownEditor id="standard-entry-editor__text" :key="`${locale}-${id}-text`" v-model="text" :direction="textDirection" />
    <label for="standard-entry-editor__chapter">
      Chapter
      <button
        v-if="locale !== 'en'"
        class="standard-entry-editor__action"
        type="button"
        @click="chapter = reference.metadata.chapter"
      >
        Copy Original
      </button>
    </label>
    <MarkdownEditor
      id="standard-entry-editor__chapter"
      :key="`${locale}-${id}-chapter`"
      v-model="chapter"
      :direction="textDirection"
      inline
    />
    <portal to="toolbar">
      <div class="app__toolbar-buttons">
        <button type="button" class="app__toolbar-button" :disabled="!dirty" @click="save">
          Save
        </button>
      </div>
    </portal>
  </form>
</template>

<script>
import MarkdownEditor from '@/components/MarkdownEditor.vue'

export default {
  name: 'StandardEntryEditor',
  components: { MarkdownEditor },
  props: {
    type: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      name: null,
      text: null,
      chapter: null,
      initialName: null,
      initialText: null,
      initialChapter: null,
      error: null
    }
  },
  computed: {
    locale () {
      return this.$route.params.locale
    },
    id () {
      return this.$route.params.id
    },
    reference () {
      return window.getContent('en', this.type, this.id)
    },
    dirty () {
      return this.name?.trim() !== this.initialName || this.text?.trim() !== this.initialText || this.chapter?.trim() !== this.initialChapter
    },
    textDirection () {
      return window.getTextDirection(this.locale)
    }
  },
  watch: {
    id: {
      handler () {
        this.update()
      },
      immediate: true
    },
    locale () {
      this.update()
    }
  },
  mounted () {
    this.$store.commit(
      'setDirtyHandler',
      async (to, from, next) => {
        if (!this.dirty) {
          this.$store.commit('removeDirtyHandler')
          next()
          return
        }

        try {
          const { data: action } = await this.$dialog.confirm(
            { title: 'Unsaved changes', body: 'Do you want to save or discard your changes before navigating away?' },
            { view: 'save', cancelText: 'Cancel' }
          )

          if (action === 'save') {
            this.save()
          }

          this.$store.commit('removeDirtyHandler')
          next()
        } catch {
          next(false)
        }
      }
    )
  },
  methods: {
    update () {
      let content
      try {
        content = window.getContent(this.locale, this.type, this.id)
        this.error = null
      } catch (e) {
        this.error = e.message

        return
      }

      if (content === null) {
        this.name = this.initialName = ''
        this.text = this.initialText = ''
        this.chapter = this.initialChapter = ''

        return
      }

      this.name = this.initialName = content.root.name ?? ''
      this.text = this.initialText = content.root.content ?? ''
      this.chapter = this.initialChapter = content.metadata.chapter ?? ''
    },
    save () {
      const chapter = (this.chapter ?? '').trim().length > 0 ? this.chapter : undefined

      window.saveContent(this.locale, this.type, this.id, { name: this.name, text: this.text, metadata: { chapter } })
      this.initialName = this.name
      this.initialText = this.text
      this.initialChapter = this.chapter

      if (this.locale === 'en') {
        this.$store.commit('reloadReference')
      }

      this.$emit('save')
    }
  }
}
</script>

<style lang="scss">
.standard-entry-editor {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;

  &__error {
    color: #f31f1f;
    margin: 0 0 0.5rem;
  }

  label {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 0.125rem;
    margin-left: 0.25rem;
  }

  input[type=text], textarea, .markdown-editor {
    margin-bottom: 0.5rem;
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
  }
}
</style>
