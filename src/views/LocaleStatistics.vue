<template>
  <div class="locale-statistics">
    <portal to="header">
      <h2>Statistics</h2>
    </portal>
    <portal to="sidebar">
      <h3>Entries</h3>
      <Navigation
        :links="[
          {
            text: 'Messages',
            target: 'messages',
            percentage: locale !== 'en' ? messagePercentage : 0
          },
          {
            text: 'Events',
            target: 'events',
            percentage: locale !== 'en' ? calculatePercentage('events') : 0
          },
          {
            text: 'Locations',
            target: 'locations',
            percentage: locale !== 'en' ? calculatePercentage('locations') : 0
          },
          {
            text: 'Characters',
            target: 'characters',
            percentage: locale !== 'en' ? calculatePercentage('characters') : 0
          },
          {
            text: 'Miscellaneous',
            target: 'misc',
            percentage: locale !== 'en' ? calculatePercentage('misc') : 0
          }
        ]"
      >
        <template v-slot:link="link">
          <router-link class="locale-statistics__navigation-link" :to="link.target">
            {{ link.text }}

            <span v-if="locale !== 'en'" :class="['navigation__tag', { 'navigation__tag--green': link.percentage === 100 }]">
              {{ `${link.percentage}%` }}
            </span>
          </router-link>
        </template>
      </Navigation>
    </portal>
  </div>
</template>

<script>
import Navigation from '@/components/Navigation.vue'
import flat from 'flat'

export default {
  name: 'LocaleStatistics',
  components: { Navigation },
  computed: {
    locale () {
      return this.$route.params.locale
    },
    messagePercentage () {
      const reference = Object.keys(flat(this.$store.state.referenceMessages))
      const translated = Object.keys(flat(window.loadMessages(this.locale))).filter(e => reference.includes(e))

      return Math.floor(translated.length / reference.length * 100)
    }
  },
  methods: {
    calculatePercentage (type) {
      const reference = this.$store.state.reference[type]
      const translated = reference.filter(e => window.isTranslated(this.locale, type, e))

      return Math.floor(translated.length / reference.length * 100)
    }
  }
}
</script>

<style lang="scss">
.locale-statistics {
  &__navigation-link {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
}
</style>
