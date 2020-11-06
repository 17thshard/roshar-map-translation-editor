<template>
  <form class="event-editor">
    <label for="event-editor__id">ID</label>
    <input id="event-editor__id" type="text" :value="id" readonly>
    <label for="event-editor__name">
      Name
      <button v-if="locale !== 'en'" class="event-editor__action" type="button" @click="name = reference.root.name">
        Copy Original
      </button>
    </label>
    <input id="event-editor__name" v-model="name" type="text" :placeholder="locale !== 'en' ? reference.root.name : ''">
    <label for="event-editor__blurb">
      Blurb
      <button v-if="locale !== 'en'" class="event-editor__action" type="button" @click="blurb = reference.root.content">
        Copy Original
      </button>
    </label>
    <MarkdownEditor id="event-editor__blurb" :key="`${locale}-${id}-blurb`" v-model="blurb" inline />
    <label for="event-editor__text">
      Details
      <button v-if="locale !== 'en'" class="event-editor__action" type="button" @click="text = reference.root.content">
        Copy Original
      </button>
    </label>
    <MarkdownEditor id="event-editor__text" :key="`${locale}-${id}-text`" v-model="text" />
    <label for="event-editor__chapter">
      Chapter
      <button v-if="locale !== 'en'" class="event-editor__action" type="button" @click="chapter = reference.metadata.chapter">
        Copy Original
      </button>
    </label>
    <MarkdownEditor id="event-editor__chapter" :key="`${locale}-${id}-chapter`" v-model="chapter" inline />
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
  name: 'EventEditor',
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
      blurb: null,
      text: null,
      chapter: null,
      initialName: null,
      initialBlurb: null,
      initialText: null,
      initialChapter: null
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
      return this.name?.trim() !== this.initialName || this.blurb?.trim() !== this.initialBlurb || this.text?.trim() !== this.initialText || this.chapter?.trim() !== this.initialChapter
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
          this.$store.commit('removeDirtHandler')
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

          this.$store.commit('removeDirtHandler')
          next()
        } catch {
          next(false)
        }
      }
    )
  },
  methods: {
    update () {
      const content = window.getContent(this.locale, this.type, this.id)

      if (content === null) {
        this.name = this.initialName = ''
        this.blurb = this.initialBlurb = ''
        this.text = this.initialText = ''
        this.chapter = this.initialChapter = ''

        return
      }

      this.name = this.initialName = content.root.name ?? ''
      this.blurb = this.initialBlurb = content.root.content ?? ''
      this.text = this.initialText = content.sections.details?.content ?? ''
      this.chapter = this.initialChapter = content.metadata.chapter ?? ''
    },
    save () {
      const chapter = (this.chapter ?? '').trim().length > 0 ? this.chapter : undefined
      const details = (this.text ?? '').trim().length > 0 ? this.text : undefined

      window.saveContent(this.locale, this.type, this.id, { name: this.name, blurb: this.blurb, details, metadata: { chapter } })
      this.initialName = this.name
      this.initialBlurb = this.blurb
      this.initialText = this.text
      this.initialChapter = this.chapter

      if (this.locale === 'en') {
        this.$store.commit('reloadReference')
      }
    }
  }
}
</script>

<style lang="scss">
.event-editor {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;

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
