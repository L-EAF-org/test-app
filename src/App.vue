<template>
  <div id="app" class="mb-4">
    <Header />
    <div class="container">
      <h1>L-EAF.org Test Centre</h1>
      <div v-if="showFacilitator">
        <Tests :socket="socket" />
        <Sections :socket="socket" />
        <Questions :socket="socket" />
      </div>
      <div v-if="!showFacilitator">
        <Test :socket="socket" />
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'

import params from './lib/params.js'

import Header from './components/Header.vue'
import Test from './components/Test.vue'
import Tests from './components/Tests.vue'
import Sections from './components/Sections.vue'
import Questions from './components/Questions.vue'

export default {
  name: 'App',
  components: {
    Header,
    Test,
    Tests,
    Sections,
    Questions
  },
  computed: {
    isHost() {
      return this.$store.getters.getHost
    },
    showFacilitator() {
      return this.$store.getters.getShowFacilitator
    }
  },
  created() {
    const self = this
    let host = '77.68.122.69'
    if (location.hostname == 'localhost') {
      host = 'localhost'
    }
    const connStr = 'http://' + host + ':3015'
    console.log('Connecting to: ' + connStr)
    this.socket = io(connStr)

    if (params.isParam('host')) {
      this.$store.dispatch('updateHost', true)
    }

    this.socket.emit('loadTests')
  },
  methods: {
  }
}
</script>

<style lang="scss">
.config-test-tests, .config-test-sections, .config-test-questions {
  width: 100%;
  margin: 12px;
  border: 1px solid #ccc;

  .toggle {
    color: #aaa;
    font-size: xx-large;

    &:hover {
      cursor: pointer;
    }
  }

  .left {
    text-align: left;
  }

  h4 {
    width: 50%;
    display: inline-block;
    text-align: left;
  }

  span, i.toggle {
    position: absolute;
    right: 6px;
  }

  td {
    vertical-align: top;
    position: relative;
    padding: 4px;
    text-align: left;

    &.center {
      text-align: center;
    }
    &.left-col {
      vertical-align: top;
    }
    .fa-edit, .fa-save, .fa-trash-alt, .fa-chevron-up, .fa-chevron-down {
      color: #888;
      font-size: x-large;
      margin: 4px;

      &:hover {
        cursor: pointer;
        color: #444;
      }
    }
  }

  input {
    height: 24px;
    padding: 2px;
    margin: 0 auto;
  }

  button {
    margin-left: 4px;
  }
}
</style>
