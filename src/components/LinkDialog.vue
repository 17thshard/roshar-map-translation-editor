<template>
  <form class="link-dialog" @submit.prevent="submit">
    <div class="dg-content-body">
      <h2 class="dg-title">
        Create link
      </h2>
      <div class="dg-content">
        <label for="link-dialog__text">
          Text
        </label>
        <input id="link-dialog__text" ref="text" v-model="text" type="text">
        <label for="link-dialog__internal" class="link-dialog__internal">
          <input id="link-dialog__internal" v-model="internal" type="checkbox">
          Internal
        </label>
        <template v-if="internal">
          <label for="link-dialog__type">
            Type
          </label>
          <v-select
            v-model="internalType"
            input-id="link-dialog__type"
            :clearable="false"
            :options="[
              { value: 'events', label: 'Events' },
              { value: 'locations', label: 'Locations' },
              { value: 'characters', label: 'Characters' },
              { value: 'misc', label: 'Miscellaneous' }
            ]"
            :reduce="option => option.value"
          />
          <label for="link-dialog__entry">
            Entry
          </label>
          <v-select
            v-model="internalEntry"
            class="link-dialog__entry"
            input-id="link-dialog__entry"
            :clearable="false"
            :options="entryOptions"
            :reduce="option => option.value"
            :filter-by="(option, label, search) => label.toLowerCase().includes(search.toLowerCase()) || option.value.toLowerCase().includes(search.toLowerCase())"
          >
            <template v-slot:option="option">
              <span>{{ option.label }}</span>
              <small>{{ option.value }}</small>
            </template>
            <template v-slot:selected-option="option">
              <span>{{ option.label }}</span>
              <small>{{ option.value }}</small>
            </template>
          </v-select>
        </template>
        <template v-else>
          <label for="link-dialog__url">
            URL
          </label>
          <input id="link-dialog__url" v-model="url" type="url">
        </template>
      </div>
    </div>
    <div class="dg-buttons">
      <button type="button" class="dg-btn" @click="cancel">
        Cancel
      </button>
      <button type="submit" class="dg-btn dg-btn--primary dg-btn--pull-right" @click="submit">
        Insert
      </button>
    </div>
  </form>
</template>

<script>
import VueDialogMixin from 'vuejs-dialog/dist/vuejs-dialog-mixin.min'

export default {
  name: 'LinkDialog',
  mixins: [VueDialogMixin],
  data () {
    return {
      text: this.options.defaultText,
      internal: true,
      internalType: 'events',
      internalEntry: window.store.state.reference.events[0],
      url: null
    }
  },
  computed: {
    entryOptions () {
      return window.store.state.reference[this.internalType].map(e => ({
        value: e,
        label: window.getTitle(window.router.app.$route.params.locale, this.internalType, e)
      }))
    }
  },
  watch: {
    internalType (newType) {
      this.internalEntry = window.store.state.reference[newType][0]
    }
  },
  mounted () {
    this.$refs.text.focus()
  },
  methods: {
    submit () {
      const url = this.internal ? `${this.internalType}/${this.internalEntry}` : this.url
      this.proceed({ internal: this.internal, title: this.text, url })
    }
  }
}
</script>

<style lang="scss">
.link-dialog {
  .dg-content {
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
  }

  label {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 0.125rem;
    margin-left: 0.25rem;
  }

  input[type=text], input[type=url], textarea, .markdown-editor {
    margin-bottom: 0.5rem;
    font-size: 14px;
    line-height: 1;
    padding: 0.375rem 0.625rem;
  }

  &__internal {
    display: flex;
    align-items: center;

    input {
      padding: 0;
      margin: 0 0.25rem 0 0;
    }
  }

  .v-select {
    margin-bottom: 0.125rem;
  }

  .vs__selected-options {
    overflow: hidden;
  }

  .vs__search {
    max-width: 0;
  }

  .vs__dropdown-toggle {
    background: #e1e2e6;
  }

  .vs__dropdown-option {
    padding-left: 0.5rem;
  }

  &__entry {
    .vs__selected, .vs__dropdown-option {
      align-items: baseline;
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      span {
        font-weight: 600;
      }

      small {
        margin-left: 0.25rem;
      }
    }
  }
}
</style>
