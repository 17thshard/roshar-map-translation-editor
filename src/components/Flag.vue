<template>
  <svg v-if="name === 'unknown'" :class="['flag', { 'flag--large': large }]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600">
    <path d="M0 0l1000 600M0 600L1000 0" stroke="#BD1500" stroke-width="120" />
  </svg>
  <img
    v-else
    :class="['flag', { 'flag--large': large }]"
    :src="`https://cdn.staticaly.com/gh/hjnilsson/country-flags/master/svg/${name}.svg`"
    :alt="name"
  >
</template>

<script>
export default {
  name: 'Flag',
  props: {
    name: {
      type: String,
      required: true
    },
    large: Boolean
  }
}
</script>

<style lang="scss">
.flag {
  width: 32px;
  border-radius: 0.125rem;

  &--large {
    border-radius: 0.25rem;
    width: 64px;
  }
}
</style>
