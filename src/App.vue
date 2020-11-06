<template>
  <div id="app" class="app">
    <aside v-if="$route.meta.hideSidebar !== true" class="app__sidebar">
      <div class="app__locale-selection">
        <label for="selected-locale">Active locale</label>
        <v-select
          label="name"
          input-id="selected-locale"
          :clearable="false"
          :options="$store.state.locales"
          :value="$store.state.locales.find(l => l.locale === $route.params.locale)"
          @input="$router.replace({ ...$route, params: { ...$route.params, locale: $event.locale } })"
        >
          <template v-slot:option="option">
            <Flag :name="option.flag" />
            <span>{{ option.name }}</span>
          </template>
          <template v-slot:selected-option="option">
            <Flag :name="option.flag" />
            <span>{{ option.name }}</span>
          </template>
        </v-select>
      </div>
      <router-link class="app__sidebar-action" :to="{ name: 'home' } ">
        <HomeIcon />
        Home
      </router-link>
      <portal-target v-if="$route.meta.hideHeader !== true" tag="section" class="app__navigation" name="sidebar" />
    </aside>
    <main class="app__content">
      <portal-target v-if="$route.meta.hideHeader !== true" tag="header" class="app__header" name="header" />
      <Scrollbar
        class="app__scroller"
        :ops="{
          vuescroll: { wheelScrollDuration: 400 },
          bar: { onlyShowBarOnScroll: false, keepShow: true, background: '#9faaaf', opacity: 0.5, size: '0.5rem' },
          rail: { size: '0.5rem', gutterOfSide: '0' }
        }"
      >
        <router-view class="app__route" />
      </Scrollbar>
      <portal-target v-if="$route.meta.toolbar === true" tag="footer" class="app__toolbar" name="toolbar" />
    </main>
  </div>
</template>

<script>
import Flag from '@/components/Flag.vue'
import Scrollbar from 'vuescroll/dist/vuescroll-native'
import { HomeIcon } from 'vue-feather-icons'

export default {
  components: { Flag, Scrollbar, HomeIcon }
}
</script>

<style lang="scss">
@font-face {
  font-family: Whitney;
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/whitney-300.woff);
  font-weight: 300;
}

@font-face {
  font-family: Whitney;
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/whitney-400.woff);
  font-weight: 400;
}

@font-face {
  font-family: Whitney;
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/whitney-500.woff);
  font-weight: 500;
}

@font-face {
  font-family: Whitney;
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/whitney-600.woff);
  font-weight: 600;
}

@font-face {
  font-family: Whitney;
  src: url(https://cdn.jsdelivr.net/gh/Tyrrrz/DiscordFonts@master/whitney-700.woff);
  font-weight: 700;
}

html, body {
  padding: 0;
  margin: 0;
  font-size: 16px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  display: flex;
  align-items: stretch;
}

button {
  font-family: Whitney, sans-serif;
}

input, textarea {
  min-width: 0;
  font-family: Whitney, sans-serif;
  color: #25364a;
  outline: 0;
  font-size: 1rem;

  &::placeholder {
    color: rgba(#25364a, 0.3);
  }

  &:-ms-input-placeholder {
    color: rgba(#25364a, 0.3);
  }

  &::-ms-input-placeholder {
    color: rgba(#25364a, 0.3);
  }
}

input[type=text], input[type=url], textarea {
  box-sizing: border-box;
  border-radius: 4px;
  background: #e1e2e6;
  border: 1px solid #afb0b3;
  transition: border-color 0.2s ease-in-out;
  padding: 0.625rem;

  &:focus {
    border-color: #175199;
  }

  &[readonly] {
    opacity: 0.5;
  }
}

textarea {
  resize: vertical;
  min-height: 500px;
}

.app {
  font-family: Whitney, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #25364a;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;

  &__sidebar {
    display: flex;
    flex-direction: column;
    background: #0a2649;
    color: #f6f7fc;
    box-sizing: border-box;
    width: 300px;

    .vs__dropdown-toggle {
      background: #f6f7fc;
    }

    &-action {
      display: flex;
      align-items: center;
      color: #f6f7fc;
      text-decoration: none;
      padding: 0.25rem 0.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;

      &:hover, &:focus, &:active {
        background: #0f3562;
      }

      .feather {
        margin-right: 0.5rem;
      }
    }
  }

  &__header {
    display: flex;
    background: #0f3562;
    padding: 0.5rem 1rem;
    color: #f6f7fc;
    height: 50px;
    box-sizing: border-box;

    h2 {
      font-weight: 600;
      margin: 0;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex: 1;
    background: #f6f7fc;
    overflow: hidden;
  }

  &__scroller {
    position: relative;
    min-height: 0;
    max-height: 100%;
  }

  .__rail-is-vertical {
    z-index: 61 !important;
  }

  .__panel {
    z-index: 60 !important;
  }

  .__view {
    z-index: 60 !important;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: auto !important;
  }

  &__route {
    flex: 1;
    max-width: 100%;
  }

  &__toolbar {
    display: flex;
    padding: 0.5rem 1rem;
    box-sizing: border-box;
    border-top: 1px solid #afb0b3;
    background: #e1e2e6;

    &-buttons {
      margin-left: auto;
    }

    &-button {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      appearance: none;
      outline: none;
      box-sizing: border-box;
      border: none;
      background: #0f3562;
      color: #f6f7fc;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      border-radius: 3px;
      margin-left: 0.5rem;
      position: relative;

      &:hover, &:active, &:focus {
        background: lighten(#0f3562, 10%);
      }

      &:disabled {
        opacity: 0.5;
        background: #0f3562 !important;
        cursor: not-allowed;
      }
    }
  }

  &__locale-selection {
    display: flex;
    align-items: center;
    padding: 0.5rem;

    label {
      margin-right: 0.5rem;
    }

    .v-select {
      flex: 1;
    }

    .vs__selected-options {
      overflow: hidden;
    }

    .vs__search {
      max-width: 0;
      padding: 0;
      margin: 0;
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

      &:after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 1rem;
        background: linear-gradient(90deg, rgba(#f6f7fc, 0) 0%, #f6f7fc 90%);
      }
    }

    .vs__dropdown-option {
      padding-left: 0.5rem;
    }
  }

  &__navigation {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
    flex: 1;

    h3 {
      margin: 0 0 0.25rem;
      padding: 0 0.5rem;
      font-size: 0.8em;
      font-weight: 600;
      text-transform: uppercase;
    }
  }
}
</style>
