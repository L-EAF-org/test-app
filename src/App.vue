<template>
  <div id="app" class="mb-4">
    <Header />
    <div class="container">
      <h1>L-EAF.org Test Centre</h1>
      <Test v-if="currentTab == 'test'" />
      <Results v-if="currentTab == 'results'" />
      <SetUp v-if="currentTab == 'setup'" />
    </div>
  </div>
</template>

<script>
import bus from './socket.js'

import params from './lib/params.js'

import Header from './components/Header.vue'
import Test from './components/Test.vue'
import Results from './components/Results.vue'
import SetUp from './components/SetUp.vue'

export default {
  name: 'App',
  components: {
    Header,
    Test,
    Results,
    SetUp
  },
  computed: {
    isHost() {
      return this.$store.getters.getHost
    },
    currentTab() {
      return this.$store.getters.getCurrentTab
    }
  },
  created() {
    if (params.isParam('host')) {
      this.$store.dispatch('updateHost', true)
    }

    bus.$on('loadOrganisations', (data) => {
      this.$store.dispatch('loadOrganisations', data)
    })

    bus.$on('loadStudents', (data) => {
      this.$store.dispatch('loadStudents', data)
    })

    bus.$on('loadTests', (data) => {
      this.$store.dispatch('loadTests', data)
    })

    bus.$on('loadSections', (data) => {
      this.$store.dispatch('loadSections', data)
    })

    bus.$on('loadQuestions', (data) => {
      this.$store.dispatch('loadQuestions', data)
    })

    bus.$emit('sendLoadTests')
    bus.$emit('sendLoadOrganisations')
  },
  methods: {
  }
}
</script>
