<template>
  <div class="entry-list">
    <portal to="header">
      <h2>{{ title }}</h2>
    </portal>
    <portal to="sidebar">
      <router-link class="app__sidebar-action" :to="{ name: 'locale.statistics', params: { locale } } ">
        <ChevronsLeftIcon />
        Back
      </router-link>
      <h3>Entries</h3>
      <Navigation :key="type" :links="entries">
        <div class="entry-list__filters">
          <input v-model="searchText" type="search" class="entry-list__search" aria-label="Search" placeholder="Search...">
          <button
            type="button"
            :class="['entry-list__include-type', `entry-list__include-type--${typeFilter}`]"
            :title="typeFilterLabel"
            @click="changeTypeFilter"
          />
        </div>
        <template v-slot:link="entry">
          <router-link class="entry-list__entry" :to="{ name: `locale.${type}.edit`, params: { ...$route.params, id: entry.id } }">
            <span :class="['entry-list__entry-indicator', { 'entry-list__entry-indicator--translated': entry.translated }]">
              ◆
            </span>
            <span class="entry-list__entry-title">
              {{ entry.title }}
            </span>
            <small class="entry-list__entry-id">
              {{ entry.id }}
            </small>
          </router-link>
        </template>
      </Navigation>
    </portal>
    <router-view :type="type" />
  </div>
</template>

<script>
import { ChevronsLeftIcon } from 'vue-feather-icons'
import Navigation from '@/components/Navigation.vue'

export default {
  name: 'EntryList',
  components: { Navigation, ChevronsLeftIcon },
  props: {
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      searchText: null,
      typeFilter: 'both'
    }
  },
  computed: {
    locale () {
      return this.$route.params.locale
    },
    entries () {
      const base = this.$store.state.reference[this.type]
      const unfiltered = base.map(e => ({
        id: e,
        title: window.getTitle(this.locale, this.type, e),
        translated: window.isTranslated(this.locale, this.type, e)
      }))

      const searchText = (this.searchText?.trim() ?? '').toLowerCase()

      return searchText.length > 0 || this.typeFilter !== 'both'
        ? unfiltered.filter(e =>
          (e.id.toLowerCase().includes(searchText) || e.title.toLowerCase().includes(searchText)) && this.shouldInclude(e)
        )
        : unfiltered
    },
    typeFilterLabel () {
      return ({
        both: 'Show translated & untranslated entries',
        translated: 'Show translated entries',
        untranslated: 'Show untranslated entries'
      })[this.typeFilter]
    }
  },
  methods: {
    shouldInclude (entry) {
      if (this.typeFilter === 'translated') {
        return entry.translated === true
      } else if (this.typeFilter === 'untranslated') {
        return entry.translated === false
      }

      return true
    },
    changeTypeFilter () {
      this.typeFilter = ({ both: 'untranslated', untranslated: 'translated', translated: 'both' })[this.typeFilter]
    }
  }
}
</script>

<style lang="scss">
.entry-list {
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

  &__include-type {
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
    border-radius: 3px;
    margin-left: 0.5rem;
    position: relative;
    width: 31px;

    &:hover, &:active, &:focus {
      background: lighten(#175199, 10%);
    }

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

  &__entry {
    display: grid !important;
    grid-template-columns: 10px 1fr;
    grid-template-rows: auto auto;
    grid-column-gap: 0.25rem;

    &-indicator {
      align-self: flex-start;
      margin-top: 0.15em;
      font-size: 0.75em;
      color: #f31f1f;

      &--translated {
        color: #628d21;
      }
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
