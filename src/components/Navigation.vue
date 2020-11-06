<template>
  <nav class="navigation">
    <slot />
    <Scrollbar
      class="navigation__scroller"
      :ops="{
        vuescroll: { wheelScrollDuration: 400 },
        bar: { onlyShowBarOnScroll: false, keepShow: true, background: '#9faaaf', opacity: 0.5, size: '0.5rem' },
        rail: { size: '0.5rem', gutterOfSide: '0' }
      }"
    >
      <ul class="navigation__links">
        <li v-for="(link, index) in links" :key="`link${index}`" class="navigation__links-item">
          <slot name="link" v-bind="link" />
        </li>
      </ul>
    </Scrollbar>
  </nav>
</template>

<script>
import Scrollbar from 'vuescroll/dist/vuescroll-native'

export default {
  name: 'Navigation',
  components: { Scrollbar },
  props: {
    links: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="scss">
.navigation {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

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

  &__links {
    margin: 0;
    padding: 0;
    list-style-type: none;

    &-item {
      border-bottom: 1px solid rgba(#f6f7fc, 0.3);

      &:last-child {
        border-bottom: none;
      }

      a {
        display: flex;
        align-items: center;
        color: #f6f7fc;
        text-decoration: none;
        padding: 0.25rem 0.5rem;
        font-weight: 600;

        &:hover, &:focus, &:active {
          background: #0f3562;
        }

        &.router-link-active {
          background: #1b4b87;
        }
      }
    }
  }

  &__tag {
    display: inline-block;
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    background: #f31f1f;
    border-radius: 1rem;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.5);

    &--green {
      background: #628d21;
    }
  }
}
</style>
