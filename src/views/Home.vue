<template>
  <div class="home">
    <header>
      <img src="@/assets/roshar.png" alt="Logo" class="home__logo">
      <h1>Translation Editor</h1>
      <div class="home__working-directory">
        Working Directory: {{ workingDirectory }}
        <button type="button" @click="changeWorkingDirectory">
          Change
        </button>
      </div>
    </header>
    <h2>Select a language to edit</h2>
    <ul class="home__locales">
      <li v-for="locale in $store.state.locales" :key="locale.locale" class="home__locales-entry">
        <router-link :to="{ name: 'locale.statistics', params: { locale: locale.locale } }">
          <Flag :name="locale.flag" large />
          <h3>{{ locale.name }}</h3>
          <small>{{ locale.locale }}</small>
          <ChevronRightIcon />
        </router-link>
      </li>
      <li class="home__locales-entry home__locales-entry--new">
        <router-link :to="{ name: 'locale.new' }">
          <div class="home__locales-new-icon">
            <PlusCircleIcon size="1x" />
          </div>
          <h3>Create new language</h3>
          <ChevronRightIcon />
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { ChevronRightIcon, PlusCircleIcon } from 'vue-feather-icons'
import Flag from '@/components/Flag.vue'

export default {
  name: 'Home',
  components: { Flag, ChevronRightIcon, PlusCircleIcon },
  data () {
    return {
      workingDirectory: window.workingDirectory
    }
  },
  mounted () {
    this.$store.commit('reloadLocales')
  },
  methods: {
    changeWorkingDirectory () {
      if (window.changeWorkingDirectory()) {
        this.$store.commit('reloadLocales')
        this.workingDirectory = window.workingDirectory
      }
    }
  }
}
</script>

<style lang="scss">
.home {
  header {
    padding: 1rem;
    text-align: center;
    background: linear-gradient(#0a2649 0%, #031123 100%);
    color: #f6f7fc;

    h1 {
      margin: 0;
      font-weight: 600;
      font-size: 1.5em;
    }
  }

  &__logo {
    width: 50%;
    max-width: 400px;
  }

  h2 {
    font-size: 1.5em;
    margin: 0;
    padding: 0.5rem 1rem;
  }

  &__locales {
    list-style-type: none;
    margin: 0;
    padding: 0;

    &-entry {
      display: flex;

      a {
        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-template-rows: auto auto;
        align-items: center;
        grid-column-gap: 0.5rem;
        padding: 0.5rem 1rem;
        width: 100%;
        text-decoration: none;
        color: inherit;
        grid-auto-flow: column;

        &:hover, &:focus, &:active {
          background: rgba(#2c3e50, 0.2);
        }

        .flag {
          grid-row: 1/span 2;
        }

        h3 {
          padding: 0;
          margin: 0;
          font-weight: 700;
          font-size: 1.2em;
        }

        small {
          line-height: 1;
          font-weight: 600;
          color: rgba(#2c3e50, 0.6);
        }

        & > .feather {
          grid-column: 3;
          grid-row: 1/span 2;
        }
      }

      &--new {
        h3 {
          grid-row: 1/span 2;
        }
      }
    }
  }

  &__locales-new-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    grid-row: 1/span 2;
    font-size: 2rem;
  }

  &__working-directory button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    background: none;
    color: #f6f7fc;
    padding: 0;
    font-size: 1rem;
    border-radius: 3px;
    position: relative;
    text-decoration: underline;

    &:hover, &:active, &:focus {
      text-decoration: none;
      color: darken(#f6f7fc, 10%);
    }
  }
}
</style>
