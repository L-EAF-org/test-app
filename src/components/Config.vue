<template>
  <table class="config-test-config">
    <tr>
      <td>
        <h4>Config</h4>
        <i v-if="showTestConfig" @click="setShowTestConfig(false)" title="collapse" class="fas fa-caret-up toggle" />
        <i v-if="!showTestConfig" @click="setShowTestConfig(true)" title="expand" class="fas fa-caret-down toggle" />
      </td>
    </tr>
    <tr v-if="showTestConfig" class="message-params">
      <td>
        Config Here
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  props: [
    'socket'
  ],
  data() {
    return {
      showTestConfig: false
    }
  },
  computed: {
  },
  methods: {
    setShowTestConfig(val) {
      this.showTestConfig = val
    }
  }
}
</script>
