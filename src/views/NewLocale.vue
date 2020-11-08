<template>
  <form ref="form" class="new-locale" @submit.prevent="save">
    <portal to="header">
      <h2>Create new language</h2>
    </portal>
    <label for="new-locale__code">
      Code
      <small>
        This is the internal locale code of the new language option. Generic language code and country are separated by a dash. Consult
        <ExternalLink href="https://saimana.com/list-of-country-locale-code/">this non-exhaustive list</ExternalLink>
        of available options.
      </small>
    </label>
    <input id="new-locale__code" v-model="code" placeholder="en-US" type="text" required>
    <label for="new-locale__name">
      Name
      <small>This is the name of the language that is only going to be displayed in this editor.</small>
    </label>
    <input id="new-locale__name" v-model="name" placeholder="English (US)" type="text" required>
    <label for="new-locale__flag">
      Flag
      <small>This is the country whose flag will be displayed for the language in the editor. Can be left empty.</small>
    </label>
    <v-select
      v-model="flag"
      label="label"
      input-id="new-locale__flag"
      :options="availableFlags"
      :reduce="option => option.value"
      select-on-tab
    >
      <template v-slot:option="option">
        <Flag :name="option.value" />
        <span>{{ option.label }}</span>
      </template>
      <template v-slot:selected-option="option">
        <Flag :name="option.value" />
        <span>{{ option.label }}</span>
      </template>
    </v-select>
    <portal to="toolbar">
      <div class="app__toolbar-buttons">
        <router-link class="app__toolbar-button app__toolbar-button--cancel" :to="{ name: 'home' }" replace>
          Cancel
        </router-link>
        <button type="button" class="app__toolbar-button" @click="save">
          Create
        </button>
      </div>
    </portal>
  </form>
</template>

<script>
import ExternalLink from '@/components/ExternalLink.vue'
import availableFlags from '@/store/available-flags.json'
import Flag from '@/components/Flag.vue'

export default {
  name: 'NewLocale',
  components: { Flag, ExternalLink },
  data () {
    return {
      availableFlags: Object.keys(availableFlags).map(key => ({ value: key.toLowerCase(), label: availableFlags[key] })),
      code: '',
      name: '',
      flag: null
    }
  },
  methods: {
    async save () {
      if (this.code.trim().length === 0) {
        await this.$dialog.alert({
          title: 'Failed to create language',
          body: 'You must specify a language code!'
        })
        return
      }

      if (this.name.trim().length === 0) {
        await this.$dialog.alert({
          title: 'Failed to create language',
          body: 'You must specify a language name!'
        })
        return
      }

      try {
        window.createLanguage(this.code, this.name, this.flag ?? 'unknown')
      } catch (e) {
        await this.$dialog.alert({
          title: 'Failed to create language',
          body: `Could not create language for the following reason: ${e.message ?? e}`
        })
        return
      }

      await this.$dialog.alert({
        body: 'The new language was successfully created and can now be edited!'
      })

      await this.$router.replace({ name: 'home' })
    }
  }
}
</script>

<style lang="scss">
.new-locale {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;

  label {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 0.125rem;
    margin-left: 0.25rem;

    small {
      text-transform: none;
      font-weight: normal;
    }
  }

  input[type=text], textarea, .markdown-editor {
    margin-bottom: 0.5rem;
  }

  .vs__dropdown-toggle {
    background: #e1e2e6;
    padding: 0.625rem 0;
    box-sizing: border-box;
  }

  .vs__search, .vs__search:focus {
    font-size: 1rem;
    margin-top: 0;
    height: 23px;
  }

  .vs__selected, .vs__dropdown-option {
    display: flex;
    flex: 1;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    max-width: 100%;

    .flag {
      margin-right: 0.25rem;
    }

    span {
      flex: 1;
    }
  }

  .vs__selected {
    margin: 0;
  }

  .vs__dropdown-option {
    padding-left: 0.5rem;
  }
}
</style>
