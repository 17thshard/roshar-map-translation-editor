<template>
  <a href="#" @click.prevent="open">
    <slot />
  </a>
</template>

<script>
export default {
  name: 'ExternalLink',
  props: {
    href: {
      type: String,
      required: true
    }
  },
  methods: {
    open () {
      window.openLink(this.href)
    }
  }
}
</script>
