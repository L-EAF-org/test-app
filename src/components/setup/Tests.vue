<template>
  <table class="config-test-tests">
    <tr>
      <td>
        <h4>Tests</h4>
        <i v-if="showTestTests" @click="setShowTestTests(false)" title="collapse" class="fas fa-caret-up toggle" />
        <i v-if="!showTestTests" @click="setShowTestTests(true)" title="expand" class="fas fa-caret-down toggle" />
      </td>
    </tr>
    <tr v-if="showTestTests">
      <td>
        <table>
          <tr>
            <td colspan="2">
              New Test <input type="text" class="new-test" id="new-test">
              <button class="btn btn-sm btn-site-primary" @click="addTest()">
                Add
              </button>
            </td>
          </tr>
          <tr v-for="(test, index) in tests" :key="index">
            <td>
              <i @click="updateTest(test.id)" :title="'Update ' + test.test + ' Name'" class="fas fa-save" />
              <i @click="deleteTest(test.id)" :title="'Delete ' + test.test" class="fas fa-trash-alt" />
            </td>
            <td>
              <input type="text" :value="test.test" :id="'test-' + test.id">
            </td>
          </tr>
        </table>
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
      showTestTests: false
    }
  },
  computed: {
    tests() {
      return this.$store.getters.getTests
    }
  },
  methods: {
    setShowTestTests(val) {
      this.showTestTests = val
    },
    addTest() {
      const test = document.getElementById('new-test').value
      if (!test) {
        alert('Please enter a value')
      } else {
        this.socket.emit('addTest', {test: test})
        document.getElementById('new-test').value = ''
      }
    },
    updateTest(id) {
      const test = document.getElementById('test-' + id).value
      if (!test) {
        alert('Please enter a value')
      } else {
        this.socket.emit('updateTest', {testId: id, test: test})
      }
    },
    deleteTest(id) {
      this.socket.emit('deleteTest', {testId: id})
    }
  }
}
</script>

<style lang="scss">
  .config-test-tests {

    .new-test {
      width: 200px !important;
    }

    input[type=text] {
      width: 200px;
    }
  }
</style>
