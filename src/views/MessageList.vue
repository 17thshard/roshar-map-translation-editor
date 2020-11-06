<template>
  <div class="message-list">
    <portal to="header">
      <h2>
        <router-link
          class="message-list__breadcrumb-link"
          :to="{ name: 'locale.messages', params: $route.params, query: { ...$route.query, basePath: '' } }"
          exact
        >
          Messages
        </router-link>
        <template v-for="pathSegment in pathSegments">
          <ChevronRightIcon :key="`${pathSegment.path}-icon`" size="1x" class="message-list__breadcrumb-icon" />
          <router-link
            :key="pathSegment.path"
            class="message-list__breadcrumb-link"
            :to="{ name: 'locale.messages', params: $route.params, query: { ...$route.query, basePath: pathSegment.path } }"
            exact
          >
            {{ pathSegment.name }}
          </router-link>
        </template>
      </h2>
    </portal>
    <portal to="sidebar">
      <router-link class="app__sidebar-action" :to="{ name: 'locale.statistics', params: { locale } } ">
        <ChevronsLeftIcon />
        Back
      </router-link>
      <h3>Entries</h3>
      <Navigation :key="`messages${basePath}`" :links="entries">
        <div class="message-list__filters">
          <input v-model="searchText" type="search" class="message-list__search" aria-label="Search" placeholder="Search...">
          <button
            type="button"
            :class="['message-list__include-type', 'message-list__filter-button', `message-list__include-type--${typeFilter}`]"
            :title="typeFilterLabel"
            @click="changeTypeFilter"
          />
          <button
            type="button"
            :class="['message-list__include-state', 'message-list__filter-button', `message-list__include-state--${stateFilter}`]"
            :title="stateFilterLabel"
            @click="changeStateFilter"
          />
          <router-link
            class="message-list__flat message-list__filter-button"
            :to="{ ...$route, query: {...$route.query, flat: !flat} }"
            :title="flat ? 'Display all entries' : 'Display directories'"
          >
            <ListIcon v-if="flat" size="1x" :stroke-width="3" />
            <FolderIcon v-else size="1x" :stroke-width="3" />
          </router-link>
        </div>
        <template v-slot:link="entry">
          <router-link
            v-if="entry.type === 'up'"
            class="message-list__entry message-list__entry--up"
            :to="{ name: 'locale.messages', params: $route.params, query: { ...$route.query, basePath: upPath } }"
            exact
          >
            <CornerLeftUpIcon size="1x" />
            Up
          </router-link>
          <router-link
            v-else-if="entry.type === 'entry'"
            class="message-list__entry"
            :to="{ name: `locale.messages.edit`, params: { ...$route.params, path: entry.id }, query: $route.query }"
          >
            <span :class="['message-list__entry-indicator', { 'message-list__entry-indicator--translated': entry.translated }]">
              ◆
            </span>
            <span v-if="entry.dirty" class="message-list__entry-dirty">
              *
            </span>
            <span class="message-list__entry-title">
              {{ entry.comment.name }}
            </span>
            <small v-if="!entry.comment.default" class="message-list__entry-id">
              {{ entry.id }}
            </small>
          </router-link>
          <span
            v-else-if="entry.type === 'directory-header'"
            class="message-list__directory-header"
          >
            <span v-if="entry.dirty" class="message-list__directory-header-dirty">
              *
            </span>

            {{ entry.comment.name }}

            <span
              v-if="entry.percentage !== undefined"
              :class="['navigation__tag', { 'navigation__tag--green': entry.percentage === 100 }]"
            >
              {{ `${entry.percentage}%` }}
            </span>
          </span>
          <router-link
            v-else
            class="message-list__directory"
            :to="{ name: 'locale.messages', params: $route.params, query: { ...$route.query, basePath: buildPath(entry.id) } }"
            exact
          >
            <span v-if="entry.dirty" class="message-list__directory-dirty">
              *
            </span>

            {{ entry.comment.name }}

            <span
              v-if="entry.percentage !== undefined"
              :class="['navigation__tag', { 'navigation__tag--green': entry.percentage === 100 }]"
            >
              {{ `${entry.percentage}%` }}
            </span>
          </router-link>
        </template>
      </Navigation>
    </portal>
    <router-view :locale-messages="localeBase" :original-locale-messages="originalLocaleBase" @input="update" />
    <portal to="toolbar">
      <div class="app__toolbar-buttons">
        <button type="button" class="app__toolbar-button" :disabled="!dirty" @click="save">
          Save
        </button>
      </div>
    </portal>
  </div>
</template>

<script>
import { ChevronRightIcon, ChevronsLeftIcon, CornerLeftUpIcon, FolderIcon, ListIcon } from 'vue-feather-icons'
import Navigation from '@/components/Navigation.vue'
import flat from 'flat'
import DeepDiff from 'deep-diff'

function getFromObject (object, path) {
  return (path === '' ? [] : path.split('.')).reduce((acc, key) => acc[key] ?? {}, object)
}

export default {
  name: 'MessageList',
  components: { Navigation, CornerLeftUpIcon, ChevronsLeftIcon, ListIcon, FolderIcon, ChevronRightIcon },
  data () {
    return {
      searchText: null,
      typeFilter: 'both',
      stateFilter: 'both',
      localeMessages: {},
      originalLocaleMessages: {}
    }
  },
  computed: {
    locale () {
      return this.$route.params.locale
    },
    basePath () {
      return this.$route.query.basePath ?? ''
    },
    pathSegments () {
      return this.basePath === '' ? [] : this.basePath.split('.').reduce((acc, segment, index) => {
        acc.path = `${acc.path}${index > 0 ? '.' : ''}${segment}`
        acc.segments.push({ name: this.$store.state.messageComments[acc.path]?.name ?? acc.path, path: acc.path })

        return acc
      }, { segments: [], path: '' }).segments
    },
    upPath () {
      const split = this.basePath.split('.')
      split.pop()

      return split.join('.')
    },
    flat () {
      return this.$route.query.flat ?? false
    },
    referenceBase () {
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

      return getFromObject(enhancedMessages, this.basePath)
    },
    localeBase () {
      return getFromObject(this.localeMessages, this.basePath)
    },
    originalLocaleBase () {
      return getFromObject(this.originalLocaleMessages, this.basePath)
    },
    entries () {
      const unfiltered = this.flat
        ? this.buildFlatEntries()
        : this.buildTreeEntries()

      const searchText = (this.searchText?.trim() ?? '').toLowerCase()

      const result = searchText.length > 0 || this.typeFilter !== 'both' || this.stateFilter !== 'both'
        ? unfiltered.filter(e =>
          (e.id.toLowerCase().includes(searchText) || e.comment.name.toLowerCase().includes(searchText)) && this.shouldInclude(e)
        )
        : unfiltered

      if (this.basePath !== '') {
        result.unshift({ type: 'up' })
      }

      return result
    },
    typeFilterLabel () {
      return ({
        both: 'Show translated & untranslated entries',
        translated: 'Show translated entries',
        untranslated: 'Show untranslated entries'
      })[this.typeFilter]
    },
    stateFilterLabel () {
      return ({
        both: 'Show all entries',
        dirty: 'Show changed entries',
        clean: 'Show unchanged entries'
      })[this.typeFilter]
    },
    dirty () {
      return DeepDiff(this.originalLocaleMessages, this.localeMessages) !== undefined
    }
  },
  watch: {
    locale: {
      handler (locale) {
        this.localeMessages = window.loadMessages(locale)
        this.originalLocaleMessages = window.loadMessages(locale)
      },
      immediate: true
    }
  },
  mounted () {
    this.$store.commit(
      'setDirtyHandler',
      async (to, from, next) => {
        if (to.name.startsWith('locale.messages') && to.params.locale === from.params.locale) {
          this.$store.commit('removeDirtHandler')
          next()
          return
        }

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
    update ({ path, value }) {
      const segments = path.split('.')
      const key = segments.pop()
      const container = segments.reduce(
        ({ acc, refAcc }, key) => acc[key] ?? this.$set(acc, key, Array.isArray(refAcc[key]) ? [] : {}),
        { acc: this.localeMessages, refAcc: this.$store.state.referenceMessages }
      ).acc

      this.$set(container, key, value)
    },
    save () {
      window.saveMessages(this.locale, this.localeMessages)

      this.originalLocaleMessages = JSON.parse(JSON.stringify(this.localeMessages))

      if (this.locale === 'en') {
        this.$store.commit('reloadReference')
      }
    },
    shouldInclude (entry) {
      return this.shouldIncludeType(entry) && this.shouldIncludeState(entry)
    },
    shouldIncludeType (entry) {
      if (this.typeFilter === 'translated') {
        return entry.type === 'entry' ? entry.translated === true : entry.percentage === 100
      } else if (this.typeFilter === 'untranslated') {
        return entry.type === 'entry' ? entry.translated === false : entry.percentage !== 100
      }

      return true
    },
    shouldIncludeState (entry) {
      if (this.stateFilter === 'dirty') {
        return entry.dirty
      } else if (this.stateFilter === 'clean') {
        return !entry.dirty
      }

      return true
    },
    changeTypeFilter () {
      this.typeFilter = ({ both: 'untranslated', untranslated: 'translated', translated: 'both' })[this.typeFilter]
    },
    changeStateFilter () {
      this.stateFilter = ({ both: 'dirty', dirty: 'clean', clean: 'both' })[this.stateFilter]
    },
    buildPath (path) {
      return this.basePath === '' ? path : `${this.basePath}.${path}`
    },
    buildComment (path) {
      return this.$store.state.messageComments[this.buildPath(path)] ?? { name: path, default: true }
    },
    calculatePercentage (path) {
      const reference = Object.keys(flat(getFromObject(this.referenceBase, path)))
      const translated = Object.keys(flat(getFromObject(this.localeBase, path) ?? {})).filter(e => reference.includes(e))

      return Math.floor(translated.length / reference.length * 100)
    },
    buildTreeEntries () {
      const entries = Object.keys(this.referenceBase).map((id) => {
        const reference = this.referenceBase[id]
        const translation = this.localeBase[id]
        const type = typeof reference !== 'object' ? 'entry' : 'directory'

        return {
          type,
          id,
          comment: this.buildComment(id),
          percentage: this.locale !== 'en' && typeof reference === 'object' ? this.calculatePercentage(id) : undefined,
          translated: type === 'entry' ? translation !== undefined : undefined,
          dirty: DeepDiff(this.originalLocaleBase[id], translation)
        }
      })

      return entries
    },
    buildFlatEntries () {
      const acc = []

      const builder = (id, obj, localeObj, originalLocaleObj) => {
        if (typeof obj !== 'object') {
          acc.push({
            type: 'entry',
            id,
            comment: this.buildComment(id),
            translated: localeObj !== undefined,
            dirty: localeObj !== originalLocaleObj
          })

          return
        }

        acc.push({
          type: 'directory-header',
          id,
          comment: this.buildComment(id),
          percentage: this.calculatePercentage(id),
          dirty: DeepDiff(originalLocaleObj, localeObj) !== undefined
        })

        Object.keys(obj).forEach(subId => builder(`${id}.${subId}`, obj[subId], (localeObj ?? {})[subId], (originalLocaleObj ?? {})[subId]))
      }

      Object.keys(this.referenceBase).forEach((id) => {
        builder(id, this.referenceBase[id], this.localeBase[id], this.originalLocaleBase[id])
      })

      return acc
    }
  }
}
</script>

<style lang="scss">
.message-list {
  &__breadcrumb-icon {
    color: rgba(#f6f7fc, 0.5);
    margin-left: -0.4rem;
    margin-right: -0.4rem;
    margin-bottom: -0.25rem;
  }

  &__breadcrumb-link {
    color: #f6f7fc;
    text-decoration: none;

    &:hover, &:active, &:focus {
      color: darken(#f6f7fc, 10%);
    }
  }

  &__filters {
    display: flex;
    box-sizing: border-box;
    padding: 0.5rem;
  }

  &__search {
    flex: 1;
    font-family: Whitney, sans-serif;
    color: #25364a;
    outline: 0;
    font-size: 1rem;
    box-sizing: border-box;
    border-radius: 3px;
    background: #f6f7fc;
    border: 1px solid #afb0b3;
    transition: border-color 0.2s ease-in-out;
    padding: 0.25rem 0.625rem;

    &:focus {
      border-color: #0261fa;
    }
  }

  &__filter-button {
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
    font-size: 1rem;
    border-radius: 3px;
    margin-left: 0.5rem;
    position: relative;
    width: 31px;

    &:hover, &:active, &:focus {
      background: lighten(#175199, 10%);
    }
  }

  &__include-type {
    &:before, &:after {
      content: '';
      position: absolute;
      width: 0.5rem;
      height: 1rem;
      border-top: 0.5rem solid transparent;
      border-bottom: 0.5rem solid transparent;
      box-sizing: border-box;
    }

    &:before {
      border-right: 0.5rem solid;
      margin-left: -0.25rem;
    }

    &:after {
      border-left: 0.5rem solid;
      margin-left: 0.25rem;
    }

    &--both {
      &:before {
        border-right-color: #628d21;
      }

      &:after {
        border-left-color: #f31f1f;
      }
    }

    &--translated {
      &:before {
        border-right-color: #628d21;
      }

      &:after {
        border-left-color: #628d21;
      }
    }

    &--untranslated {
      &:before {
        border-right-color: #f31f1f;
      }

      &:after {
        border-left-color: #f31f1f;
      }
    }
  }

  &__include-state {
    &:before {
      content: '*';
      font-weight: 700;
      font-size: 2rem;
      line-height: 1rem;
      margin-bottom: -0.5rem;
    }

    &--both:before {
      opacity: 0.5;
    }

    &--clean:after {
      position: absolute;
      content: '';
      background: #f31f1f;
      width: 1rem;
      height: 2px;
      transform: rotate(-45deg);
    }
  }

  &__directory-header {
    display: flex;
    align-items: center;
    color: #f6f7fc;
    text-decoration: none;
    padding: 0.25rem 0.5rem;
    font-weight: 600;
    background: #061426;
  }

  &__directory, &__directory-header {
    &-dirty {
      grid-column: 1;
      grid-row: 2;
      font-weight: 700;
      font-size: 1.5rem;
      line-height: 1rem;
      margin-bottom: -0.5rem;
      margin-right: 0.25rem;
    }
  }

  &__entry {
    display: grid !important;
    grid-template-columns: 10px 1fr;
    grid-template-rows: auto auto;
    grid-column-gap: 0.25rem;

    &--up .feather {
      margin-left: -0.25rem;
    }

    &-indicator {
      align-self: flex-start;
      margin-top: 0.15em;
      font-size: 0.75em;
      color: #f31f1f;

      &--translated {
        color: #628d21;
      }
    }

    &-dirty {
      grid-column: 1;
      grid-row: 2;
      font-weight: 700;
      font-size: 1.5rem;
      line-height: 1rem;
      margin-bottom: -0.5rem;
    }

    &-title {
      text-overflow: ellipsis;
      grid-column: 2;
    }

    &-id {
      grid-row: 2;
      grid-column: 2;
      font-size: 0.8em;
      color: rgba(#f6f7fc, 0.8);
      font-weight: 500;
      text-overflow: ellipsis;
    }
  }
}
</style>
