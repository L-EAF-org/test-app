<template>
  <div class="test-questions">
    <div>
      Test:
      <select id="test-select" @change="loadTest()">
        <option value="">
          -- Select --
        </option>
        <option v-for="(t, index) in tests" :key="index" :value="t.id">
          {{ t.test }}
        </option>
      </select>
    </div>
    <h2>{{ test.test }}</h2>
    <div v-for="(section, sindex) in test.sections" :key="sindex">
      <h3>{{ section.section }}</h3>
      <div v-for="(question, qindex) in section.questions" :key="qindex">
        <div class="question">
          <h5>{{ question.question }}?</h5>
        </div>
        <table class="answers">
          <tr v-for="(answer, aindex) in question.answers" :key="aindex" class="answer">
            <td>
              <input type="checkbox">
            </td>
            <td>
              {{ answer.value }}
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'socket'
  ],
  computed: {
    test() {
      return this.$store.getters.getTest
    },
    tests() {
      return this.$store.getters.getTests
    },
    questions() {
      return this.$store.getters.getQuestions
    }
  },
  created() {
    this.socket.on('loadTests', (data) => {
      this.$store.dispatch('loadTests', data)
    })

    this.socket.on('loadTest', (data) => {
      this.$store.dispatch('loadTest', data)
    })
  },
  methods: {
    loadTest() {
      const id = document.getElementById('test-select').value
      this.socket.emit('loadTest', {id: id})
    }
  }
}
</script>

<style lang="scss">
  .test-questions {
    h3 {
      text-align: left;
    }
    h5 {
      margin-left: 24px;
      text-align: left;
    }
    .answers {
      text-align: left;
      margin-left: 48px;
    }
  }
</style>
